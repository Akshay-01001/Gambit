import { GameType } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import type { Game } from "../types/types";

/**
 * Create a new chess game in the database.
 * Randomly assigns white/black and returns the typed Game object (not a JSON string).
 */
const createChessGame = async (player1Id: string, player2Id: string, game_type: string, game_time: number): Promise<Game | null> => {
    try {
        const whitePlayer = Math.random() > 0.5 ? player1Id : player2Id;
        const blackPlayer = whitePlayer === player1Id ? player2Id : player1Id;

        const game = await prisma.$transaction(async (tx) => {
            const game = tx.game.create({
                data: {
                    blackPlayerId: blackPlayer,
                    whitePlayerId: whitePlayer,
                    timeControl: game_time,
                    whiteTimeLeft: game_time,
                    blackTimeLeft: game_time,
                    gameType: game_type as GameType,
                    status: "PLAYING",
                    turnStartedAt: BigInt(Date.now())
                }
            });

            return game;
        });

        return {
            ...game,
            turnStartedAt: Number(game.turnStartedAt)
        } as unknown as Game;
    } catch (error) {
        console.error("Failed to create chess game:", error);
        return null;
    }
};

/**
 * Fetch a game from the database by ID.
 * Used when the game is not in memory (e.g., after server restart during a running game).
 */
const fetchGameById = async (gameId: string): Promise<Game | null> => {
    try {
        const game = await prisma.game.findUnique({
            where: { id: gameId }
        });

        if (!game) return null;

        return {
            ...game,
            turnStartedAt: Number(game.turnStartedAt)
        } as unknown as Game;
    } catch (error) {
        console.error("Failed to fetch game from database:", error);
        return null;
    }
};

const resignGame = async (gameId: string, playerId: string): Promise<Game | null> => {
    try {
        const game = await prisma.game.findUnique({
            where: {
                id: gameId
            }
        });

        if (!game || game.status !== "PLAYING") {
            return null;
        }

        const wonColor = game.whitePlayerId === playerId ? "B" : "W";

        const updatedGame = await prisma.game.update({
            where: {
                id: gameId
            },
            data: {
                status: "COMPLETED",
                result: wonColor === "B" ? "BLACK_WIN" : "WHITE_WIN",
                endReason: "RESIGNATION"
            }
        });

        return {
            ...updatedGame,
            turnStartedAt: Number(updatedGame.turnStartedAt)
        } as unknown as Game;
    } catch (error) {
        console.error("Failed to resign the game", error);
        return null;
    }
};

export {
    createChessGame,
    fetchGameById,
    resignGame
};