"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const class_validator_1 = require("class-validator");
const jwt_1 = require("../utils/jwt");
const RefreshToken_1 = require("../models/RefreshToken");
const crypto = __importStar(require("crypto"));
const roles_1 = require("../types/roles");
const google_auth_service_1 = require("../services/google-auth.service");
const getErrorMessage = (error) => {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        // Normalize email
        email = String(email).trim().toLowerCase();
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }
        // Ensure user has a valid UUID primary key (legacy records may have empty id)
        if (!user.id || user.id.trim() === '') {
            user.id = crypto.randomUUID();
            await database_1.AppDataSource.getRepository(User_1.User).save(user);
        }
        // Generate JWT tokens
        const tokens = (0, jwt_1.generateTokens)(user);
        // Create refresh token in database
        const refreshTokenRepository = database_1.AppDataSource.getRepository(RefreshToken_1.RefreshToken);
        const refreshToken = refreshTokenRepository.create({
            token: tokens.refreshToken,
            user: user,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdByIp: req.ip
        });
        await refreshTokenRepository.save(refreshToken);
        // Prepare user data for response (exclude password)
        const { password: _, ...userData } = user;
        // Set HTTP-only cookie for refresh token
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        return res.json({
            message: 'Login successful',
            user: userData,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'An error occurred during login',
            error: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
        });
    }
};
AuthController.register = async (req, res) => {
    try {
        let { firstName, lastName, email, phone, password, confirmPassword, gender, location } = req.body;
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        // Enforce strong password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special
        const passwordStr = String(password);
        const policy = {
            min: 8,
            upper: /[A-Z]/,
            lower: /[a-z]/,
            digit: /\d/,
            special: /[@$!%*?&]/
        };
        const violations = [];
        if (!passwordStr || passwordStr.length < policy.min)
            violations.push('at least 8 characters');
        if (!policy.upper.test(passwordStr))
            violations.push('one uppercase letter');
        if (!policy.lower.test(passwordStr))
            violations.push('one lowercase letter');
        if (!policy.digit.test(passwordStr))
            violations.push('one number');
        if (!policy.special.test(passwordStr))
            violations.push('one special character');
        if (violations.length) {
            return res.status(400).json({ message: `Password must contain ${violations.join(', ')}` });
        }
        // Check if user already exists
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Normalize email
        email = String(email).trim().toLowerCase();
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        // Create new user
        const user = new User_1.User();
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.phone = phone;
        user.password = password;
        user.gender = gender; // Save gender
        user.role = roles_1.UserRole.PATIENT; // Default role
        user.isActive = true;
        // Validate user input
        const errors = await (0, class_validator_1.validate)(user);
        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.map(e => e.constraints)
            });
        }
        // Hash password
        await user.hashPassword();
        // Generate patient ID if location is provided
        if (location) {
            try {
                const { PatientIdService } = await Promise.resolve().then(() => __importStar(require('../services/patientId.service')));
                const patientIdData = await PatientIdService.generatePatientId(location);
                user.globalPatientId = patientIdData.globalPatientId;
                user.locationCode = patientIdData.locationCode;
                user.registeredLocation = patientIdData.registeredLocation;
                user.registeredYear = patientIdData.registeredYear;
                user.patientSequenceNumber = patientIdData.patientSequenceNumber;
            }
            catch (error) {
                console.error('Failed to generate patient ID:', error);
                // Continue without patient ID - can be generated later
            }
        }
        // Save user
        await userRepository.save(user);
        // Send welcome email (don't wait for it)
        try {
            const { EmailService } = await Promise.resolve().then(() => __importStar(require('../services/email.service')));
            EmailService.sendWelcomeEmail(user.email, user.firstName).catch(err => console.error('Failed to send welcome email:', err));
        }
        catch (emailError) {
            console.error('Email service not available:', emailError);
        }
        // Prepare response (exclude password)
        const userResponse = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        return res.status(201).json({
            message: 'Registration successful',
            user: userResponse
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            message: 'An error occurred during registration',
            error: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
        });
    }
};
AuthController.logout = async (req, res) => {
    var _b, _c;
    try {
        // Get refresh token from cookies or request body
        const refreshToken = ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.refreshToken) || ((_c = req.body) === null || _c === void 0 ? void 0 : _c.refreshToken);
        if (refreshToken) {
            // Delete the refresh token from database
            const refreshTokenRepository = database_1.AppDataSource.getRepository(RefreshToken_1.RefreshToken);
            await refreshTokenRepository.delete({ token: refreshToken });
            // Clear the refresh token cookie
            res.clearCookie('refreshToken');
        }
        return res.status(200).json({ message: 'Successfully logged out' });
    }
    catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            message: 'An error occurred during logout',
            error: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
        });
    }
};
AuthController.refreshToken = async (req, res) => {
    var _b;
    try {
        const refreshToken = ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.refreshToken) || req.body.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }
        // Verify the refresh token
        const refreshTokenRepository = database_1.AppDataSource.getRepository(RefreshToken_1.RefreshToken);
        const storedToken = await refreshTokenRepository.findOne({
            where: { token: refreshToken },
            relations: ['user']
        });
        // Check if token exists and is not expired
        if (!storedToken || storedToken.isExpired) {
            if (storedToken) {
                // Remove expired token from database
                await refreshTokenRepository.remove(storedToken);
            }
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
        // Get user from token
        const user = storedToken.user;
        if (!user) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
        // Generate new tokens
        const tokens = (0, jwt_1.generateTokens)(user);
        // Update refresh token in database
        storedToken.token = tokens.refreshToken;
        storedToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        storedToken.isRevoked = false;
        storedToken.revokedByIp = null;
        storedToken.revokedAt = null;
        storedToken.replacedByToken = null;
        await refreshTokenRepository.save(storedToken);
        // Set HTTP-only cookie for new refresh token
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        return res.status(200).json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn
        });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        return res.status(500).json({
            message: 'Failed to refresh token',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
AuthController.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { email } });
        // For security reasons, we don't reveal if the email exists or not
        if (!user) {
            // In production, we would still return a 200 response to prevent email enumeration
            if (process.env.NODE_ENV === 'development') {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
        }
        // In a real app, you would:
        // 1. Generate a password reset token
        // 2. Save the hashed token and expiration in the database
        // 3. Send an email with a reset link containing the token
        // This is a placeholder implementation
        const resetToken = 'reset-token-placeholder';
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        console.log(`Password reset link for ${email}: ${resetUrl}`);
        return res.status(200).json({
            message: 'If your email exists in our system, you will receive a password reset link',
            // In development, return the reset URL for testing
            ...(process.env.NODE_ENV === 'development' && { resetUrl })
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({
            message: 'Failed to process password reset request',
            error: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
        });
    }
};
AuthController.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        // In a real app, you would:
        // 1. Verify the reset token
        // 2. Check if it's valid and not expired
        // 3. Find the user associated with the token
        // 4. Update the user's password
        // This is a placeholder implementation
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // In a real app, you would find the user by the reset token
        const user = await userRepository.findOne({ where: { email: req.body.email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        // Update the password
        user.password = newPassword;
        await user.hashPassword();
        // In a real app, you would also:
        // 1. Invalidate the reset token
        // 2. Optionally send a confirmation email
        await userRepository.save(user);
        return res.status(200).json({ message: 'Password has been reset successfully' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({
            message: 'Failed to reset password',
            error: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
        });
    }
};
AuthController.getCurrentUser = async (req, res) => {
    try {
        // The user is already attached to req by the auth middleware
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        // Fetch fresh user data from database
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const currentUser = await userRepository.findOne({
            where: { id: user.id },
            select: ['id', 'email', 'firstName', 'lastName', 'role', 'phone', 'isActive', 'createdAt', 'updatedAt']
        });
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!currentUser.isActive) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }
        return res.json(currentUser);
    }
    catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({
            message: 'Failed to get user information',
            error: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
        });
    }
};
/**
 * Google OAuth Login
 * Authenticates user via Google OAuth token
 * Creates new user if doesn't exist, or logs in existing user
 */
AuthController.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' });
        }
        // Verify Google token and get user info
        const googleUser = await google_auth_service_1.GoogleAuthService.verifyGoogleToken(credential);
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Check if user exists
        let user = await userRepository.findOne({
            where: { email: googleUser.email }
        });
        if (user) {
            // Existing user - just login
            if (!user.isActive) {
                return res.status(403).json({ message: 'Account is deactivated' });
            }
            // Update profile picture if available from Google
            if (googleUser.picture && !user.profileImage) {
                user.profileImage = googleUser.picture;
                await userRepository.save(user);
            }
        }
        else {
            // New user - create account
            user = userRepository.create({
                id: crypto.randomUUID(),
                email: googleUser.email,
                firstName: googleUser.given_name || googleUser.name.split(' ')[0] || 'User',
                lastName: googleUser.family_name || googleUser.name.split(' ').slice(1).join(' ') || '',
                phone: '',
                password: crypto.randomBytes(32).toString('hex'),
                role: roles_1.UserRole.PATIENT,
                isActive: true,
                profileImage: googleUser.picture,
                gender: 'other' // Will be updated by user later
            });
            // Save new user
            await userRepository.save(user);
        }
        // Ensure user has valid UUID
        if (!user.id || user.id.trim() === '') {
            user.id = crypto.randomUUID();
            await userRepository.save(user);
        }
        // Generate JWT tokens
        const tokens = (0, jwt_1.generateTokens)(user);
        // Create refresh token in database
        const refreshTokenRepository = database_1.AppDataSource.getRepository(RefreshToken_1.RefreshToken);
        const refreshToken = refreshTokenRepository.create({
            token: tokens.refreshToken,
            user: user,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdByIp: req.ip
        });
        await refreshTokenRepository.save(refreshToken);
        // Prepare user data for response (exclude password)
        const { password: _, ...userData } = user;
        // Set HTTP-only cookie for refresh token
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        return res.json({
            message: 'Google login successful',
            user: userData,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn
        });
    }
    catch (error) {
        console.error('Google login error:', error);
        return res.status(500).json({
            message: 'Google authentication failed',
            error: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
        });
    }
};
