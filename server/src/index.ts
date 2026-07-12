import express, { Request, Response } from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import authRoute from './routes/auth.routes';

const app = express();
configDotenv();

const PORT = process.env.PORT;

app.use(cookieParser());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    return res.json("Server chal raha hai bhidu 😼");
});

// Auth routes
app.use("/api/auth", authRoute);

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
