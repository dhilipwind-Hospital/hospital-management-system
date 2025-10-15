"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_controller_1 = require("../controllers/notification.controller");
const Notification_1 = require("../models/Notification");
const email_service_1 = require("./email.service");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
/**
 * Notification Service - Helper functions to trigger notifications from other parts of the app
 * Now includes email notifications!
 */
class NotificationService {
    // Appointment notifications
    static async notifyNewAppointment(doctorId, appointmentId, patientName, appointmentTime) {
        await notification_controller_1.NotificationController.createNotification(doctorId, Notification_1.NotificationType.APPOINTMENT_NEW, 'New Appointment', `New appointment with ${patientName} scheduled for ${appointmentTime}`, {
            priority: Notification_1.NotificationPriority.HIGH,
            metadata: { appointmentId },
            actionUrl: `/appointments`,
            actionLabel: 'View Appointment'
        });
    }
    static async notifyAppointmentConfirmed(patientId, appointmentTime, doctorName, department) {
        // Send in-app notification
        await notification_controller_1.NotificationController.createNotification(patientId, Notification_1.NotificationType.APPOINTMENT_CONFIRMED, 'Appointment Confirmed', `Your appointment with Dr. ${doctorName} on ${appointmentTime} has been confirmed`, {
            priority: Notification_1.NotificationPriority.MEDIUM,
            actionUrl: `/portal`,
            actionLabel: 'View Details'
        });
        // Send email notification
        try {
            const userRepo = database_1.AppDataSource.getRepository(User_1.User);
            const user = await userRepo.findOne({ where: { id: patientId } });
            if (user && user.email) {
                await email_service_1.EmailService.sendAppointmentConfirmationEmail(user.email, `${user.firstName} ${user.lastName}`, doctorName, appointmentTime, department || 'General');
            }
        }
        catch (error) {
            console.error('Error sending appointment confirmation email:', error);
        }
    }
    static async notifyAppointmentCancelled(userId, appointmentTime, reason) {
        await notification_controller_1.NotificationController.createNotification(userId, Notification_1.NotificationType.APPOINTMENT_CANCELLED, 'Appointment Cancelled', `Your appointment on ${appointmentTime} has been cancelled. ${reason ? `Reason: ${reason}` : ''}`, {
            priority: Notification_1.NotificationPriority.HIGH,
            actionUrl: `/appointments/book`,
            actionLabel: 'Book New Appointment'
        });
    }
    static async notifyAppointmentRescheduled(userId, oldTime, newTime) {
        await notification_controller_1.NotificationController.createNotification(userId, Notification_1.NotificationType.APPOINTMENT_RESCHEDULED, 'Appointment Rescheduled', `Your appointment has been rescheduled from ${oldTime} to ${newTime}`, {
            priority: Notification_1.NotificationPriority.MEDIUM,
            actionUrl: `/portal`,
            actionLabel: 'View Details'
        });
    }
    static async notifyAppointmentReminder(patientId, appointmentTime, doctorName) {
        await notification_controller_1.NotificationController.createNotification(patientId, Notification_1.NotificationType.APPOINTMENT_REMINDER, 'Appointment Reminder', `Reminder: You have an appointment with Dr. ${doctorName} tomorrow at ${appointmentTime}`, {
            priority: Notification_1.NotificationPriority.HIGH,
            actionUrl: `/portal`,
            actionLabel: 'View Details'
        });
    }
    // Emergency notifications
    static async notifyNewEmergency(staffIds, patientName, location) {
        await notification_controller_1.NotificationController.broadcastNotification(staffIds, Notification_1.NotificationType.EMERGENCY_NEW, '🚨 New Emergency Request', `Emergency request from ${patientName}${location ? ` at ${location}` : ''}`, {
            priority: Notification_1.NotificationPriority.URGENT,
            actionUrl: `/admin/emergency-dashboard`,
            actionLabel: 'View Emergency'
        });
    }
    static async notifyEmergencyAssigned(userId, patientName) {
        await notification_controller_1.NotificationController.createNotification(userId, Notification_1.NotificationType.EMERGENCY_ASSIGNED, 'Emergency Assigned to You', `You have been assigned to handle emergency request from ${patientName}`, {
            priority: Notification_1.NotificationPriority.URGENT,
            actionUrl: `/admin/emergency-dashboard`,
            actionLabel: 'View Details'
        });
    }
    // Callback notifications
    static async notifyNewCallback(staffIds, patientName, phone) {
        await notification_controller_1.NotificationController.broadcastNotification(staffIds, Notification_1.NotificationType.CALLBACK_NEW, 'New Callback Request', `Callback requested by ${patientName} (${phone})`, {
            priority: Notification_1.NotificationPriority.MEDIUM,
            actionUrl: `/admin/callback-queue`,
            actionLabel: 'View Queue'
        });
    }
    static async notifyCallbackAssigned(userId, patientName) {
        await notification_controller_1.NotificationController.createNotification(userId, Notification_1.NotificationType.CALLBACK_ASSIGNED, 'Callback Assigned to You', `You have been assigned to call back ${patientName}`, {
            priority: Notification_1.NotificationPriority.MEDIUM,
            actionUrl: `/admin/callback-queue`,
            actionLabel: 'View Details'
        });
    }
    // Prescription notifications
    static async notifyPrescriptionReady(patientId, prescriptionId) {
        await notification_controller_1.NotificationController.createNotification(patientId, Notification_1.NotificationType.PRESCRIPTION_READY, 'Prescription Ready', 'Your prescription is ready for pickup at the pharmacy', {
            priority: Notification_1.NotificationPriority.MEDIUM,
            actionUrl: `/portal`,
            actionLabel: 'View Details'
        });
    }
    static async notifyNewPrescription(patientId, doctorName) {
        await notification_controller_1.NotificationController.createNotification(patientId, Notification_1.NotificationType.PRESCRIPTION_NEW, 'New Prescription', `Dr. ${doctorName} has prescribed new medication for you`, {
            priority: Notification_1.NotificationPriority.MEDIUM,
            actionUrl: `/portal/records`,
            actionLabel: 'View Prescription'
        });
    }
    // Test result notifications
    static async notifyTestResultReady(patientId, testName) {
        await notification_controller_1.NotificationController.createNotification(patientId, Notification_1.NotificationType.TEST_RESULT_READY, 'Test Results Available', `Your ${testName} results are now available`, {
            priority: Notification_1.NotificationPriority.HIGH,
            actionUrl: `/portal/records`,
            actionLabel: 'View Results'
        });
    }
}
exports.NotificationService = NotificationService;
