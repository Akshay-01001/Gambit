import { setStatus } from '../features/chess.slice';
import { ws, setSocketMessageCallback, connectSocket } from '../socket/socket';
import { store } from '../store/store';

class GameManager {

    // Method to initialize socket listeners
    public init() {
        connectSocket();
        setSocketMessageCallback((data) => {
            this.handleServerMessage(data);
        });
    }

    // Handle different socket events from the server
    private handleServerMessage(data: any) {
        switch (data.type) {
            case 'GAME_STARTED':
                break;
            case 'MOVE_MADE':
                break;
            case 'GAME_OVER':
                break;
            case 'MATCH_CREATED':
                store.dispatch(setStatus("playing"));
                break;
            default:
                console.log("Unknown event type:", data.type);
        }
    }

    // Helper to send messages safely to the server
    private sendEvent(message: unknown) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        } else {
            console.error("Cannot send message, WebSocket is not open");
        }
    }

    public makeMove(from: string, to: string, promotion?: string) {
        this.sendEvent({
            type: 'MAKE_MOVE',
            payload: { from, to, promotion }
        });
    }

    public joinGame(gameId: string) {
        this.sendEvent({
            type: 'JOIN_GAME',
            payload: { gameId }
        });
    }

    public resign() {
        this.sendEvent({
            type: 'RESIGN_GAME',
        });
    }

    public findGame() {
        this.sendEvent({
            type: "FIND_GAME"
        })
    }

    public reJoinGame(gameId: string) {
        this.sendEvent({
            type: "REJOIN_GAME",
            gameId
        })
    }
}

// Export as a singleton so the same instance is used everywhere
export const gameManager = new GameManager();
