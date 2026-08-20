import { IGameManager, Player, Game } from "../types/types";
import { AuthenticatedWebSocket } from "./socket";
import { SocketEvents, type ServerMessage } from "../types/socketEvents";
import { findMatch, handleRejoin, handleResign } from "./gameActions";

class GameManager implements IGameManager {
    private players: Map<string, Player>;
    private games: Map<string, Game>;
    private waitingPlayers: Map<string, { game_type: string, game_time: number }>;
    private rooms: Map<string, Set<AuthenticatedWebSocket>>;

    constructor() {
        this.players = new Map();
        this.games = new Map();
        this.waitingPlayers = new Map();
        this.rooms = new Map();
    }

    public getPlayer(playerId: string) {
        return this.players.get(playerId);
    }

    public getGame(gameId: string) {
        return this.games.get(gameId);
    }

    public getWaitingPlayers() {
        return this.waitingPlayers;
    }

    public getRoom(roomId: string) {
        return this.rooms.get(roomId);
    }

    public setGame(game: Game) {
        this.games.set(game.id, game);
    }

    // ─── Safe Send ───────────────────────────────────
    // Prevents crashes when sending to a closed/dead socket.
    public safeSend(ws: AuthenticatedWebSocket, message: ServerMessage): void {
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
                console.log(message)

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
                    case SocketEvents.FIND_GAME: {
                        findMatch(userId, message);
                        break;
                    }
                    case SocketEvents.REJOIN_GAME: {
                        handleRejoin(userId, message.gameId, ws);
                        break;
                    }
                    case SocketEvents.RESIGN_GAME: {
                        handleResign(message.gameId, userId, ws);
                        break;
                    }
                    default: {
                        break;
                    }
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

    addToWaiting(playerId: string, prefs: { game_type: string, game_time: number }) {
        this.waitingPlayers.set(playerId, prefs);
    }

    removeFromWaiting(playerId: string) {
        this.waitingPlayers.delete(playerId);
    }

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

        for (const client of room) {
            this.safeSend(client, message);
        }
    }

    getPlayerGame(playerId: string): Game | undefined {
        const player = this.players.get(playerId);
        if (!player?.gameId) return undefined;
        return this.games.get(player.gameId);
    }

    clearGame(gameId: string) {
        let game = this.games.get(gameId);
        if (game) {
            this.games.delete(gameId);
        }
    }
};

export const gameManager = new GameManager();
