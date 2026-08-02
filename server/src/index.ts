import "dotenv/config"; // Load environment variables BEFORE other imports
import express, { Request, Response } from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { initializeSocket } from "./ws/socket";
import authRoute from './routes/auth.routes';
import otpRoute from './routes/otp.route';

const app = express();
const server = http.createServer(app);
initializeSocket(server);

const PORT = process.env.PORT;

app.use(cookieParser());
app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173", // Your React/Vite frontend
    credentials: true, // Allow cookies
}))

app.get("/", (req: Request, res: Response) => {
    return res.json("Server chal raha hai bhidu 😼");
});

// Auth routes
app.use("/api/auth", authRoute);
app.use("/api/otp", otpRoute);

server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
