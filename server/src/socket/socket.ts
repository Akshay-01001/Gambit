import { Server as HttpServer, IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { verifyAccessToken, TokenPayload } from "../utils/tokens";
import { v7 as uuid } from "uuid";
import { gameManager } from "./gameManager";

export interface AuthenticatedWebSocket extends WebSocket {
    user?: TokenPayload;
    isAlive?: boolean;
}

export const initializeSocket = (server: HttpServer) => {
    try {
        const wss = new WebSocketServer({ noServer: true });

        // Heartbeat Interval
        // Ping each client every 30 seconds and check if the connection is alive.
        // If the client does not respond with a pong, terminate the connection.
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

        // Clear the heartbeat interval when the WebSocket server closes
        wss.on("close", () => {
            clearInterval(heartbeatInterval);
        });

        // Upgrade the HTTP request to a WebSocket connection
        server.on("upgrade", (req: IncomingMessage, socket, head) => {
            try {
                // Parse cookies manually from the WebSocket upgrade request
                const cookieHeader = req.headers.cookie || "";

                const cookies = cookieHeader.split(";").reduce((acc, current) => {
                    const [name, ...rest] = current.trim().split("=");

                    if (name) {
                        acc[name] = rest.join("=");
                    }

                    return acc;
                }, {} as Record<string, string>);

                // Get the access token from the cookies
                const accessToken = cookies.accessToken;

                // Reject the WebSocket upgrade if no access token is provided
                if (!accessToken) {
                    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                    socket.destroy();
                    return;
                }

                // Verify the access token; throws an error if the token is invalid or expired
                const user = verifyAccessToken(accessToken);

                // Complete the WebSocket upgrade and attach the authenticated user
                // before emitting the connection event
                wss.handleUpgrade(req, socket, head, (ws: AuthenticatedWebSocket) => {
                    ws.user = user;
                    wss.emit("connection", ws);
                });
            } catch (error) {
                // Reject the WebSocket upgrade if authentication fails
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
            }
        });

        // listen the connection event
        // takes ws object in callback func
        // Listen for the WebSocket connection event
        // The callback receives the connected WebSocket instance
        wss.on("connection", (ws: AuthenticatedWebSocket) => {
            const userId = ws.user?.userId || "";
            const socketId = uuid();

            // Close the connection if the user is not authenticated
            if (!userId) {
                ws.close(1008, "Unauthorized");
                return;
            }

            // Mark the connection as alive
            ws.isAlive = true;

            // Mark the connection as alive when the client responds with pong
            ws.on("pong", () => {
                ws.isAlive = true;
            });

            // Add the player and socket connection to the GameManager
            gameManager.addPlayer(userId, socketId, ws);
            gameManager.handleClientEvents(ws);

            // Remove the player's connection from the GameManager when disconnected
            ws.on("close", () => {
                gameManager.removePlayerConnection(userId);
            });

            // Log WebSocket errors
            ws.on("error", (error) => {
                console.error(`WebSocket error for user ${userId}:`, error.message);
            });
        });
    } catch (error) {
        console.error("Error In Initializing Socket");
    }
}
