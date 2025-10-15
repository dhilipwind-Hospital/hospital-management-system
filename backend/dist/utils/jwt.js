"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.verifyToken = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const getJwtSecret = () => process.env.JWT_SECRET || 'your-secret-key';
const generateTokens = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, getJwtSecret(), {
        expiresIn: ACCESS_TOKEN_EXPIRY
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, getJwtSecret(), {
        expiresIn: REFRESH_TOKEN_EXPIRY
    });
    return {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60 // 15 minutes in seconds
    };
};
exports.generateTokens = generateTokens;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, getJwtSecret());
};
exports.verifyToken = verifyToken;
const decodeToken = (token) => {
    try {
        return (0, exports.verifyToken)(token);
    }
    catch (error) {
        return null;
    }
};
exports.decodeToken = decodeToken;
