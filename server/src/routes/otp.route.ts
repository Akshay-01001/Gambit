import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otp.controller";
import { verifyAccessToken } from "../middleware/middleware";

const router = express.Router();

router.post("/send-otp", verifyAccessToken, sendOtp);
router.post("/verify-otp", verifyAccessToken, verifyOtp);

export default router;
