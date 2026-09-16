import { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/apiResponse";
import { prisma } from "../lib/prisma";
import { uploadImageToCloudinary } from "../utils/cloudinary";

const getUserDetails = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return sendError(res, {
                statusCode: 401,
                message: "Unathorized"
            });
        }

        const userDetails = await prisma.user.findFirst({
            where: {
                id: userId,
                isDeleted: false
            },
            include: {
                auth: {
                    select: {
                        isVerified: true
                    }
                },
                chessProfile: true,
                _count: {
                    select: {
                        whiteGames: true,
                        blackGames: true
                    }
                }
            }
        });

        if (!userDetails) {
            return sendError(res, {
                statusCode: 401,
                message: "Unathorized"
            });
        }

        const { auth, _count, ...user } = userDetails;

        const result = {
            ...user,
            totalWhiteGames: _count.whiteGames,
            totalBlackGames: _count.blackGames,
            isVerified: auth?.isVerified
        }

        return sendSuccess(res, {
            statusCode: 200,
            message: "User details fetched succcessfully",
            data: result
        });

    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Something went wrong";
        return sendError(res, {
            statusCode: 500,
            message: errorMessage,
        });
    }
};

const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return sendError(res, {
                statusCode: 401,
                message: "Unauthorized",
            });
        }

        const { username, country, bio } = req.body;

        let avatarUrl = undefined;
        let avatarPublicId = undefined;

        if (req.file) {
            const data = await uploadImageToCloudinary(req.file.buffer, req.file.mimetype);
            avatarUrl = data.url;
            avatarPublicId = data.publicId;
        }

        if (username) {
            const existUsername = await prisma.user.findFirst({
                where: {
                    username,
                    id: { not: userId }
                }
            });

            if (existUsername) {
                return sendError(res, {
                    statusCode: 400,
                    message: "Username already taken"
                });
            }
        }

        const updateData: any = {};
        if (username !== undefined) updateData.username = username;
        if (country !== undefined) updateData.country = country;
        if (bio !== undefined) updateData.bio = bio;
        if (avatarUrl !== undefined) {
            updateData.avatarUrl = avatarUrl;
            updateData.avatarPublicId = avatarPublicId;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: {
                auth: { select: { isVerified: true } },
                chessProfile: true,
                _count: {
                    select: { whiteGames: true, blackGames: true }
                }
            }
        });

        const { auth, _count, ...user } = updatedUser;
        const result = {
            ...user,
            totalWhiteGames: _count.whiteGames,
            totalBlackGames: _count.blackGames,
            isVerified: auth?.isVerified
        }

        return sendSuccess(res, {
            statusCode: 200,
            message: "Profile updated successfully",
            data: result
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        return sendError(res, {
            statusCode: 500,
            message: errorMessage,
        });
    }
};

export {
    getUserDetails,
    updateProfile
};
