import "dotenv/config"; // Load environment variables BEFORE other imports
import express, { Request, Response } from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { initializeSocket } from "./socket/socket";
import authRoute from './routes/auth.routes';
import otpRoute from './routes/otp.route';

const app = express();
const server = http.createServer(app);
initializeSocket(server);

const PORT = process.env.PORT;

app.use(cookieParser());
app.use(express.json());

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
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
