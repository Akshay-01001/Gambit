import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { sendOtpMail } from "../services/mail.service";
import { sendError, sendSuccess } from "../utils/apiResponse";

export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return sendError(res, {
                statusCode: 400,
                message: "Email is required",
            });
        }

        // Check if a valid OTP already exists
        const existingOtp = await prisma.otp.findFirst({
            where: {
                email,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });

        if (existingOtp) {
            return sendError(res, {
                statusCode: 400,
                message: "OTP already sent. Please wait before requesting another.",
            });
        }

        // Remove all expired OTPs from the database to keep it clean
        await prisma.otp.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP
        await prisma.otp.create({
            data: {
                email,
                otp,
                expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes
            },
        });

        try {
            await sendOtpMail(email, otp);
        } catch (err) {
            // Roll back stored OTP if email sending fails
            await prisma.otp.deleteMany({
                where: {
                    email,
                },
            });

            throw err;
        }

        return sendSuccess(res, {
            statusCode: 200,
            message: "OTP sent successfully",
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

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        const existingOtp = await prisma.otp.findFirst({
            where: {
                email,
                otp,
                expiresAt: {
                    gt: new Date()
                }
            }
        });

        if (!existingOtp) {
            throw new Error("Invalid Otp")
        }

        await prisma.otp.deleteMany({
            where: {
                email,
                otp
            }
        });

        // Set isVerified to true for the user's Auth record
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            await prisma.auth.update({
                where: { userId: user.id },
                data: { isVerified: true }
            });
        }

        return sendSuccess(res, {
            statusCode: 200,
            message: "OTP Verified Successfully!!"
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Something went wrong";
        return sendError(res, {
            code: "INTERNAL_ERROR",
            message: errorMessage,
        });
    }
}
