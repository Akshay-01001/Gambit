import { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/apiResponse";
import { prisma } from "../lib/prisma";

const getUserDetails = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return sendError(res, {
                code: "UNAUTHORIZED",
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
                code: "UNAUTHORIZED",
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
            code: "INTERNAL_ERROR",
            message: errorMessage,
        });
    }
};

export {
    getUserDetails
};
