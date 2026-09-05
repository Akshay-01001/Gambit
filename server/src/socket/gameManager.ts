import { IGameManager, Player, Game } from "../types/types";
import { AuthenticatedWebSocket } from "./socket";
import { SocketEvents, type ServerMessage } from "../types/socketEvents";
import { findMatch, handleRejoin, handleResign, makeMove } from "./gameActions";

class GameManager implements IGameManager {
    private players: Map<string, Player>;
    private games: Map<string, Game>;
    private waitingPlayers: Map<string, { game_type: string, game_time: number }>;
    private rooms: Map<string, Set<AuthenticatedWebSocket>>;
    private turnTimers: Map<string, NodeJS.Timeout>;

    constructor() {
        this.players = new Map();
        this.games = new Map();
        this.waitingPlayers = new Map();
        this.rooms = new Map();
        this.turnTimers = new Map();
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

    public safeSend(ws: AuthenticatedWebSocket, message: ServerMessage): void {
        try {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify(message));
            }
        } catch (error) {
            console.error("Failed to send WebSocket message:", error);
        }
    }

    handleClientEvents = (ws: AuthenticatedWebSocket) => {
        ws.on('message', (data: string) => {
            try {
                const message = JSON.parse(data.toString());
                console.log(message)

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
                    case SocketEvents.MAKE_MOVE: {
                        makeMove(ws, message?.payload?.from, message?.payload?.to, message?.payload?.promotion);
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

        this.removeFromWaiting(userId);

        if (player.gameId) {
            const room = this.rooms.get(player.gameId);

            if (room) {
                room.delete(player.ws);

                this.broadcastToRoom(player.gameId, {
                    type: SocketEvents.PLAYER_DISCONNECTED,
                    player_id: userId
                });
            }
        }
    }

    addToWaiting(playerId: string, prefs: { game_type: string, game_time: number }) {
        if (!this.waitingPlayers.has(playerId)) {
            this.waitingPlayers.set(playerId, prefs);
        }
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
        const game = this.games.get(gameId);

        if (game) {
            const white = game.whitePlayerId ? this.players.get(game.whitePlayerId) : undefined;
            const black = game.blackPlayerId ? this.players.get(game.blackPlayerId) : undefined;

            if (white) white.gameId = null;
            if (black) black.gameId = null;
        }

        this.clearTurnTimer(gameId);
        this.games.delete(gameId);
        this.rooms.delete(gameId);
    }

    setTurnTimer(gameId: string, timer: NodeJS.Timeout) {
        this.clearTurnTimer(gameId);
        this.turnTimers.set(gameId, timer);
    }

    clearTurnTimer(gameId: string) {
        const existing = this.turnTimers.get(gameId);
        if (existing) {
            clearTimeout(existing);
            this.turnTimers.delete(gameId);
        }
    }
};

export const gameManager = new GameManager();
