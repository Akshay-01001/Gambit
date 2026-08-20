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
                store.dispatch(setGame({
                    ...data.game,
                    status: "playing"
                }));
                break;
            }

            case SocketEvents.GAME_STATE: {
                const game = data.game_state;
                store.dispatch(setGame({
                    ...game,
                    status: game.status.toLowerCase()
                }));
                break;
            }

            case SocketEvents.NO_MATCH_FOUND:
                // Reset the "waiting" status so the Play page shows the button again
                store.dispatch(setStatus(null));
                break;

            case SocketEvents.MOVE_MADE:
                // TODO: Handle move updates when move logic is implemented
                break;

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

    public makeMove(from: string, to: string, promotion?: string) {
        this.sendEvent({
            type: SocketEvents.MAKE_MOVE,
            payload: { from, to, promotion }
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
}

// Export as a singleton so the same instance is used everywhere
export const gameManager = new GameManager();
