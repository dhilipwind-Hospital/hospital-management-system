"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const email_service_1 = require("../services/email.service");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
async function sendTestEmail() {
    try {
        console.log('📧 Initializing email service...\n');
        // Initialize email service
        email_service_1.EmailService.initialize();
        console.log('📧 Email Configuration:');
        console.log('========================');
        console.log('SMTP Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
        console.log('SMTP Port:', process.env.SMTP_PORT || '587');
        console.log('SMTP User:', process.env.SMTP_USER || 'Not configured');
        console.log('From Name:', process.env.SMTP_FROM_NAME || 'Hospital Management System');
        console.log('\n');
        // Send test email
        console.log('📤 Sending test email to: dhilipwind@gmail.com\n');
        const success = await email_service_1.EmailService.sendEmail({
            to: 'dhilipwind@gmail.com',
            subject: '🔔 Test Email from Hospital Management System',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d1fae5; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Email Notification System Test</h1>
            </div>
            <div class="content">
              <h2>Hello Dhilip!</h2>
              
              <div class="success-box">
                <h3>✅ Email System is Working!</h3>
                <p>This is a test email sent at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              </div>
              
              <p>Your Hospital Management System email notification service is now fully operational!</p>
              
              <h3>What You'll Receive:</h3>
              <ul>
                <li>📅 Appointment confirmations</li>
                <li>⏰ Appointment reminders</li>
                <li>💊 Prescription notifications</li>
                <li>📋 Test result notifications</li>
                <li>🔔 System announcements</li>
                <li>💬 Message notifications</li>
              </ul>
              
              <p><strong>Email sent successfully to: dhilipwind@gmail.com</strong></p>
              
              <p style="margin-top: 30px;">If you received this email, your notification system is working perfectly! 🎊</p>
            </div>
            <div class="footer">
              <p>© 2025 Hospital Management System. All rights reserved.</p>
              <p>This is a test email from your notification system.</p>
            </div>
          </div>
        </body>
        </html>
      `
        });
        if (success) {
            console.log('✅ SUCCESS!');
            console.log('===========');
            console.log('✅ Test email sent successfully to dhilipwind@gmail.com');
            console.log('✅ Email notification system is working!');
            console.log('\n📧 Please check your inbox at dhilipwind@gmail.com');
            console.log('📧 Also check spam/junk folder if not in inbox');
            console.log('\n🎊 Email notification system is ready for production!');
        }
        else {
            console.log('❌ FAILED!');
            console.log('=========');
            console.log('❌ Failed to send test email');
            console.log('\n🔧 Please check:');
            console.log('1. SMTP configuration in .env file');
            console.log('2. SMTP_USER and SMTP_PASS are correct');
            console.log('3. If using Gmail, enable "App Passwords"');
            console.log('4. Check firewall/network settings');
        }
    }
    catch (error) {
        console.error('\n❌ Error:', error);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure .env file has SMTP configuration');
        console.log('2. For Gmail: Enable 2FA and create App Password');
        console.log('3. Use App Password instead of regular password');
        console.log('4. Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
    }
}
sendTestEmail();
