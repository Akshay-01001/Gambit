import express from "express";
import { verifyAccessToken } from "../middleware/middleware";
import { getUserPlayerGames, getUserRunningGame } from "../controllers/game.controller";

const router = express.Router();

router.get("/current", verifyAccessToken, getUserRunningGame);
router.get("/recent-games", verifyAccessToken, getUserPlayerGames);

export default router;
