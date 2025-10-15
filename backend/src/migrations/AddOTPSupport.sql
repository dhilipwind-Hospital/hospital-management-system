-- Migration: Add OTP Support for Cross-Branch Access
-- Date: 2025-10-13
-- Description: Adds OTP verification for doctor access requests

-- Create OTP table
CREATE TABLE IF NOT EXISTS access_request_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    access_request_id UUID NOT NULL REFERENCES patient_access_requests(id) ON DELETE CASCADE,
    otp_code VARCHAR(6) NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_access_request_otps_request_id ON access_request_otps(access_request_id);
CREATE INDEX IF NOT EXISTS idx_access_request_otps_code ON access_request_otps(otp_code);
CREATE INDEX IF NOT EXISTS idx_access_request_otps_expires ON access_request_otps(expires_at);

-- Add OTP verification columns to patient_access_requests
ALTER TABLE patient_access_requests 
ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS otp_verified_at TIMESTAMP;

-- Add comment
COMMENT ON TABLE access_request_otps IS 'Stores OTP codes for doctor access request verification';
COMMENT ON COLUMN access_request_otps.otp_code IS '6-digit OTP code sent to patient';
COMMENT ON COLUMN access_request_otps.expires_at IS 'OTP expires after 15 minutes';
COMMENT ON COLUMN access_request_otps.attempts IS 'Number of verification attempts';
COMMENT ON COLUMN access_request_otps.max_attempts IS 'Maximum allowed attempts (default 3)';
