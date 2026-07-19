import express from "express";
import { registerUser, loginUser, googleLogin, generateNewAccessToken } from "../controllers/auth.controller";
import { getUserDetails } from "../controllers/user.controller";
import { verifyAccessToken, verifyRefreshToken } from "../middleware/middleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post('/google', googleLogin);
router.get('/me', verifyAccessToken, getUserDetails);
router.get("/refresh", verifyRefreshToken, generateNewAccessToken);

export default router;
