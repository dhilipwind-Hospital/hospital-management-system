"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const Notification_1 = require("../models/Notification");
class EmailService {
    // Initialize email transporter
    static initialize() {
        // Configure SMTP transporter
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || 'your-email@gmail.com',
                pass: process.env.SMTP_PASS || 'your-app-password'
            }
        });
        console.log('📧 Email service initialized');
    }
    // Send email
    static async sendEmail(options) {
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
        }
        catch (error) {
            console.error('❌ Error sending email:', error);
            return false;
        }
    }
    // Send welcome email
    static async sendWelcomeEmail(email, firstName) {
        const subject = '🎉 Welcome to Ayphen Hospital Dhilip!';
        const html = this.getWelcomeEmailTemplate(firstName);
        return await this.sendEmail({ to: email, subject, html });
    }
    // Send appointment confirmation email
    static async sendAppointmentConfirmationEmail(email, patientName, doctorName, appointmentTime, department) {
        const subject = '✅ Appointment Confirmed - Hospital Management System';
        const html = this.getAppointmentConfirmationTemplate(patientName, doctorName, appointmentTime, department);
        return await this.sendEmail({ to: email, subject, html });
    }
    // Send appointment reminder email
    static async sendAppointmentReminderEmail(email, patientName, doctorName, appointmentTime) {
        const subject = '⏰ Appointment Reminder - Tomorrow';
        const html = this.getAppointmentReminderTemplate(patientName, doctorName, appointmentTime);
        return await this.sendEmail({ to: email, subject, html });
    }
    // Send prescription notification email
    static async sendPrescriptionNotificationEmail(email, patientName, doctorName) {
        const subject = '💊 New Prescription Available';
        const html = this.getPrescriptionNotificationTemplate(patientName, doctorName);
        return await this.sendEmail({ to: email, subject, html });
    }
    // Send test result notification email
    static async sendTestResultNotificationEmail(email, patientName, testName) {
        const subject = '📋 Test Results Available';
        const html = this.getTestResultNotificationTemplate(patientName, testName);
        return await this.sendEmail({ to: email, subject, html });
    }
    // Send notification email (generic)
    static async sendNotificationEmail(email, title, message, type) {
        const subject = `🔔 ${title}`;
        const html = this.getGenericNotificationTemplate(title, message, type);
        return await this.sendEmail({ to: email, subject, html });
    }
    // Email Templates
    static getWelcomeEmailTemplate(firstName) {
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
    static getAppointmentConfirmationTemplate(patientName, doctorName, appointmentTime, department) {
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
    static getAppointmentReminderTemplate(patientName, doctorName, appointmentTime) {
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
    static getPrescriptionNotificationTemplate(patientName, doctorName) {
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
    static getTestResultNotificationTemplate(patientName, testName) {
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
    static getGenericNotificationTemplate(title, message, type) {
        const colors = {
            [Notification_1.NotificationType.SYSTEM_ANNOUNCEMENT]: '#6366f1',
            [Notification_1.NotificationType.EMERGENCY_NEW]: '#ef4444',
            [Notification_1.NotificationType.EMERGENCY_ASSIGNED]: '#ef4444',
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
}
exports.EmailService = EmailService;
