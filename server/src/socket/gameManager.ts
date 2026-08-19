import { IGameManager, Player, Game } from "../types/types";
import { createChessGame, fetchGameById, resignGame } from "./gameServices";
import { AuthenticatedWebSocket } from "./socket";
import { SocketEvents, type ServerMessage } from "../types/socketEvents";

class GameManager implements IGameManager {
    private players: Map<string, Player>;
    private games: Map<string, Game>;
    private waitingPlayers: Set<string>;
    private rooms: Map<string, Set<AuthenticatedWebSocket>>;

    constructor() {
        this.players = new Map();
        this.games = new Map();
        this.waitingPlayers = new Set();
        this.rooms = new Map();
    }

    // ─── Safe Send ───────────────────────────────────
    // Prevents crashes when sending to a closed/dead socket.
    private safeSend(ws: AuthenticatedWebSocket, message: ServerMessage): void {
        try {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify(message));
            }
        } catch (error) {
            console.error("Failed to send WebSocket message:", error);
        }
    }

    // ─── Client Event Router ─────────────────────────

    handleClientEvents = (ws: AuthenticatedWebSocket) => {
        ws.on('message', (data: string) => {
            try {
                const message = JSON.parse(data.toString());

                // Basic payload validation
                if (!message || typeof message.type !== 'string') {
                    this.safeSend(ws, { type: SocketEvents.ERROR, message: "Invalid message format" });
                    return;
                }

                const userId = ws.user?.userId;

                if (!userId) {
                    this.safeSend(ws, { type: SocketEvents.ERROR, message: "Unauthorized: no user identity" });
                    return;
                }

                switch (message.type) {
                    case SocketEvents.FIND_GAME:
                        this.findMatch(userId);
                        break;

                    case SocketEvents.REJOIN_GAME:
                        this.handleRejoin(userId, message.gameId, ws);
                        break;

                    case SocketEvents.RESIGN_GAME:
                        this.handleResign(message.gameId, userId, ws);
                        break;
                    // Events like MAKE_MOVE, JOIN_GAME, RESIGN_GAME
                    // will be handled here in future iterations
                    default:
                        break;
                }
            } catch (error) {
                console.error("Invalid socket message format:", error);
                this.safeSend(ws, { type: SocketEvents.ERROR, message: "Invalid message format" });
            }
        });
    }

    // ─── Player Management ───────────────────────────

    addPlayer(playerId: string, socketId: string, ws: AuthenticatedWebSocket): Player {
        const existingPlayer = this.players.get(playerId);

        if (existingPlayer) {
            const oldWs = existingPlayer.ws;

            const updatedPlayer: Player = {
                ...existingPlayer,
                socketId,
                ws,
                disconnectedAt: null
            };
            this.players.set(playerId, updatedPlayer);

            // Swap the stale ws reference in any room the player belongs to.
            // Without this, messages would still be sent to the old (dead) socket.
            if (existingPlayer.gameId) {
                const room = this.rooms.get(existingPlayer.gameId);
                if (room) {
                    room.delete(oldWs);
                    room.add(ws);
                }
            }

            return updatedPlayer;
        }

        const player: Player = {
            socketId,
            playerId,
            gameId: null,
            disconnectedAt: null,
            ws
        };
        this.players.set(playerId, player);
        return player;
    }

    removePlayerConnection(userId: string): void {
        const player = this.players.get(userId);
        if (!player) return;

        player.disconnectedAt = Date.now();

        // Can't be matched while disconnected
        this.removeFromWaiting(userId);

        // Remove the stale ws from the game room, but keep the player record
        // so they can reconnect and rejoin via REJOIN_GAME
        if (player.gameId) {
            const room = this.rooms.get(player.gameId);
            if (room) {
                this.broadcastToRoom(player.gameId, {
                    type: SocketEvents.PLAYER_DISCONNECTED,
                    player_id: userId
                });
                room.delete(player.ws);
            }
        }
    }

    // ─── Matchmaking ─────────────────────────────────

    addToWaiting(playerId: string) {
        this.waitingPlayers.add(playerId);
    }

    removeFromWaiting(playerId: string) {
        this.waitingPlayers.delete(playerId);
    }

    findMatch(playerId: string) {
        const player = this.players.get(playerId);
        if (!player) return;

        // Don't allow searching if already in a game
        if (player.gameId) {
            this.safeSend(player.ws, {
                type: SocketEvents.ERROR,
                message: "You are already in a game"
            });
            return;
        }

        // Prevent duplicate queue entries (Set already dedupes, but we skip the
        // opponent scan + timeout if the player is already waiting)
        if (this.waitingPlayers.has(playerId)) return;

        // Find an opponent who is NOT the current player
        let opponentId: string | null = null;

        for (const waitingId of this.waitingPlayers) {
            if (waitingId !== playerId) {
                opponentId = waitingId;
                break;
            }
        }

        if (opponentId) {
            // We found a match! Remove opponent from waitlist and start game
            this.removeFromWaiting(opponentId);
            this.createGame(playerId, opponentId);
        } else {
            // Nobody else is waiting, so add this player to the waitlist
            this.addToWaiting(playerId);

            // 30s timeout: if no match found, remove from queue and notify
            setTimeout(() => {
                if (this.waitingPlayers.has(playerId)) {
                    this.removeFromWaiting(playerId);

                    // Notify the client that no match was found
                    const currentPlayer = this.players.get(playerId);
                    if (currentPlayer) {
                        this.safeSend(currentPlayer.ws, { type: SocketEvents.NO_MATCH_FOUND });
                    }
                }
            }, 30000);
        }
    }

    // ─── Room Management ─────────────────────────────

    joinRoom(roomId: string, ws: AuthenticatedWebSocket) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId)?.add(ws);
    }

    leaveRoom(roomId: string, ws: AuthenticatedWebSocket) {
        this.rooms.get(roomId)?.delete(ws);
        if (this.rooms.get(roomId)?.size === 0) {
            this.rooms.delete(roomId);
        }
    }

    broadcastToRoom(roomId: string, message: ServerMessage) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const payload = JSON.stringify(message);
        for (const client of room) {
            this.safeSend(client, message);
        }
    }

    // ─── Game Lifecycle ──────────────────────────────

    async createGame(player1Id: string, player2Id: string) {
        const player1 = this.players.get(player1Id);
        const player2 = this.players.get(player2Id);

        if (!player1?.ws || !player2?.ws) return;

        // Re-check both sockets are alive before creating the game
        if (player1.ws.readyState !== player1.ws.OPEN ||
            player2.ws.readyState !== player2.ws.OPEN) {
            return;
        }

        try {
            const game = await createChessGame(player1Id, player2Id);
            if (!game) {
                this.safeSend(player1.ws, { type: SocketEvents.ERROR, message: "Failed to create game" });
                this.safeSend(player2.ws, { type: SocketEvents.ERROR, message: "Failed to create game" });
                return;
            }

            const gameId = game.id;

            // Link both players to this game
            player1.gameId = gameId;
            player2.gameId = gameId;

            this.joinRoom(gameId, player1.ws);
            this.joinRoom(gameId, player2.ws);
            this.games.set(gameId, game);

            this.broadcastToRoom(gameId, {
                type: SocketEvents.MATCH_CREATED,
                gameId: gameId,
                game: game
            });
        } catch (error) {
            console.error("Error creating game:", error);
        }
    }

    // ─── Rejoin ──────────────────────────────────────

    private async handleRejoin(userId: string, gameId: string, ws: AuthenticatedWebSocket) {
        if (!gameId || typeof gameId !== 'string') {
            this.safeSend(ws, { type: SocketEvents.ERROR, message: "Game ID is required" });
            return;
        }

        // Try in-memory first, then fall back to DB (handles server-restart case)
        let game = this.games.get(gameId);

        if (!game) {
            const dbGame = await fetchGameById(gameId);
            if (dbGame) {
                game = dbGame;
                this.games.set(gameId, game);
            }
        }

        if (!game) {
            this.safeSend(ws, { type: SocketEvents.ERROR, message: "Game not found" });
            return;
        }

        // Verify the player actually belongs to this game
        if (game.whitePlayerId !== userId && game.blackPlayerId !== userId) {
            this.safeSend(ws, { type: SocketEvents.ERROR, message: "You are not a player in this game" });
            return;
        }

        // Update the player's record and rejoin the room
        const player = this.players.get(userId);
        if (player) {
            player.gameId = gameId;
            player.disconnectedAt = null;
        }

        this.joinRoom(gameId, ws);

        this.safeSend(ws, {
            type: SocketEvents.GAME_STATE,
            game_state: game
        });
    }

    // ─── Stubs (will be implemented when game-play events are added) ─

    getGame(gameId: string): Game | undefined {
        return this.games.get(gameId);
    }

    getPlayerGame(playerId: string): Game | undefined {
        const player = this.players.get(playerId);
        if (!player?.gameId) return undefined;
        return this.games.get(player.gameId);
    }

    makeMove(playerId: string, from: string, to: string) {
        // TODO: Implement with chess.js validation
    }

    clearGame(gameId: string) {
        let game = this.games.get(gameId);
        if (game) {
            this.games.delete(gameId);
        }
    }

    async handleResign(gameId: string, userId: string, ws: AuthenticatedWebSocket) {
        // Try in-memory first, then fall back to DB (handles server-restart case)
        let game = this.games.get(gameId);

        if (!game) {
            const dbGame = await fetchGameById(gameId);
            if (dbGame) {
                game = dbGame;
                this.games.set(gameId, game);
            }
        }

        if (!game) {
            this.safeSend(ws, { type: SocketEvents.ERROR, message: "Game not found" });
            return;
        }

        if (game.status !== "PLAYING") {
            this.safeSend(ws, { type: SocketEvents.ERROR, message: "Game is already finished" });
            return;
        }

        // Verify the player actually belongs to this game
        if (game.whitePlayerId !== userId && game.blackPlayerId !== userId) {
            this.safeSend(ws, { type: SocketEvents.ERROR, message: "You are not a player in this game" });
            return;
        }

        const updatedGame = await resignGame(gameId, userId);

        if (!updatedGame) {
            this.safeSend(ws, { type: SocketEvents.ERROR, message: "Failed to resign game" });
            return;
        }

        this.broadcastToRoom(gameId, { type: SocketEvents.GAME_OVER, game_state: updatedGame });
        this.clearGame(gameId);
    }
};

export const gameManager = new GameManager();
