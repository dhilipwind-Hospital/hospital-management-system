import nodemailer from 'nodemailer';
import { NotificationType } from '../models/Notification';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter;

  // Initialize email transporter
  static initialize() {
    // Configure SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
      }
    });

    console.log('📧 Email service initialized');
  }

  // Send email
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.initialize();
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Ayphen Hospital Dhilip'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  }

  // Send welcome email
  static async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const subject = '🎉 Welcome to Ayphen Hospital Dhilip!';
    const html = this.getWelcomeEmailTemplate(firstName);
    
    return await this.sendEmail({ to: email, subject, html });
  }

  // Send appointment confirmation email
  static async sendAppointmentConfirmationEmail(
    email: string,
    patientName: string,
    doctorName: string,
    appointmentTime: string,
    department: string
  ): Promise<boolean> {
    const subject = '✅ Appointment Confirmed - Hospital Management System';
    const html = this.getAppointmentConfirmationTemplate(patientName, doctorName, appointmentTime, department);
    
    return await this.sendEmail({ to: email, subject, html });
  }

  // Send appointment reminder email
  static async sendAppointmentReminderEmail(
    email: string,
    patientName: string,
    doctorName: string,
    appointmentTime: string
  ): Promise<boolean> {
    const subject = '⏰ Appointment Reminder - Tomorrow';
    const html = this.getAppointmentReminderTemplate(patientName, doctorName, appointmentTime);
    
    return await this.sendEmail({ to: email, subject, html });
  }

  // Send prescription notification email
  static async sendPrescriptionNotificationEmail(
    email: string,
    patientName: string,
    doctorName: string
  ): Promise<boolean> {
    const subject = '💊 New Prescription Available';
    const html = this.getPrescriptionNotificationTemplate(patientName, doctorName);
    
    return await this.sendEmail({ to: email, subject, html });
  }

  // Send test result notification email
  static async sendTestResultNotificationEmail(
    email: string,
    patientName: string,
    testName: string
  ): Promise<boolean> {
    const subject = '📋 Test Results Available';
    const html = this.getTestResultNotificationTemplate(patientName, testName);
    
    return await this.sendEmail({ to: email, subject, html });
  }

  // Send notification email (generic)
  static async sendNotificationEmail(
    email: string,
    title: string,
    message: string,
    type: NotificationType
  ): Promise<boolean> {
    const subject = `🔔 ${title}`;
    const html = this.getGenericNotificationTemplate(title, message, type);
    
    return await this.sendEmail({ to: email, subject, html });
  }

  // Send patient access request notification to patient
  static async sendAccessRequestNotificationEmail(
    email: string,
    patientName: string,
    doctorName: string,
    doctorDepartment: string,
    reason: string,
    durationHours: number,
    requestId: string
  ): Promise<boolean> {
    const subject = '🔐 New Medical Record Access Request';
    const html = this.getAccessRequestNotificationTemplate(
      patientName,
      doctorName,
      doctorDepartment,
      reason,
      durationHours,
      requestId
    );
    
    return await this.sendEmail({ to: email, subject, html });
  }

  // Send access request with OTP to patient
  static async sendAccessRequestWithOTP(
    email: string,
    patientName: string,
    doctorName: string,
    doctorDepartment: string,
    reason: string,
    durationHours: number,
    otpCode: string,
    requestId: string
  ): Promise<boolean> {
    const subject = '🔐 Doctor Access Request - Share OTP Code';
    const html = this.getAccessRequestWithOTPTemplate(
      patientName,
      doctorName,
      doctorDepartment,
      reason,
      durationHours,
      otpCode,
      requestId
    );
    
    return await this.sendEmail({ to: email, subject, html });
  }

  // Send access request approval notification to doctor
  static async sendAccessApprovedNotificationEmail(
    email: string,
    doctorName: string,
    patientName: string,
    expiresAt: Date
  ): Promise<boolean> {
    const subject = '✅ Patient Access Request Approved';
    const html = this.getAccessApprovedNotificationTemplate(
      doctorName,
      patientName,
      expiresAt
    );
    
    return await this.sendEmail({ to: email, subject, html });
  }

  // Send access request rejection notification to doctor
  static async sendAccessRejectedNotificationEmail(
    email: string,
    doctorName: string,
    patientName: string,
    rejectionReason?: string
  ): Promise<boolean> {
    const subject = '❌ Patient Access Request Rejected';
    const html = this.getAccessRejectedNotificationTemplate(
      doctorName,
      patientName,
      rejectionReason
    );
    
    return await this.sendEmail({ to: email, subject, html });
  }

  // Email Templates

  private static getWelcomeEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Ayphen Hospital Dhilip!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Thank you for registering with Ayphen Hospital Dhilip. Your account has been created successfully!</p>
            
            <h3>What you can do:</h3>
            <ul>
              <li>📅 Book appointments with doctors</li>
              <li>📋 View your medical records</li>
              <li>💊 Access prescriptions</li>
              <li>📊 Track your health history</li>
              <li>💬 Communicate with healthcare providers</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login to Your Account</a>
            
            <p style="margin-top: 30px;">If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
            <p>© 2025 Ayphen Hospital Dhilip. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static getAppointmentConfirmationTemplate(
    patientName: string,
    doctorName: string,
    appointmentTime: string,
    department: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Appointment Confirmed</h1>
          </div>
          <div class="content">
            <h2>Hello ${patientName}!</h2>
            <p>Your appointment has been confirmed. Here are the details:</p>
            
            <div class="appointment-details">
              <p><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}</p>
              <p><strong>🏥 Department:</strong> ${department}</p>
              <p><strong>📅 Date & Time:</strong> ${appointmentTime}</p>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>Please arrive 15 minutes before your appointment</li>
              <li>Bring your ID and insurance card</li>
              <li>Bring any relevant medical records</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal" class="button">View Appointment</a>
            
            <p style="margin-top: 30px;">Need to reschedule? Contact us or manage your appointment online.</p>
          </div>
          <div class="footer">
            <p>© 2025 Hospital Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static getAppointmentReminderTemplate(
    patientName: string,
    doctorName: string,
    appointmentTime: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reminder-box { background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Appointment Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello ${patientName}!</h2>
            <p>This is a friendly reminder about your upcoming appointment:</p>
            
            <div class="reminder-box">
              <p><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}</p>
              <p><strong>📅 Date & Time:</strong> ${appointmentTime}</p>
              <p><strong>⏰ Time:</strong> Tomorrow</p>
            </div>
            
            <p><strong>Please remember to:</strong></p>
            <ul>
              <li>✅ Arrive 15 minutes early</li>
              <li>✅ Bring your ID and insurance card</li>
              <li>✅ Bring any relevant medical records</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal" class="button">View Details</a>
            
            <p style="margin-top: 30px;">Need to cancel or reschedule? Please contact us as soon as possible.</p>
          </div>
          <div class="footer">
            <p>© 2025 Hospital Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static getPrescriptionNotificationTemplate(
    patientName: string,
    doctorName: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8b5cf6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .prescription-box { background: white; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💊 New Prescription Available</h1>
          </div>
          <div class="content">
            <h2>Hello ${patientName}!</h2>
            <p>Dr. ${doctorName} has prescribed new medication for you.</p>
            
            <div class="prescription-box">
              <p>Your prescription is now available in your patient portal.</p>
              <p>You can view the details and pick it up from the pharmacy.</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal/records" class="button">View Prescription</a>
            
            <p style="margin-top: 30px;"><strong>Important:</strong> Please follow the dosage instructions carefully.</p>
          </div>
          <div class="footer">
            <p>© 2025 Hospital Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static getTestResultNotificationTemplate(
    patientName: string,
    testName: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .result-box { background: white; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Test Results Available</h1>
          </div>
          <div class="content">
            <h2>Hello ${patientName}!</h2>
            <p>Your ${testName} results are now available.</p>
            
            <div class="result-box">
              <p>You can view your test results in your patient portal.</p>
              <p>If you have any questions about your results, please contact your doctor.</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal/records" class="button">View Results</a>
            
            <p style="margin-top: 30px;">Your healthcare provider will discuss the results with you if needed.</p>
          </div>
          <div class="footer">
            <p>© 2025 Hospital Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static getGenericNotificationTemplate(
    title: string,
    message: string,
    type: NotificationType
  ): string {
    const colors: Record<string, string> = {
      [NotificationType.SYSTEM_ANNOUNCEMENT]: '#6366f1',
      [NotificationType.EMERGENCY_NEW]: '#ef4444',
      [NotificationType.EMERGENCY_ASSIGNED]: '#ef4444',
      default: '#667eea'
    };

    const color = colors[type] || colors.default;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-box { background: white; padding: 20px; border-left: 4px solid ${color}; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: ${color}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 ${title}</h1>
          </div>
          <div class="content">
            <div class="message-box">
              <p>${message}</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/notifications" class="button">View in Portal</a>
          </div>
          <div class="footer">
            <p>© 2025 Hospital Management System. All rights reserved.</p>
            <p>This is an automated notification. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static getAccessRequestNotificationTemplate(
    patientName: string,
    doctorName: string,
    doctorDepartment: string,
    reason: string,
    durationHours: number,
    requestId: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ec407a; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .request-box { background: white; padding: 20px; border-left: 4px solid #ec407a; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; margin: 10px 5px; color: white; text-decoration: none; border-radius: 5px; }
          .approve-btn { background: #10b981; }
          .reject-btn { background: #ef4444; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Medical Record Access Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${patientName}!</h2>
            <p>A doctor has requested access to your medical records. Please review the details below:</p>
            
            <div class="request-box">
              <p><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}</p>
              <p><strong>🏥 Department:</strong> ${doctorDepartment}</p>
              <p><strong>⏰ Access Duration:</strong> ${durationHours} hours</p>
              <p><strong>📝 Reason:</strong></p>
              <p style="padding-left: 20px; font-style: italic;">${reason}</p>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Important:</strong> This doctor is requesting temporary access to view your medical history, prescriptions, and test results. You can approve or reject this request.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/review-access-request?requestId=${requestId}" class="button approve-btn">✅ Review Request</a>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>If you approve, the doctor will have read-only access for ${durationHours} hours</li>
              <li>Access will automatically expire after the duration</li>
              <li>You can view all access logs in your patient portal</li>
              <li>If you reject, the doctor will be notified</li>
            </ul>
            
            <p style="margin-top: 30px; color: #666;">If you did not expect this request or have concerns, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>© 2025 Ayphen Hospital. All rights reserved.</p>
            <p>This is an automated notification. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static getAccessRequestWithOTPTemplate(
    patientName: string,
    doctorName: string,
    doctorDepartment: string,
    reason: string,
    durationHours: number,
    otpCode: string,
    requestId: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1890ff; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .request-box { background: white; padding: 20px; border-left: 4px solid #1890ff; margin: 20px 0; }
          .otp-box { 
            background: white; 
            padding: 40px; 
            border: 3px dashed #1890ff; 
            margin: 30px 0; 
            text-align: center;
            border-radius: 10px;
          }
          .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #1890ff;
            letter-spacing: 12px;
            font-family: 'Courier New', monospace;
            margin: 20px 0;
          }
          .instruction-box {
            background: #e6f7ff;
            border-left: 4px solid #1890ff;
            padding: 20px;
            margin: 20px 0;
          }
          .warning { background: #fff7e6; padding: 15px; border-left: 4px solid #faad14; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Access Request - OTP Required</h1>
          </div>
          <div class="content">
            <h2>Hello ${patientName}!</h2>
            <p><strong>Dr. ${doctorName}</strong> from <strong>${doctorDepartment}</strong> is requesting access to your medical records.</p>
            
            <div class="request-box">
              <p><strong>📋 Reason:</strong> ${reason}</p>
              <p><strong>⏰ Duration:</strong> ${durationHours} hours</p>
            </div>

            <div class="instruction-box">
              <h3 style="margin-top: 0;">📱 Two Ways to Grant Access:</h3>
              <p><strong>Option A: Share OTP with Doctor (Quick)</strong></p>
              <ol style="text-align: left; margin: 10px 0;">
                <li><strong>Share the code below</strong> with the doctor</li>
                <li>Doctor will <strong>enter the code</strong> in their system</li>
                <li>Access will be <strong>granted automatically</strong></li>
              </ol>
              <p style="margin-top: 15px;"><strong>Option B: Review Online (Traditional)</strong></p>
              <ol style="text-align: left; margin: 10px 0;">
                <li><strong>Click the "Review Request" button</strong> below</li>
                <li><strong>Login to your patient portal</strong></li>
                <li><strong>Approve or reject</strong> the request</li>
              </ol>
            </div>

            <div class="otp-box">
              <p style="margin: 0; font-size: 16px; color: #666; font-weight: bold;">YOUR VERIFICATION CODE (Option A)</p>
              <div class="otp-code">${otpCode}</div>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #999;">
                ⏰ Valid for 15 minutes | 🔒 One-time use only
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/review-access-request?requestId=${requestId}" 
                 style="display: inline-block; padding: 15px 40px; background: #52c41a; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                ✅ Review Request Online (Option B)
              </a>
            </div>

            <div class="warning">
              <p><strong>⚠️ Security Guidelines:</strong></p>
              <ul style="margin: 10px 0;">
                <li><strong>Only share</strong> this code with <strong>Dr. ${doctorName}</strong></li>
                <li>Code expires in <strong>15 minutes</strong></li>
                <li>Code can only be used <strong>once</strong></li>
                <li><strong>Never share</strong> this code via email or social media</li>
              </ul>
            </div>

            <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>💡 What happens after sharing the code?</strong></p>
              <ul>
                <li>Doctor will have <strong>read-only access</strong> to your records</li>
                <li>Access will last for <strong>${durationHours} hours</strong></li>
                <li>All access is <strong>logged and audited</strong></li>
                <li>You can view access logs in your patient portal</li>
              </ul>
            </div>

            <p style="margin-top: 30px; color: #666;">
              <strong>Didn't request this?</strong> If you did not authorize this access request, 
              do not share the code and contact our support team immediately.
            </p>
          </div>
          <div class="footer">
            <p>© 2025 Ayphen Hospital. All rights reserved.</p>
            <p>This is an automated notification. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static getAccessApprovedNotificationTemplate(
    doctorName: string,
    patientName: string,
    expiresAt: Date
  ): string {
    const expiryDate = expiresAt.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Access Request Approved</h1>
          </div>
          <div class="content">
            <h2>Hello Dr. ${doctorName}!</h2>
            <p>Great news! Your request to access patient records has been approved.</p>
            
            <div class="success-box">
              <p><strong>👤 Patient:</strong> ${patientName}</p>
              <p><strong>⏰ Access Expires:</strong> ${expiryDate}</p>
              <p><strong>✅ Status:</strong> Active</p>
            </div>
            
            <p><strong>You can now:</strong></p>
            <ul>
              <li>View patient's medical history</li>
              <li>Access prescriptions and test results</li>
              <li>Review consultation notes</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/doctor/shared-patients" class="button">View Patient Records</a>
            
            <p style="margin-top: 30px; color: #666;"><strong>Note:</strong> Access will automatically expire at the specified time. All access is logged for security and compliance.</p>
          </div>
          <div class="footer">
            <p>© 2025 Ayphen Hospital. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static getAccessRejectedNotificationTemplate(
    doctorName: string,
    patientName: string,
    rejectionReason?: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .rejection-box { background: white; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Access Request Declined</h1>
          </div>
          <div class="content">
            <h2>Hello Dr. ${doctorName}!</h2>
            <p>Your request to access patient records has been declined by the patient.</p>
            
            <div class="rejection-box">
              <p><strong>👤 Patient:</strong> ${patientName}</p>
              <p><strong>❌ Status:</strong> Rejected</p>
              ${rejectionReason ? `<p><strong>📝 Reason:</strong> ${rejectionReason}</p>` : ''}
            </div>
            
            <p>The patient has chosen not to grant access to their medical records at this time. This is their right under patient privacy regulations.</p>
            
            <p><strong>Next steps:</strong></p>
            <ul>
              <li>If this patient is under your care, you may request access again with additional context</li>
              <li>Contact the patient directly if you need to discuss their care</li>
              <li>Consult with administration if you believe access is medically necessary</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/doctor/my-patients" class="button">Back to My Patients</a>
          </div>
          <div class="footer">
            <p>© 2025 Ayphen Hospital. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
