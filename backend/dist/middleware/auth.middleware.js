"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const http_exception_1 = require("../exceptions/http.exception");
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (process.env.NODE_ENV === 'test') {
            console.log('[auth.authenticate] authorization header:', authHeader);
        }
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new http_exception_1.UnauthorizedException('No token provided');
        }
        const token = authHeader.split(' ')[1];
        if (process.env.NODE_ENV === 'test') {
            console.log('[auth.authenticate] token (first 16):', token === null || token === void 0 ? void 0 : token.slice(0, 16));
        }
        if (!token) {
            throw new http_exception_1.UnauthorizedException('No token provided');
        }
        // Verify token
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, secret);
            if (process.env.NODE_ENV === 'test') {
                console.log('[auth.authenticate] decoded userId:', decoded === null || decoded === void 0 ? void 0 : decoded.userId);
            }
        }
        catch (e) {
            if (process.env.NODE_ENV === 'test') {
                console.log('[auth.authenticate] jwt.verify error:', e === null || e === void 0 ? void 0 : e.message);
            }
            throw new http_exception_1.UnauthorizedException('Invalid token');
        }
        // Get user from database (TypeORM v0.3)
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({
            where: { id: decoded.userId },
            select: ['id', 'email', 'role', 'isActive', 'permissions']
        });
        if (process.env.NODE_ENV === 'test') {
            console.log('[auth.authenticate] user found?', !!user, 'isActive:', user === null || user === void 0 ? void 0 : user.isActive, 'role:', user === null || user === void 0 ? void 0 : user.role);
        }
        if (!user || !user.isActive) {
            throw new http_exception_1.UnauthorizedException('User not found or inactive');
        }
        // Attach user to request object
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new http_exception_1.UnauthorizedException('Invalid token'));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new http_exception_1.UnauthorizedException('Token expired'));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
// Role-based access control middleware
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new http_exception_1.UnauthorizedException('Authentication required'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new http_exception_1.UnauthorizedException('Insufficient permissions'));
        }
        next();
    };
};
exports.authorize = authorize;
