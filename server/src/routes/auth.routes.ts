import express from "express";
import { registerUser, loginUser, googleLogin } from "../controllers/auth.controller";
import { getUserDetails } from "../controllers/user.controller";
import { verifyAccessToken } from "../middleware/middleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post('/google', googleLogin);
router.get('/me', verifyAccessToken, getUserDetails)

export default router;
