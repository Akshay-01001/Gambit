import { getUserDetails } from "../utils/apiFunctions";
import type { UserState } from "../features/user.slice";

export let ws: WebSocket;
let reconnectTimeout: ReturnType<typeof setTimeout>;
let messageCallback: ((data: unknown) => void) | null = null;

export const setSocketMessageCallback = (callback: (data: unknown) => void) => {
    messageCallback = callback;
};

export const connectSocket = () => {
    ws = new WebSocket(import.meta.env.VITE_WS_SERVER_URL);

    ws.onerror = (err) => {
        console.log("WebSocket error:", err);
    };

    ws.onclose = (event) => {
        // Prevent multiple timeouts from stacking
        clearTimeout(reconnectTimeout);

        // Wait a bit before retrying
        reconnectTimeout = setTimeout(async () => {
            try {
                // Making an API call triggers the axios interceptor to refresh the token if it expired
                await getUserDetails<UserState>('/api/auth/me');
                connectSocket();
            } catch (error) {
                console.log("Failed to refresh token before WS reconnect:", error);
            }
        }, 2000);
    };

    ws.onmessage = (event) => {
        if (messageCallback) {
            try {
                const data = JSON.parse(event.data);
                messageCallback(data);
            } catch (e) {
                console.error("Failed to parse socket message", e);
            }
        }
    };
};


