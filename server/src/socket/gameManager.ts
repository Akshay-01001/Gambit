import { IGameManager, Player, Game } from "../types/types";
import { createChessGame } from "./gameServices";
import { AuthenticatedWebSocket } from "./socket";

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

    handleClientEvents = (ws: AuthenticatedWebSocket) => {
        ws.on('message', (data: string) => {
            try {
                const message = JSON.parse(data.toString());
                const userId = ws.user?.userId;

                if (!userId) return;

                if (message.type === 'FIND_GAME') {
                    this.findMatch(userId);
                }

                if (message.type === "REJOIN_GAME") {
                    const roomId = this.players.get(userId)?.gameId || "";
                    if (!roomId) {
                        // handle this
                    }
                    this.joinRoom(roomId, ws);
                    const game = this.games.get(roomId);
                    if (game) {
                        ws.send(JSON.stringify({
                            type: "GAME_STATE",
                            game_state: game
                        }));
                    }
                }
            } catch (error) {
                console.error("Invalid socket message format");
            }
        });
    }

    addPlayer(playerId: string, socketId: string, ws: AuthenticatedWebSocket): Player {
        const existingPlayer = this.players.get(playerId);

        if (existingPlayer) {
            const updatedPlayer: Player = {
                ...existingPlayer,
                socketId,
                ws,
                disconnectedAt: null
            };
            this.players.set(playerId, updatedPlayer);
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
    }

    addToWaiting(playerId: string) {
        this.waitingPlayers.add(playerId);
    }

    removeFromWaiting(playerId: string) {
        this.waitingPlayers.delete(playerId);
    }

    findMatch(playerId: string) {
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
            setTimeout(() => {
                if (this.waitingPlayers.has(playerId)) {
                    this.removeFromWaiting(playerId);

                    // Notify the client that no match was found
                    const player = this.players.get(playerId);
                    if (player && player.ws) {
                        player.ws.send(JSON.stringify({ type: 'NO_MATCH_FOUND' }));
                    }
                }
            }, 30000);
        }
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

    broadcastToRoom(roomId: string, message: any) {
        const room = this.rooms.get(roomId);
        if (room) {
            const payload = JSON.stringify(message);
            for (const client of room) {
                if (client.readyState === client.OPEN) {
                    client.send(payload);
                }
            }
        }
    }

    async createGame(player1Id: string, player2Id: string) {
        const player1 = this.players.get(player1Id);
        const player2 = this.players.get(player2Id);

        if (!player1 || !player1.ws || !player2 || !player2.ws) {
            return;
        }

        const gameStr = await createChessGame(player1Id, player2Id);
        if (!gameStr) return;

        const game = JSON.parse(gameStr);
        const gameId = game.id;

        this.joinRoom(gameId, player1.ws);
        this.joinRoom(gameId, player2.ws);
        this.games.set(gameId, game);

        this.broadcastToRoom(gameId, {
            type: 'MATCH_CREATED',
            gameId: gameId,
            game: game
        });
    }

    getGame(gameId: string) { }

    getPlayerGame(playerId: string) { }

    reconnectPlayer(playerId: string, socketId: string) { }

    makeMove(playerId: string, from: string, to: string) { }

    endGame(gameId: string) { }
};

export const gameManager = new GameManager();
