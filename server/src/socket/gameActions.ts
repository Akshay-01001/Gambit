import { gameManager } from "./gameManager";
import { createChessGame, fetchGameById, resignGame } from "./gameServices";
import { SocketEvents } from "../types/socketEvents";
import { AuthenticatedWebSocket } from "./socket";
import { Chess } from "chess.js";
import { prisma } from "../lib/prisma";

export function findMatch(playerId: string, message: { payload: { game_type: string; game_time: number } }) {
    const player = gameManager.getPlayer(playerId);
    if (!player) return;

    if (player.gameId) {
        gameManager.safeSend(player.ws, {
            type: SocketEvents.ERROR,
            message: "You are already in a game"
        });
        return;
    }

    if (gameManager.getWaitingPlayers().has(playerId)) return;

    let opponentId: string | null = null;

    for (const [waitingId, prefs] of gameManager.getWaitingPlayers().entries()) {
        if (waitingId !== playerId && prefs.game_type === message.payload.game_type && prefs.game_time === message.payload.game_time) {
            opponentId = waitingId;
            break;
        }
    }

    if (opponentId) {
        gameManager.removeFromWaiting(opponentId);
        createGame(playerId, opponentId, message.payload.game_type, message.payload.game_time);
    } else {
        gameManager.addToWaiting(playerId, { game_type: message.payload.game_type, game_time: message.payload.game_time });

        setTimeout(() => {
            if (gameManager.getWaitingPlayers().has(playerId)) {
                gameManager.removeFromWaiting(playerId);

                const currentPlayer = gameManager.getPlayer(playerId);
                if (currentPlayer) {
                    gameManager.safeSend(currentPlayer.ws, { type: SocketEvents.NO_MATCH_FOUND });
                }
            }
        }, 30000);
    }
}

export async function createGame(player1Id: string, player2Id: string, game_type: string, game_time: number) {
    const player1 = gameManager.getPlayer(player1Id);
    const player2 = gameManager.getPlayer(player2Id);

    if (!player1?.ws || !player2?.ws) return;

    if (player1.ws.readyState !== player1.ws.OPEN ||
        player2.ws.readyState !== player2.ws.OPEN) {
        return;
    }

    try {
        const game = await createChessGame(player1Id, player2Id, game_type, game_time);
        if (!game) {
            gameManager.safeSend(player1.ws, { type: SocketEvents.ERROR, message: "Failed to create game" });
            gameManager.safeSend(player2.ws, { type: SocketEvents.ERROR, message: "Failed to create game" });
            return;
        }

        const gameId = game.id;

        player1.gameId = gameId;
        player2.gameId = gameId;

        gameManager.joinRoom(gameId, player1.ws);
        gameManager.joinRoom(gameId, player2.ws);
        gameManager.setGame(game);

        gameManager.broadcastToRoom(gameId, {
            type: SocketEvents.MATCH_CREATED,
            gameId: gameId,
            game: game
        });
    } catch (error) {
        console.error("Error creating game:", error);
    }
}

export async function handleRejoin(userId: string, gameId: string, ws: AuthenticatedWebSocket) {
    if (!gameId || typeof gameId !== 'string') {
        gameManager.safeSend(ws, { type: SocketEvents.ERROR, message: "Game ID is required" });
        return;
    }

    let game = gameManager.getGame(gameId);

    if (!game) {
        const dbGame = await fetchGameById(gameId);
        if (dbGame) {
            game = dbGame;
            gameManager.setGame(game);
        }
    }

    if (!game) {
        gameManager.safeSend(ws, { type: SocketEvents.ERROR, message: "Game not found" });
        return;
    }

    if (game.whitePlayerId !== userId && game.blackPlayerId !== userId) {
        gameManager.safeSend(ws, { type: SocketEvents.ERROR, message: "You are not a player in this game" });
        return;
    }

    const player = gameManager.getPlayer(userId);
    if (player) {
        player.gameId = gameId;
        player.disconnectedAt = null;
    }

    gameManager.joinRoom(gameId, ws);

    gameManager.broadcastToRoom(gameId, {
        type: SocketEvents.PLAYER_CONNECTED,
        player_id: userId
    });

    gameManager.safeSend(ws, {
        type: SocketEvents.GAME_STATE,
        game_state: game
    });
}

export async function makeMove(ws: AuthenticatedWebSocket, from: string, to: string, promotion?: string) {
    try {
        const userId = ws.user?.userId;
        if (!userId) {
            return gameManager.safeSend(ws, {
                type: SocketEvents.ERROR,
                message: "Unauthorized"
            });
        }

        // 1. Get the authoritative game state from the server's memory
        const game = gameManager.getPlayerGame(userId);
        if (!game) {
            return gameManager.safeSend(ws, { type: SocketEvents.ERROR, message: "Game not found" });
        }

        if (game.status !== "PLAYING") {
            return gameManager.safeSend(ws, { type: SocketEvents.ERROR, message: "Game is already finished" });
        }

        // 2. Verify it's actually this player's turn
        const isWhite = game.whitePlayerId === userId;
        const isBlack = game.blackPlayerId === userId;

        if (!isWhite && !isBlack) {
            return gameManager.safeSend(ws, { type: SocketEvents.ERROR, message: "You are not a player in this game" });
        }

        if ((isWhite && game.turn !== 'w') || (isBlack && game.turn !== 'b')) {
            return gameManager.safeSend(ws, { type: SocketEvents.ERROR, message: "Not your turn" });
        }

        // 3. Check if the player's time has expired before allowing the move
        const now = Date.now();
        const elapsed = now - game.turnStartedAt;
        const currentTimeLeft = isWhite ? game.whiteTimeLeft : game.blackTimeLeft;

        if (currentTimeLeft - elapsed <= 0) {
            // Player ran out of time — they lose
            const winner = isWhite ? "BLACK_WIN" : "WHITE_WIN";

            game.status = "COMPLETED";
            game.result = winner;
            game.endReason = "TIMEOUT";
            if (isWhite) {
                game.whiteTimeLeft = 0;
            } else {
                game.blackTimeLeft = 0;
            }

            gameManager.setGame(game);

            // Persist to DB
            await prisma.game.update({
                where: { id: game.id },
                data: {
                    status: "COMPLETED",
                    result: winner,
                    endReason: "TIMEOUT",
                    fen: game.fen,
                    pgn: game.pgn,
                    moveCount: game.moveCount,
                    whiteTimeLeft: game.whiteTimeLeft,
                    blackTimeLeft: game.blackTimeLeft,
                    turnStartedAt: BigInt(game.turnStartedAt),
                    turn: game.turn
                }
            });

            gameManager.broadcastToRoom(game.id, {
                type: SocketEvents.GAME_OVER,
                game_state: game
            });

            gameManager.clearGame(game.id);
            return;
        }

        // 4. Validate and execute the move using chess.js
        const chess = new Chess(game.fen);

        let move;
        try {
            move = chess.move({ from, to, promotion });
        } catch (e) {
            return gameManager.safeSend(ws, { type: SocketEvents.ERROR, message: "Illegal move" });
        }

        if (!move) {
            return gameManager.safeSend(ws, { type: SocketEvents.ERROR, message: "Invalid move" });
        }

        // 5. Update clocks — deduct elapsed time from the moving player
        if (isWhite) {
            game.whiteTimeLeft = currentTimeLeft - elapsed;
        } else {
            game.blackTimeLeft = currentTimeLeft - elapsed;
        }

        // 6. Update game state
        game.fen = chess.fen();
        game.pgn = chess.pgn();
        game.turn = chess.turn();
        game.moveCount += 1;
        game.turnStartedAt = Date.now();
        game.updatedAt = new Date();

        // 7. Check for game-over conditions
        let gameOver = false;
        let result: string | null = null;
        let endReason: string | null = null;

        if (chess.isCheckmate()) {
            gameOver = true;
            result = isWhite ? "WHITE_WIN" : "BLACK_WIN";
            endReason = "CHECKMATE";
        } else if (chess.isStalemate()) {
            gameOver = true;
            result = "DRAW";
            endReason = "STALEMATE";
        } else if (chess.isInsufficientMaterial()) {
            gameOver = true;
            result = "DRAW";
            endReason = "INSUFFICIENT_MATERIAL";
        } else if (chess.isThreefoldRepetition()) {
            gameOver = true;
            result = "DRAW";
            endReason = "THREEFOLD_REPETITION";
        } else if (chess.isDraw()) {
            // This catches the 50-move rule and other automatic draws
            gameOver = true;
            result = "DRAW";
            endReason = "FIFTY_MOVE_RULE";
        }

        if (gameOver) {
            game.status = "COMPLETED";
            game.result = result;
            game.endReason = endReason;
        }

        // 8. Save to memory
        gameManager.setGame(game);

        // 9. Persist to DB
        await prisma.game.update({
            where: { id: game.id },
            data: {
                fen: game.fen,
                pgn: game.pgn,
                turn: game.turn,
                moveCount: game.moveCount,
                whiteTimeLeft: game.whiteTimeLeft,
                blackTimeLeft: game.blackTimeLeft,
                turnStartedAt: BigInt(game.turnStartedAt),
                ...(gameOver && {
                    status: "COMPLETED",
                    result: result as any,
                    endReason: endReason as any
                })
            }
        });

        // 10. Broadcast to both players
        if (gameOver) {
            // Update chess profiles for both players
            const whitePlayerId = game.whitePlayerId!;
            const blackPlayerId = game.blackPlayerId!;

            if (result === "DRAW") {
                await prisma.chessProfile.updateMany({
                    where: { userId: { in: [whitePlayerId, blackPlayerId] } },
                    data: { totalGames: { increment: 1 } }
                });
            } else {
                const winnerId = result === "WHITE_WIN" ? whitePlayerId : blackPlayerId;
                const loserId = result === "WHITE_WIN" ? blackPlayerId : whitePlayerId;
                const winField = result === "WHITE_WIN" ? "totalWhiteWins" : "totalBlackWins";

                await prisma.chessProfile.update({
                    where: { userId: winnerId },
                    data: { totalGames: { increment: 1 }, [winField]: { increment: 1 } }
                });
                await prisma.chessProfile.update({
                    where: { userId: loserId },
                    data: { totalGames: { increment: 1 }, totalGamesLost: { increment: 1 } }
                });
            }

            gameManager.broadcastToRoom(game.id, {
                type: SocketEvents.GAME_OVER,
                game_state: game
            });

            gameManager.clearGame(game.id);
        } else {
            gameManager.broadcastToRoom(game.id, {
                type: SocketEvents.MOVE_MADE,
                game_state: game
            });
        }
    } catch (error) {
        console.error("Error in makeMove:", error);
        gameManager.safeSend(ws, { type: SocketEvents.ERROR, message: "Server error while processing move" });
    }
}

export async function handleResign(gameId: string, userId: string, ws: AuthenticatedWebSocket) {
    let game = gameManager.getGame(gameId);

    if (!game) {
        const dbGame = await fetchGameById(gameId);
        if (dbGame) {
            game = dbGame;
            gameManager.setGame(game);
        }
    }

    if (!game) {
        gameManager.safeSend(ws, { type: SocketEvents.ERROR, message: "Game not found" });
        return;
    }

    if (game.status !== "PLAYING") {
        gameManager.safeSend(ws, { type: SocketEvents.ERROR, message: "Game is already finished" });
        return;
    }

    if (game.whitePlayerId !== userId && game.blackPlayerId !== userId) {
        gameManager.safeSend(ws, { type: SocketEvents.ERROR, message: "You are not a player in this game" });
        return;
    }

    const updatedGame = await resignGame(gameId, userId);

    if (!updatedGame) {
        gameManager.safeSend(ws, { type: SocketEvents.ERROR, message: "Failed to resign game" });
        return;
    }

    gameManager.broadcastToRoom(gameId, { type: SocketEvents.GAME_OVER, game_state: updatedGame });
    gameManager.clearGame(gameId);
}
