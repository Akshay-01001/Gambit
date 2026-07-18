import express, { Request, Response } from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import authRoute from './routes/auth.routes';
import cors from "cors";

const app = express();
configDotenv();

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

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
