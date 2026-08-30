import { IGameManager, Player, Game } from "../types/types";
import { AuthenticatedWebSocket } from "./socket";
import { SocketEvents, type ServerMessage } from "../types/socketEvents";
import { findMatch, handleRejoin, handleResign, makeMove } from "./gameActions";
import { Chess, Square } from "chess.js";

class GameManager implements IGameManager {
    // Players map: player_id -> Player object
    // Games map: game_id -> Game object
    // Waiting players map: player_id -> game type and time control
    // Rooms map: game_id -> set of connected player WebSockets
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

    /**
     * @param playerId
     * @returns Player object or undefined
     */
    public getPlayer(playerId: string) {
        return this.players.get(playerId);
    }

    /**
     * @param gameId
     * @returns Game object or undefined
     */
    public getGame(gameId: string) {
        return this.games.get(gameId);
    }

    /**
     * @returns Map of waiting players
     */
    public getWaitingPlayers() {
        return this.waitingPlayers;
    }

    /**
     * @param roomId
     * @returns Room object or undefined
     */
    public getRoom(roomId: string) {
        return this.rooms.get(roomId);
    }

    /**
     * @param game
     * Adds the game to the games map
     */
    public setGame(game: Game) {
        this.games.set(game.id, game);
    }

    /**
     * Safely sends a message without throwing errors on a closed/dead socket.
     * @param ws WebSocket connection of the client
     * @param message Message to send to the client
     */
    public safeSend(ws: AuthenticatedWebSocket, message: ServerMessage): void {
        try {
            // Check if the WebSocket connection is open
            if (ws.readyState === ws.OPEN) {
                // Send the message if the connection is open
                ws.send(JSON.stringify(message));
            }
        } catch (error) {
            // Log the error if the message could not be sent
            console.error("Failed to send WebSocket message:", error);
        }
    }

    /**
     * Handles events received from the client.
     * @param ws WebSocket connection of the client
     */
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

    /**
     * @param playerId
     * @param socketId
     * @param ws
     * @returns The Player Object
     */
    addPlayer(playerId: string, socketId: string, ws: AuthenticatedWebSocket): Player {
        // Check if the player already exists.
        const existingPlayer = this.players.get(playerId);

        // If the player already exists, update the WebSocket connection.
        // If the player is in a game, also replace the old socket in the game room.
        if (existingPlayer) {
            const oldWs = existingPlayer.ws;

            const updatedPlayer: Player = {
                ...existingPlayer,
                socketId,
                ws,
                disconnectedAt: null
            };

            this.players.set(playerId, updatedPlayer);

            // Replace the stale WebSocket with the new connection in the game room.
            if (existingPlayer.gameId) {
                const room = this.rooms.get(existingPlayer.gameId);

                if (room) {
                    room.delete(oldWs);
                    room.add(ws);
                }
            }

            return updatedPlayer;
        }

        // Create a new player with no active game.
        const player: Player = {
            socketId,
            playerId,
            gameId: null,
            disconnectedAt: null,
            ws
        };

        // Store the player and return it.
        this.players.set(playerId, player);

        return player;
    }

    /**
     * @param userId 
     * Remove the player's connection and mark them as disconnected.
     */
    removePlayerConnection(userId: string): void {
        const player = this.players.get(userId);
        if (!player) return;

        // Mark the time of disconnection for reconnect/timeout handling.
        player.disconnectedAt = Date.now();

        // Remove the player from matchmaking while disconnected.
        this.removeFromWaiting(userId);

        // Remove the stale socket from the game room but keep the player record
        // so they can reconnect and continue the existing game.
        if (player.gameId) {
            const room = this.rooms.get(player.gameId);

            if (room) {
                room.delete(player.ws);

                // Notify the remaining players about the disconnection.
                this.broadcastToRoom(player.gameId, {
                    type: SocketEvents.PLAYER_DISCONNECTED,
                    player_id: userId
                });
            }
        }
    }

    /**
     * @param playerId
     * @param prefs
     * Add the player to the matchmaking queue.
     */
    addToWaiting(playerId: string, prefs: { game_type: string, game_time: number }) {
        // Prevent the same player from being added multiple times.
        if (!this.waitingPlayers.has(playerId)) {
            this.waitingPlayers.set(playerId, prefs);
        }
    }

    /**
     * @param playerId 
     * Remove the player from the matchmaking queue.
     */
    removeFromWaiting(playerId: string) {
        // Remove the player if they are currently waiting for a match.
        this.waitingPlayers.delete(playerId);
    }

    /**
     * @param roomId
     * @param ws
     * Add a WebSocket connection to a game room.
     */
    joinRoom(roomId: string, ws: AuthenticatedWebSocket) {
        // Create the room if it does not exist.
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }

        this.rooms.get(roomId)?.add(ws);
    }

    /**
     * @param roomId
     * @param ws
     * Remove a WebSocket connection from a game room.
     */
    leaveRoom(roomId: string, ws: AuthenticatedWebSocket) {
        this.rooms.get(roomId)?.delete(ws);

        // Remove the room if no connected players remain.
        if (this.rooms.get(roomId)?.size === 0) {
            this.rooms.delete(roomId);
        }
    }

    /**
     * @param roomId
     * @param message
     * Broadcast a message to all connected players in a game room.
     */
    broadcastToRoom(roomId: string, message: ServerMessage) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        for (const client of room) {
            this.safeSend(client, message);
        }
    }

    /**
     * Returns the game currently associated with the player.
     * @param playerId
     */
    getPlayerGame(playerId: string): Game | undefined {
        const player = this.players.get(playerId);
        if (!player?.gameId) return undefined;

        return this.games.get(player.gameId);
    }

    /**
     * Removes a game from the in-memory game registry.
     * @param gameId
     */
    clearGame(gameId: string) {
        this.games.delete(gameId);
    }
};

export const gameManager = new GameManager();
