import { GameType } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import type { Game } from "../types/types";

const createChessGame = async (player1Id: string, player2Id: string, game_type: string, game_time: number): Promise<Game | null> => {
    try {
        const whitePlayerId = Math.random() > 0.5 ? player1Id : player2Id;
        const blackPlayerId = whitePlayerId === player1Id ? player2Id : player1Id;

        const game = await prisma.$transaction(async (tx) => {
            const game = await tx.game.create({
                data: {
                    blackPlayerId: blackPlayerId,
                    whitePlayerId: whitePlayerId,
                    timeControl: game_time,
                    whiteTimeLeft: game_time,
                    blackTimeLeft: game_time,
                    gameType: game_type as GameType,
                    status: "PLAYING",
                    turnStartedAt: BigInt(Date.now())
                },
                include: {
                    blackPlayer: {
                        select: {
                            username: true,
                            avatarUrl: true,
                            country: true,
                            chessProfile: {
                                select: {
                                    blitzRating: true,
                                    rapidRating: true
                                }
                            }
                        }
                    },
                    whitePlayer: {
                        select: {
                            username: true,
                            avatarUrl: true,
                            country: true,
                            chessProfile: {
                                select: {
                                    blitzRating: true,
                                    rapidRating: true
                                }
                            }
                        }
                    }
                }
            });

            return game;
        });

        const { chessProfile: whiteProfile, ...whitePlayer } = game.whitePlayer || {};
        const { chessProfile: blackProfile, ...blackPlayer } = game.blackPlayer || {};

        const result = {
            ...game,
            turnStartedAt: Number(game.turnStartedAt),
            whitePlayer: {
                ...whitePlayer,
                ...(whiteProfile || {})
            },
            blackPlayer: {
                ...blackPlayer,
                ...(blackProfile || {})
            }
        };

        return result as unknown as Game;
    } catch (error) {
        console.error("Failed to create chess game:", error);
        return null;
    }
};

const fetchGameById = async (gameId: string): Promise<Game | null> => {
    try {
        const game = await prisma.game.findUnique({
            where: { id: gameId },
            include: {
                blackPlayer: true,
                whitePlayer: true
            }
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
        const data = await prisma.$transaction(async (tx) => {

            const game = await tx.game.findUnique({
                where: {
                    id: gameId
                }
            });

            if (!game || game.status !== "PLAYING") {
                return null;
            }

            const wonColor = game.whitePlayerId === playerId ? "B" : "W";

            const updatedGame = await tx.game.update({
                where: {
                    id: gameId
                },
                data: {
                    status: "COMPLETED",
                    result: wonColor === "B"
                        ? "BLACK_WIN"
                        : "WHITE_WIN",
                    endReason: "RESIGNATION"
                }
            });

            if (!updatedGame) {
                return null;
            }

            const whitePlayerId = game.whitePlayerId;
            const blackPlayerId = game.blackPlayerId;

            await tx.chessProfile.update({
                where: {
                    userId: blackPlayerId
                },
                data: {
                    totalGames: {
                        increment: 1
                    },
                    ...(wonColor === "B"
                        ? {
                            totalBlackWins: {
                                increment: 1
                            }
                        }
                        : {
                            totalGamesLost: {
                                increment: 1
                            }
                        })
                }
            });

            await tx.chessProfile.update({
                where: {
                    userId: whitePlayerId
                },
                data: {
                    totalGames: {
                        increment: 1
                    },
                    ...(wonColor === "W"
                        ? {
                            totalWhiteWins: {
                                increment: 1
                            }
                        }
                        : {
                            totalGamesLost: {
                                increment: 1
                            }
                        })
                }
            });

            return updatedGame;
        });

        if (!data) {
            return null;
        }

        return {
            ...data,
            turnStartedAt: Number(data.turnStartedAt)
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