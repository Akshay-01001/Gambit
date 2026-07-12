import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { registerSchema, loginSchema } from "../utils/validations";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { generateTokenPair } from "../utils/tokens";
import { prisma } from "../lib/prisma";

export const registerUser = async (req: Request, res: Response) => {
    try {
        // 1. Validate request body
        const { error, value } = registerSchema.validate(req.body);

        if (error) {
            return sendError(res, {
                code: "VALIDATION_ERROR",
                message: error.details[0].message || "Validation Error",
            });
        }

        const { email, password } = value;

        // 2. Check if a user already exists with this email
        const existingAuth = await prisma.auth.findFirst({
            where: {
                user: { email },
                provider: "LOCAL",
            },
        });

        if (existingAuth) {
            return sendError(res, {
                code: "CONFLICT",
                message: "An account already exists with this email",
            });
        }

        // 3. Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // 4. Create User + Auth records atomically in a transaction
        const { user, auth } = await prisma.$transaction(async (tx) => {
            // Create the user profile
            const user = await tx.user.create({
                data: {
                    email,
                    username: email.split("@")[0], // temporary username from email
                },
            });

            // Create the auth record linked to the user
            const auth = await tx.auth.create({
                data: {
                    userId: user.id,
                    passwordHash,
                    provider: "LOCAL",
                    isVerified: false,
                },
            });

            // Create an empty chess profile for the user
            await tx.chessProfile.create({
                data: {
                    userId: user.id,
                },
            });

            return { user, auth };
        });

        // 5. Generate access + refresh token pair
        const { accessToken, refreshToken } = generateTokenPair({
            userId: user.id,
            email: user.email,
        });

        // 6. Persist the refresh token in the database
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        // 7. Set tokens as HttpOnly cookies
        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            maxAge: 30 * 60 * 1000, // 30 minutes
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // 8. Return success
        return sendSuccess(res, {
            statusCode: 201,
            message: "Account created successfully",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    isVerified: auth.isVerified,
                },
            },
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Something went wrong";
        return sendError(res, {
            code: "INTERNAL_ERROR",
            message: errorMessage,
        });
    }
};


export const loginUser = async (req: Request, res: Response) => {
    try {
        // 1. Validate with loginSchema (not registerSchema)
        const { error, value } = loginSchema.validate(req.body);

        if (error) {
            return sendError(res, {
                code: "VALIDATION_ERROR",
                message: error.details[0].message || "Validation Error",
            });
        }

        const { email, password } = value;

        // 2. Find Auth record + join User (Auth has the password, User has email/isDeleted)
        const authRecord = await prisma.auth.findFirst({
            where: {
                provider: "LOCAL",
                user: { email },
            },
            include: {
                user: true,  // pull in the related User row
            },
        });

        // Use a generic message to avoid leaking whether email exists
        if (!authRecord) {
            return sendError(res, {
                code: "UNAUTHORIZED",
                message: "Invalid email or password",
            });
        }

        // 3. Check if user account is soft-deleted
        if (authRecord.user.isDeleted) {
            return sendError(res, {
                code: "FORBIDDEN",
                message: "This account has been deactivated",
            });
        }

        // 4. Verify password
        if (!authRecord.passwordHash) {
            return sendError(res, {
                code: "UNAUTHORIZED",
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, authRecord.passwordHash);

        if (!isPasswordValid) {
            return sendError(res, {
                code: "UNAUTHORIZED",
                message: "Invalid email or password",
            });
        }

        // 5. Check email is verified
        if (!authRecord.isVerified) {
            return sendError(res, {
                code: "FORBIDDEN",
                message: "Please verify your email before logging in",
            });
        }

        // 6. Generate token pair
        const { accessToken, refreshToken } = generateTokenPair({
            userId: authRecord.userId,
            email,
        });

        // 7. Rotate refresh token — delete old ones, store the new one
        await prisma.refreshToken.deleteMany({
            where: { userId: authRecord.userId },
        });

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: authRecord.userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        // 8. Set HttpOnly cookies
        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            maxAge: 30 * 60 * 1000, // 30 minutes
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // 9. Return success
        return sendSuccess(res, {
            statusCode: 200,
            message: "Login successful",
            data: {
                user: {
                    id: authRecord.userId,
                    email: authRecord.user.email,
                    username: authRecord.user.username,
                    isVerified: authRecord.isVerified,
                },
            },
        });

    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Something went wrong";
        return sendError(res, {
            code: "INTERNAL_ERROR",
            message: errorMessage,
        });
    }
};