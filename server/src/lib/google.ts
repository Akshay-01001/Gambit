import { OAuth2Client } from "google-auth-library";

export const googleClient = new OAuth2Client({
    client_id: process.env.GOOGLE_CLIENT_ID
});

export const verifyGoogleIdToken = async (idToken: string) => {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
        throw new Error("Invalid Request");
    }

    return {
        googleId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified,
        name: payload.name,
        picture: payload.picture
    }
};
