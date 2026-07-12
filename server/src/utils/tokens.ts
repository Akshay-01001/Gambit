import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRY = "30m";   // 30 minutes
const REFRESH_TOKEN_EXPIRY = "7d";   // 7 days

// Read secrets at call-time (not module load time) so dotenv has already run
const getAccessSecret = () => process.env.ACCESS_TOKEN_SECRET as string;
const getRefreshSecret = () => process.env.REFRESH_TOKEN_SECRET as string;


export interface TokenPayload {
    userId: string;
    email: string;
}

/**
 * Generate an access token (short-lived, 30 min).
 */
export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, getAccessSecret(), {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
};

/**
 * Generate a refresh token (long-lived, 7 days).
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, getRefreshSecret(), {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });
};

/**
 * Convenience helper – returns both tokens in one call.
 */
export const generateTokenPair = (
    payload: TokenPayload
): { accessToken: string; refreshToken: string } => {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};

/**
 * Verify an access token and return its decoded payload.
 * Throws if the token is invalid or expired.
 */
export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, getAccessSecret()) as TokenPayload;
};

/**
 * Verify a refresh token and return its decoded payload.
 * Throws if the token is invalid or expired.
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, getRefreshSecret()) as TokenPayload;
};
