import express from "express";
import { verifyAccessToken } from "../middleware/middleware";
import { getUserRunningGame } from "../controllers/game.controller";

const router = express.Router();

router.get("/current", verifyAccessToken, getUserRunningGame);

export default router;
