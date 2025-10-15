"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthService = void 0;
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
/**
 * Google Authentication Service
 * Verifies Google OAuth tokens and extracts user information
 */
class GoogleAuthService {
    /**
     * Verify Google OAuth token and extract user information
     * @param token - Google OAuth credential token from frontend
     * @returns User information from Google
     */
    static async verifyGoogleToken(token) {
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Invalid token payload');
            }
            if (!payload.email_verified) {
                throw new Error('Email not verified by Google');
            }
            return {
                email: payload.email,
                email_verified: payload.email_verified,
                name: payload.name || '',
                given_name: payload.given_name,
                family_name: payload.family_name,
                picture: payload.picture,
                sub: payload.sub,
            };
        }
        catch (error) {
            console.error('Google token verification failed:', error.message);
            throw new Error('Invalid Google token');
        }
    }
}
exports.GoogleAuthService = GoogleAuthService;
