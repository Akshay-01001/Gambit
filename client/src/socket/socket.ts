import { getUserDetails } from "../utils/apiFunctions";
import type { UserState } from "../features/user.slice";
import type { ServerMessage } from "../types/socketEvents";

export let ws: WebSocket;
let reconnectTimeout: ReturnType<typeof setTimeout>;
let reconnectAttempts = 0;
let messageCallback: ((data: ServerMessage) => void) | null = null;
/** Messages queued while the socket is still connecting (e.g., REJOIN_GAME sent before ws.onopen) */
let pendingMessages: string[] = [];
let isConnecting = false;

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 2000;   // 2 seconds
const MAX_RECONNECT_DELAY = 30000;   // 30 seconds

export const setSocketMessageCallback = (callback: (data: ServerMessage) => void) => {
    messageCallback = callback;
};

/**
 * Send a message through the WebSocket.
 * If the socket is still connecting, the message is queued and flushed on open.
 * This prevents race conditions where REJOIN_GAME is called before the socket is ready.
 */
export const sendMessage = (message: unknown): void => {
    const payload = JSON.stringify(message);

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
    } else {
        pendingMessages.push(payload);
    }
};

export const connectSocket = () => {
    // Guard against duplicate connections (e.g., React Strict Mode double-mounting)
    if (isConnecting || (ws && ws.readyState === WebSocket.OPEN)) return;

    isConnecting = true;
    ws = new WebSocket(import.meta.env.VITE_WS_SERVER_URL);

    ws.onopen = () => {
        isConnecting = false;
        reconnectAttempts = 0;

        // Flush any messages that were queued while connecting
        for (const msg of pendingMessages) {
            ws.send(msg);
        }
        pendingMessages = [];
    };

    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        isConnecting = false;
    };

    ws.onclose = () => {
        isConnecting = false;
        clearTimeout(reconnectTimeout);

        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.error("Max WebSocket reconnect attempts reached. Giving up.");
            return;
        }

        // Exponential backoff with jitter: 2s → 4s → 8s → ... → 30s max
        const delay = Math.min(
            BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts) + Math.random() * 1000,
            MAX_RECONNECT_DELAY
        );
        reconnectAttempts++;

        reconnectTimeout = setTimeout(async () => {
            try {
                // Making an API call triggers the axios interceptor to refresh the token if it expired
                await getUserDetails<UserState>('/api/auth/me');
                connectSocket();
            } catch (error) {
                console.error("Failed to refresh token before WS reconnect:", error);
            }
        }, delay);
    };

    ws.onmessage = (event) => {
        if (messageCallback) {
            try {
                const data = JSON.parse(event.data) as ServerMessage;
                messageCallback(data);
            } catch (e) {
                console.error("Failed to parse socket message", e);
            }
        }
    };
};

/**
 * Cleanly close the WebSocket connection and stop all reconnection attempts.
 */
export const disconnectSocket = () => {
    clearTimeout(reconnectTimeout);
    reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Prevent further reconnection
    pendingMessages = [];

    if (ws) {
        ws.close();
    }
};
