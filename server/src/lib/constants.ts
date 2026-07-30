import { CookieOptions } from "express";

export const isProduction = () => {
    return process.env.NODE_ENV === "production";
}

export const accessTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "strict" as const,
    maxAge: 30 * 60 * 1000,
    path: "/"
}

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
}
