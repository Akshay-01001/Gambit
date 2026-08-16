import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { sendError, sendSuccess } from "../utils/apiResponse";

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

export {
    getUserRunningGame
};
