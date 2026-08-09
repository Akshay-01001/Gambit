import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { sendError, sendSuccess } from "../utils/apiResponse";
import { createGameSchema } from "../utils/validations";

const createGame = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return sendError(res, {
                code: "UNAUTHORIZED",
                message: "Unauthorized",
            });
        }

        // Validate request body
        const { error, value } = createGameSchema.validate(req.body);

        if (error) {
            return sendError(res, {
                statusCode: 400,
                code: "VALIDATION_ERROR",
                message: error.details[0].message,
            });
        }

        const {
            piece_color,
            game_type,
            game_time,
        } = value;

        // Assign the creator to the requested color
        const playerData =
            piece_color === "white"
                ? { whitePlayerId: userId }
                : { blackPlayerId: userId };

        const createdGame = await prisma.game.create({
            data: {
                ...playerData,

                gameType: game_type,
                status: "WAITING",

                // Initial clock duration
                timeControl: game_time,

                // Both players start with the full clock
                whiteTimeLeft: game_time,
                blackTimeLeft: game_time,
            },
        });

        return sendSuccess(res, {
            statusCode: 201,
            data: createdGame,
        });
    } catch (error) {
        console.error("Create game error:", error);

        const errorMessage =
            error instanceof Error
                ? error.message
                : "Something went wrong";

        return sendError(res, {
            code: "INTERNAL_ERROR",
            message: errorMessage,
        });
    }
};

export {
    createGame
};
