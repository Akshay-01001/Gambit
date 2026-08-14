import { Server as HttpServer, IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { verifyAccessToken, TokenPayload } from "../utils/tokens";

export interface AuthenticatedWebSocket extends WebSocket {
    user?: TokenPayload;
}

export const initializeSocket = (server: HttpServer) => {
    try {
        const wss = new WebSocketServer({ noServer: true });

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
                    console.log("Here Not have access token")
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
                console.log("Unauthorized WebSocket connection attempt");
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
            }
        });

        wss.on("connection", (ws: AuthenticatedWebSocket) => {
            console.log(`User ${ws.user?.userId} connected`);
            ws.send("Hello");
        });
    } catch (error) {
        console.error("Error In Initializing Socket");
    }
}
