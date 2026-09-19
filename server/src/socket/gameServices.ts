import {
    GameType,
    GameTurn,
    GameResult,
    GameEndReason,
} from '../generated/prisma/enums';
import { prisma } from '../lib/prisma';
import type { Game, MoveData, EndGameData, PlayerInfo } from '../types/types';
import { calculateRatingChange, fieldByGameType } from './gameActions';

const playerSelect = {
    select: {
        username: true,
        avatarUrl: true,
        country: true,
        chessProfile: {
            select: {
                blitzRating: true,
                rapidRating: true,
                bulletRating: true,
            },
        },
    },
} as const;

function flattenPlayer(
    player: Record<string, unknown> | null | undefined,
): PlayerInfo | undefined {
    if (!player) return undefined;
    const { chessProfile, ...rest } = player;
    return { ...rest, ...(chessProfile || {}) } as PlayerInfo;
}

const createChessGame = async (
    player1Id: string,
    player2Id: string,
    game_type: string,
    game_time: number,
): Promise<Game | null> => {
    try {
        const whitePlayerId = Math.random() > 0.5 ? player1Id : player2Id;
        const blackPlayerId =
            whitePlayerId === player1Id ? player2Id : player1Id;

        const game = await prisma.game.create({
            data: {
                blackPlayerId,
                whitePlayerId,
                timeControl: game_time,
                whiteTimeLeft: game_time,
                blackTimeLeft: game_time,
                gameType: game_type as GameType,
                status: 'PLAYING',
                turnStartedAt: BigInt(Date.now()),
            },
            include: {
                blackPlayer: playerSelect,
                whitePlayer: playerSelect,
            },
        });

        return {
            ...game,
            turnStartedAt: Number(game.turnStartedAt),
            whitePlayer: flattenPlayer(
                game.whitePlayer as Record<string, unknown>,
            ),
            blackPlayer: flattenPlayer(
                game.blackPlayer as Record<string, unknown>,
            ),
        } as unknown as Game;
    } catch (error) {
        console.error('Failed to create chess game:', error);
        return null;
    }
};

const fetchGameById = async (gameId: string): Promise<Game | null> => {
    try {
        const game = await prisma.game.findUnique({
            where: { id: gameId },
            include: {
                blackPlayer: playerSelect,
                whitePlayer: playerSelect,
            },
        });

        if (!game) return null;

        return {
            ...game,
            turnStartedAt: Number(game.turnStartedAt),
            whitePlayer: flattenPlayer(
                game.whitePlayer as Record<string, unknown>,
            ),
            blackPlayer: flattenPlayer(
                game.blackPlayer as Record<string, unknown>,
            ),
        } as unknown as Game;
    } catch (error) {
        console.error('Failed to fetch game from database:', error);
        return null;
    }
};

const persistMove = async (gameId: string, data: MoveData): Promise<void> => {
    try {
        await prisma.game.update({
            where: { id: gameId },
            data: {
                fen: data.fen,
                pgn: data.pgn,
                turn: data.turn as GameTurn,
                moveCount: data.moveCount,
                whiteTimeLeft: data.whiteTimeLeft,
                blackTimeLeft: data.blackTimeLeft,
                turnStartedAt: BigInt(data.turnStartedAt),
            },
        });
    } catch (error) {
        console.error('Failed to persist move:', error);
        throw error;
    }
};

const endGame = async (
    gameId: string,
    data: EndGameData,
): Promise<Game | null> => {
    try {
        const txnResult = await prisma.$transaction(async (tx) => {
            const game = await tx.game.findUnique({
                where: { id: gameId },
            });

            if (!game || game.status !== 'PLAYING') {
                return null;
            }

            const whitePlayerId = game.whitePlayerId!;
            const blackPlayerId = game.blackPlayerId!;

            const updatedGame = await tx.game.update({
                where: { id: gameId },
                data: {
                    status: 'COMPLETED',
                    result: data.result as GameResult,
                    endReason: data.endReason as GameEndReason,
                    ...(data.fen !== undefined && { fen: data.fen }),
                    ...(data.pgn !== undefined && { pgn: data.pgn }),
                    ...(data.turn !== undefined && {
                        turn: data.turn as GameTurn,
                    }),
                    ...(data.moveCount !== undefined && {
                        moveCount: data.moveCount,
                    }),
                    ...(data.whiteTimeLeft !== undefined && {
                        whiteTimeLeft: data.whiteTimeLeft,
                    }),
                    ...(data.blackTimeLeft !== undefined && {
                        blackTimeLeft: data.blackTimeLeft,
                    }),
                    ...(data.turnStartedAt !== undefined && {
                        turnStartedAt: BigInt(data.turnStartedAt),
                    }),
                },
                include: {
                    blackPlayer: playerSelect,
                    whitePlayer: playerSelect,
                },
            });

            const game_field = fieldByGameType(game.gameType);

            if (!game_field) {
                return null;
            }

            const whiteRating =
                updatedGame.whitePlayer?.chessProfile?.[game_field] ?? 100;
            const blackRating =
                updatedGame.blackPlayer?.chessProfile?.[game_field] ?? 100;

            if (data.result === 'DRAW') {
                const whiteRatingChange = calculateRatingChange(
                    whiteRating,
                    blackRating,
                    0.5,
                );
                const blackRatingChange = calculateRatingChange(
                    blackRating,
                    whiteRating,
                    0.5,
                );
                await tx.chessProfile.update({
                    where: { userId: whitePlayerId },
                    data: {
                        totalGames: { increment: 1 },
                        totalGamesDraw: { increment: 1 },
                        [game_field]: { increment: whiteRatingChange }
                    },
                });
                await tx.chessProfile.update({
                    where: { userId: blackPlayerId },
                    data: {
                        totalGames: { increment: 1 },
                        totalGamesDraw: { increment: 1 },
                        [game_field]: { increment: blackRatingChange },
                    },
                });
            } else {
                const isWhiteWin = data.result === 'WHITE_WIN';
                const winnerId = isWhiteWin ? whitePlayerId : blackPlayerId;
                const loserId = isWhiteWin ? blackPlayerId : whitePlayerId;
                const winnerRating = isWhiteWin ? whiteRating : blackRating;
                const loserRating = isWhiteWin ? blackRating : whiteRating;
                const winField = isWhiteWin
                    ? 'totalWhiteWins'
                    : 'totalBlackWins';

                const winnerRatingChange = calculateRatingChange(
                    winnerRating,
                    loserRating,
                    1,
                );
                const loserRatingChange = calculateRatingChange(
                    loserRating,
                    winnerRating,
                    0,
                );

                await tx.chessProfile.update({
                    where: { userId: winnerId },
                    data: {
                        totalGames: { increment: 1 },
                        totalGamesWon: { increment: 1 },
                        [winField]: { increment: 1 },
                        [game_field]: { increment: winnerRatingChange },
                    },
                });

                await tx.chessProfile.update({
                    where: { userId: loserId },
                    data: {
                        totalGames: { increment: 1 },
                        totalGamesLost: { increment: 1 },
                        [game_field]: { increment: loserRatingChange },
                    },
                });
            }
            // Re-fetch game with updated player ratings
            const finalGame = await tx.game.findUnique({
                where: { id: gameId },
                include: {
                    blackPlayer: playerSelect,
                    whitePlayer: playerSelect,
                },
            });

            return finalGame;
        });

        if (!txnResult) return null;

        return {
            ...txnResult,
            turnStartedAt: Number(txnResult.turnStartedAt),
            whitePlayer: flattenPlayer(
                txnResult.whitePlayer as Record<string, unknown>,
            ),
            blackPlayer: flattenPlayer(
                txnResult.blackPlayer as Record<string, unknown>,
            ),
        } as unknown as Game;
    } catch (error) {
        console.error('Failed to end game:', error);
        return null;
    }
};

export { createChessGame, fetchGameById, persistMove, endGame };
