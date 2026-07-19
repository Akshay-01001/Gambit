import { Request, Response, NextFunction } from "express";
import { verifyAccessToken as verifyTokenUtil, verifyRefreshToken as verifyRefreshTokenUtil } from "../utils/tokens";
import { sendError } from "../utils/apiResponse";

export const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies.accessToken || "";
    console.log(req.cookies)

    try {
        const decoded = verifyTokenUtil(token);
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        sendError(res, { code: "UNAUTHORIZED", message: "Invalid or expired token" });
        return;
    }
};

export const verifyRefreshToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken || "";
    try {
        const decoded = verifyRefreshTokenUtil(token);
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        sendError(res, { code: "UNAUTHORIZED", message: "Invalid or expired refresh token" });
        return;
    }
};
