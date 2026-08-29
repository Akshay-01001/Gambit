import { gameManager } from "./gameManager";
import { createChessGame, fetchGameById, resignGame } from "./gameServices";
import { SocketEvents } from "../types/socketEvents";
import { AuthenticatedWebSocket } from "./socket";

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

    gameManager.safeSend(ws, {
        type: SocketEvents.GAME_STATE,
        game_state: game
    });
}

export function makeMove(playerId: string, from: string, to: string) {
    // TODO: Implement with chess.js validation
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
