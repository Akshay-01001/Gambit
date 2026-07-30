import express from "express";
import { registerUser, loginUser, googleLogin, generateNewAccessToken, onboardUser, logout } from "../controllers/auth.controller";
import { getUserDetails } from "../controllers/user.controller";
import { verifyAccessToken, verifyRefreshToken } from "../middleware/middleware";
import { upload } from "../middleware/multer";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post('/google', googleLogin);
router.get('/me', verifyAccessToken, getUserDetails);
router.get("/refresh", verifyRefreshToken, generateNewAccessToken);
router.post("/onboarding", verifyAccessToken, upload.single('image'), onboardUser);
router.get("/logout", verifyAccessToken, logout);

export default router;
