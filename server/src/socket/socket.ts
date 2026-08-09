import { Server as HttpServer } from "http";
import { Server } from "socket.io";

export const initializeSocket = (server: HttpServer) => {
    try {
        const io = new Server(server, {
            cors: {
                origin: process.env.CLIENT_URL,
                credentials: true
            }
        });

        io.on("connection", (socket) => {
            console.log("CLIENT CONNECTED", socket.id);
        });

    } catch (error) {
        console.error("Error In Initializing Socet");
    }
}
