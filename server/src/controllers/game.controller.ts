import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { sendError, sendSuccess } from "../utils/apiResponse";
import { GameStatus } from "../generated/prisma/enums";

const getUserRunningGame = async (req: Request, res: Response) => {
    try {
        const userId = req?.user?.id;

        if (!userId) {
            sendError(res, {
                code: "UNAUTHORIZED",
                message: "Unauthorized",
            });
        }

        const existingGame = await prisma.game.findFirst({
            where: {
                OR: [
                    { blackPlayerId: userId },
                    { whitePlayerId: userId }
                ],
                status: {
                    in: ["PLAYING", "WAITING"]
                }
            }
        });

        if (existingGame) {
            return sendSuccess(res, {
                message: "Game Found",
                data: {
                    gameId: existingGame.id
                }
            });
        }

        return sendSuccess(res, {
            message: "No Game Found",
            data: null
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

const getUserPlayerGames = async(req: Request, res: Response) => {
    try {
        const userId = req?.user?.id;

        if (!userId) {
            return sendError(res, {
                code: "UNAUTHORIZED",
                message: "Unauthorized",
            });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;

        const totalItemsSkip = (page - 1) * limit;

        const where = {
            OR: [
                { whitePlayerId: userId },
                { blackPlayerId: userId },
            ],
            status: {
                notIn: [GameStatus.WAITING, GameStatus.PLAYING],
            },
        };

        const [result, totalItems] = await prisma.$transaction([
            prisma.game.findMany({
                skip: totalItemsSkip,
                take: limit,
                where,
                orderBy: {
                    createdAt: "desc",
                },
            }),

            prisma.game.count({
                where,
            }),
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        const serializedResult = result.map((game) => ({
            ...game,
            turnStartedAt: game.turnStartedAt?.toString()
        }));

        const paginatedData = {
            page,
            limit,
            total: totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            data: serializedResult,
        };

        return sendSuccess(res, {
            message: "Recent Games",
            data: paginatedData
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

export {
    getUserRunningGame,
    getUserPlayerGames
};
