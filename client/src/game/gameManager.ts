import { setStatus, setGame } from '../features/chess.slice';
import { setSocketMessageCallback, connectSocket, sendMessage } from '../socket/socket';
import { store } from '../store/store';
import { SocketEvents, type ServerMessage, type ClientMessage } from '../types/socketEvents';

class GameManager {
    private initialized = false;

    /**
     * Initialize the socket connection and register the message handler.
     * Guarded against duplicate calls (e.g., React Strict Mode double-mounting).
     */
    public init() {
        if (this.initialized) return;
        this.initialized = true;

        connectSocket();
        setSocketMessageCallback((data) => {
            this.handleServerMessage(data);
        });
    }

    // ─── Server Message Handler ──────────────────────

    private handleServerMessage(data: ServerMessage) {
        switch (data.type) {
            case SocketEvents.MATCH_CREATED: {
                console.log(data, " =========> MATCH CREATED");
                const { blackPlayer, whitePlayer, ...game } = data.game;
                store.dispatch(setGame({
                    ...game,
                    status: "playing",
                    players: {
                        black: blackPlayer || null,
                        white: whitePlayer || null,
                        clock: store.getState().chess.players?.clock || { white: "10:00", black: "10:00" },
                        promotion: store.getState().chess.players?.promotion || { open: false, from: null, to: null, color: null }
                    }
                }));
                break;
            }

            case SocketEvents.GAME_STATE: {
                const { blackPlayer, whitePlayer, ...game } = data.game_state;
                store.dispatch(setGame({
                    ...game,
                    status: game.status.toLowerCase(),
                    players: {
                        black: blackPlayer || null,
                        white: whitePlayer || null,
                        clock: store.getState().chess.players?.clock || { white: "10:00", black: "10:00" },
                        promotion: store.getState().chess.players?.promotion || { open: false, from: null, to: null, color: null }
                    }
                }));
                break;
            }

            case SocketEvents.NO_MATCH_FOUND:
                // Reset the "waiting" status so the Play page shows the button again
                store.dispatch(setStatus(null));
                break;

            case SocketEvents.MOVE_MADE: {
                const game = data.game_state;
                store.dispatch(setGame({
                    fen: game.fen,
                    pgn: game.pgn,
                    turn: game.turn,
                    moveCount: game.moveCount,
                    whiteTimeLeft: game.whiteTimeLeft,
                    blackTimeLeft: game.blackTimeLeft,
                    turnStartedAt: game.turnStartedAt,
                    selectedSquare: null,
                    legalMoves: [],
                }));
                break;
            }

            case SocketEvents.GAME_OVER: {
                const game = data.game_state;
                const turn = game.fen.split(" ")[1] as "w" | "b";
                store.dispatch(setGame({
                    gameId: game.id,
                    fen: game.fen,
                    turn,
                    status: game.status.toLowerCase(),
                }));
                break;
            }

            case SocketEvents.ERROR:
                console.error("Server error:", data.message);
                break;

            default:
                console.warn("Unknown event type:", (data as Record<string, unknown>).type);
        }
    }

    // ─── Client → Server Actions ─────────────────────

    /**
     * Send a typed message to the server via WebSocket.
     * Uses sendMessage() which auto-queues if the socket isn't ready yet.
     */
    private sendEvent(message: ClientMessage) {
        sendMessage(message);
    }

    public findGame(payload: { game_type: string; game_time: number }) {
        this.sendEvent({ type: SocketEvents.FIND_GAME, payload });
    }

    public reJoinGame(gameId: string) {
        this.sendEvent({
            type: SocketEvents.REJOIN_GAME,
            gameId
        });
    }

    public joinGame(gameId: string) {
        this.sendEvent({
            type: SocketEvents.JOIN_GAME,
            payload: { gameId }
        });
    }

    public resign() {
        const state = store.getState();
        const gameId = state.chess.id;
        if (!gameId) return;

        this.sendEvent({ type: SocketEvents.RESIGN_GAME, gameId });
    }

    public makeMove(from: string, to: string, promotion?: string) {
        const payload = {
            from,
            to,
            ...(promotion && { promotion })
        };

        this.sendEvent({
            type: SocketEvents.MAKE_MOVE,
            payload
        });
    }
}

// Export as a singleton so the same instance is used everywhere
export const gameManager = new GameManager();
