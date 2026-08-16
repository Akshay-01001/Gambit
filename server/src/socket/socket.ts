import { Server as HttpServer, IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { verifyAccessToken, TokenPayload } from "../utils/tokens";
import { v7 as uuid } from "uuid";
import { gameManager } from "./gameManager";

export interface AuthenticatedWebSocket extends WebSocket {
    user?: TokenPayload;
    /** Set to true on pong, false before each ping. Used to detect stale connections. */
    isAlive?: boolean;
}

export const initializeSocket = (server: HttpServer) => {
    try {
        const wss = new WebSocketServer({ noServer: true });

        // ─── Heartbeat ──────────────────────────────────
        // Ping every client every 30s. If a client doesn't pong before the
        // next ping cycle, it's considered dead and terminated.
        const heartbeatInterval = setInterval(() => {
            for (const client of wss.clients as Set<AuthenticatedWebSocket>) {
                if (client.isAlive === false) {
                    client.terminate();
                    return;
                }
                client.isAlive = false;
                client.ping();
            }
        }, 30000);

        wss.on("close", () => {
            clearInterval(heartbeatInterval);
        });

        // ─── Upgrade (Auth) ─────────────────────────────
        server.on("upgrade", (req: IncomingMessage, socket, head) => {
            try {
                // Parse cookies manually for WebSocket upgrade requests
                const cookieHeader = req.headers.cookie || "";
                const cookies = cookieHeader.split(';').reduce((acc, current) => {
                    const [name, ...rest] = current.trim().split('=');
                    if (name) {
                        acc[name] = rest.join('=');
                    }
                    return acc;
                }, {} as Record<string, string>);

                const accessToken = cookies.accessToken;

                if (!accessToken) {
                    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                    socket.destroy();
                    return;
                }

                // verifyAccessToken throws an error if token is invalid or expired
                const user = verifyAccessToken(accessToken);

                wss.handleUpgrade(req, socket, head, (ws: AuthenticatedWebSocket) => {
                    ws.user = user;
                    wss.emit("connection", ws, req);
                });
            } catch (error) {
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
            }
        });

        // ─── Connection ─────────────────────────────────
        wss.on("connection", (ws: AuthenticatedWebSocket) => {
            const userId = ws.user?.userId || "";
            const socketId = uuid();

            ws.isAlive = true;

            ws.on("pong", () => {
                ws.isAlive = true;
            });

            gameManager.addPlayer(userId, socketId, ws);
            gameManager.handleClientEvents(ws);

            ws.on("close", () => {
                gameManager.removePlayerConnection(userId);
            });

            ws.on("error", (error) => {
                console.error(`WebSocket error for user ${userId}:`, error.message);
            });
        });
    } catch (error) {
        console.error("Error In Initializing Socket");
    }
}
