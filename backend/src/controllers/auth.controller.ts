import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserResponse } from '../models/User';
import { validate } from 'class-validator';
import { generateTokens, TokenPayload } from '../utils/jwt';
import { RefreshToken } from '../models/RefreshToken';
import * as crypto from 'crypto';
import { UserRole } from '../types/roles';
import { GoogleAuthService } from '../services/google-auth.service';

type ErrorWithMessage = {
  message: string;
  [key: string]: any;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export class AuthController {
  static login = async (req: Request, res: Response) => {
    try {
      let { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Normalize email
      email = String(email).trim().toLowerCase();

      const userRepository = AppDataSource.getRepository(User);
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
        await AppDataSource.getRepository(User).save(user);
      }

      // Generate JWT tokens
      const tokens = generateTokens(user);
      
      // Create refresh token in database
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      const refreshToken = refreshTokenRepository.create({
        token: tokens.refreshToken,
        user: user,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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

    } catch (error: unknown) {
      console.error('Login error:', error);
      return res.status(500).json({ 
        message: 'An error occurred during login',
        error: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
      });
    }
  };

  static register = async (req: Request, res: Response) => {
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
      const violations: string[] = [];
      if (!passwordStr || passwordStr.length < policy.min) violations.push('at least 8 characters');
      if (!policy.upper.test(passwordStr)) violations.push('one uppercase letter');
      if (!policy.lower.test(passwordStr)) violations.push('one lowercase letter');
      if (!policy.digit.test(passwordStr)) violations.push('one number');
      if (!policy.special.test(passwordStr)) violations.push('one special character');
      if (violations.length) {
        return res.status(400).json({ message: `Password must contain ${violations.join(', ')}` });
      }

      // Check if user already exists
      const userRepository = AppDataSource.getRepository(User);
      // Normalize email
      email = String(email).trim().toLowerCase();

      const existingUser = await userRepository.findOne({ where: { email } });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      // Create new user
      const user = new User();
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.phone = phone;
      user.password = password;
      user.gender = gender; // Save gender
      user.role = UserRole.PATIENT; // Default role
      user.isActive = true;

      // Validate user input
      const errors = await validate(user);
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
          const { PatientIdService } = await import('../services/patientId.service');
          const patientIdData = await PatientIdService.generatePatientId(location);
          user.globalPatientId = patientIdData.globalPatientId;
          user.locationCode = patientIdData.locationCode;
          user.registeredLocation = patientIdData.registeredLocation;
          user.registeredYear = patientIdData.registeredYear;
          user.patientSequenceNumber = patientIdData.patientSequenceNumber;
        } catch (error) {
          console.error('Failed to generate patient ID:', error);
          // Continue without patient ID - can be generated later
        }
      }
      
      // Save user
      await userRepository.save(user);

      // Send welcome email (don't wait for it)
      try {
        const { EmailService } = await import('../services/email.service');
        EmailService.sendWelcomeEmail(user.email, user.firstName).catch(err => 
          console.error('Failed to send welcome email:', err)
        );
      } catch (emailError) {
        console.error('Email service not available:', emailError);
      }

      // Prepare response (exclude password)
      const userResponse: UserResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role as UserRole,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return res.status(201).json({
        message: 'Registration successful',
        user: userResponse
      });

    } catch (error: unknown) {
      console.error('Registration error:', error);
      return res.status(500).json({ 
        message: 'An error occurred during registration',
        error: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
      });
    }
  };

  static logout = async (req: Request, res: Response) => {
    try {
      // Get refresh token from cookies or request body
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      
      if (refreshToken) {
        // Delete the refresh token from database
        const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
        await refreshTokenRepository.delete({ token: refreshToken });
        
        // Clear the refresh token cookie
        res.clearCookie('refreshToken');
      }
      
      return res.status(200).json({ message: 'Successfully logged out' });
    } catch (error: unknown) {
      console.error('Logout error:', error);
      return res.status(500).json({ 
        message: 'An error occurred during logout',
        error: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
      });
    }
  };

  static refreshToken = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      // Verify the refresh token
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
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
      const tokens = generateTokens(user);
      
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
    } catch (error: unknown) {
      console.error('Refresh token error:', error);
      return res.status(500).json({ 
        message: 'Failed to refresh token',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const userRepository = AppDataSource.getRepository(User);
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
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({ 
        message: 'Failed to process password reset request',
        error: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
      });
    }
  };

  static resetPassword = async (req: Request, res: Response) => {
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
      const userRepository = AppDataSource.getRepository(User);
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
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ 
        message: 'Failed to reset password',
        error: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
      });
    }
  };

  static getCurrentUser = async (req: Request, res: Response) => {
    try {
      // The user is already attached to req by the auth middleware
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Fetch fresh user data from database
      const userRepository = AppDataSource.getRepository(User);
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
    } catch (error) {
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
  static googleLogin = async (req: Request, res: Response) => {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({ message: 'Google credential is required' });
      }

      // Verify Google token and get user info
      const googleUser = await GoogleAuthService.verifyGoogleToken(credential);

      const userRepository = AppDataSource.getRepository(User);
      
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
      } else {
        // New user - create account
        user = userRepository.create({
          id: crypto.randomUUID(),
          email: googleUser.email,
          firstName: googleUser.given_name || googleUser.name.split(' ')[0] || 'User',
          lastName: googleUser.family_name || googleUser.name.split(' ').slice(1).join(' ') || '',
          phone: '', // Will be updated by user later
          password: crypto.randomBytes(32).toString('hex'), // Random password (won't be used)
          role: UserRole.PATIENT, // Default role for Google sign-ups
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
      const tokens = generateTokens(user);
      
      // Create refresh token in database
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      const refreshToken = refreshTokenRepository.create({
        token: tokens.refreshToken,
        user: user,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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

    } catch (error: unknown) {
      console.error('Google login error:', error);
      return res.status(500).json({ 
        message: 'Google authentication failed',
        error: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
      });
    }
  };
}
