import crypto from 'crypto';
import { AppDataSource } from '../config/database';

interface AccessRequestOTP {
  id: string;
  accessRequestId: string;
  otpCode: string;
  generatedAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  usedAt?: Date;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * OTP Service for generating and verifying OTP codes
 * Used for doctor access request verification
 */
export class OTPService {
  /**
   * Generate a cryptographically secure 6-digit OTP
   */
  static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Create and save OTP for access request
   * @param accessRequestId - The access request ID
   * @returns The generated OTP code
   */
  static async createOTP(accessRequestId: string): Promise<string> {
    const otpCode = this.generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    try {
      // Invalidate any existing unused OTPs for this request
      await AppDataSource.query(
        `UPDATE access_request_otps 
         SET is_used = true, updated_at = NOW() 
         WHERE access_request_id = $1 AND is_used = false`,
        [accessRequestId]
      );

      // Create new OTP
      await AppDataSource.query(
        `INSERT INTO access_request_otps 
         (access_request_id, otp_code, expires_at, is_used, attempts, max_attempts) 
         VALUES ($1, $2, $3, false, 0, 3)`,
        [accessRequestId, otpCode, expiresAt]
      );

      console.log(`✅ OTP generated for request ${accessRequestId}: ${otpCode}`);
      return otpCode;
    } catch (error) {
      console.error('❌ Failed to create OTP:', error);
      throw new Error('Failed to generate OTP');
    }
  }

  /**
   * Verify OTP code
   * @param accessRequestId - The access request ID
   * @param otpCode - The OTP code to verify
   * @returns Verification result with success status and message
   */
  static async verifyOTP(
    accessRequestId: string,
    otpCode: string
  ): Promise<{ valid: boolean; message: string }> {
    try {
      // Find the OTP
      const result = await AppDataSource.query(
        `SELECT * FROM access_request_otps 
         WHERE access_request_id = $1 AND otp_code = $2 
         ORDER BY created_at DESC LIMIT 1`,
        [accessRequestId, otpCode]
      );

      if (result.length === 0) {
        console.log(`❌ Invalid OTP for request ${accessRequestId}`);
        return { valid: false, message: 'Invalid OTP code' };
      }

      const otp = result[0];

      // Check if already used
      if (otp.is_used) {
        console.log(`❌ OTP already used for request ${accessRequestId}`);
        return { valid: false, message: 'OTP has already been used' };
      }

      // Check if expired
      if (new Date() > new Date(otp.expires_at)) {
        console.log(`❌ OTP expired for request ${accessRequestId}`);
        return { valid: false, message: 'OTP has expired' };
      }

      // Check attempts
      if (otp.attempts >= otp.max_attempts) {
        console.log(`❌ Max attempts exceeded for request ${accessRequestId}`);
        return { valid: false, message: 'Maximum verification attempts exceeded' };
      }

      // Increment attempts
      await AppDataSource.query(
        `UPDATE access_request_otps 
         SET attempts = attempts + 1, updated_at = NOW() 
         WHERE id = $1`,
        [otp.id]
      );

      console.log(`✅ OTP verified successfully for request ${accessRequestId}`);
      return { valid: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      return { valid: false, message: 'OTP verification failed' };
    }
  }

  /**
   * Mark OTP as used
   * @param accessRequestId - The access request ID
   * @param otpCode - The OTP code
   */
  static async markOTPAsUsed(accessRequestId: string, otpCode: string): Promise<void> {
    try {
      await AppDataSource.query(
        `UPDATE access_request_otps 
         SET is_used = true, used_at = NOW(), updated_at = NOW() 
         WHERE access_request_id = $1 AND otp_code = $2`,
        [accessRequestId, otpCode]
      );
      console.log(`✅ OTP marked as used for request ${accessRequestId}`);
    } catch (error) {
      console.error('❌ Failed to mark OTP as used:', error);
    }
  }

  /**
   * Resend OTP (generate new one and invalidate old)
   * @param accessRequestId - The access request ID
   * @returns The new OTP code
   */
  static async resendOTP(accessRequestId: string): Promise<string> {
    console.log(`🔄 Resending OTP for request ${accessRequestId}`);
    return this.createOTP(accessRequestId);
  }

  /**
   * Clean up expired OTPs (can be run as a cron job)
   */
  static async cleanupExpiredOTPs(): Promise<number> {
    try {
      const result = await AppDataSource.query(
        `DELETE FROM access_request_otps 
         WHERE expires_at < NOW() AND is_used = false 
         RETURNING id`
      );
      const count = result.length;
      console.log(`🧹 Cleaned up ${count} expired OTPs`);
      return count;
    } catch (error) {
      console.error('❌ Failed to cleanup expired OTPs:', error);
      return 0;
    }
  }
}

export default OTPService;
