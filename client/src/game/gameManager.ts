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
            case SocketEvents.MATCH_CREATED:
                store.dispatch(setGame({
                    gameId: data.gameId,
                    fen: data.game.fen,
                    status: "playing",
                }));
                break;

            case SocketEvents.GAME_STATE: {
                const game = data.game_state;
                // The active color is the 2nd field in a FEN string (e.g., "w" or "b")
                const turn = game.fen.split(" ")[1] as "w" | "b";
                store.dispatch(setGame({
                    gameId: game.id,
                    fen: game.fen,
                    turn,
                    status: "playing",
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

            case SocketEvents.GAME_OVER:
                // TODO: Handle game over when game end logic is implemented
                break;

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

    public findGame() {
        this.sendEvent({ type: SocketEvents.FIND_GAME });
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
        this.sendEvent({ type: SocketEvents.RESIGN_GAME });
    }
}

// Export as a singleton so the same instance is used everywhere
export const gameManager = new GameManager();
