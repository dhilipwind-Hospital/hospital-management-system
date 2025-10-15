"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderController = void 0;
const database_1 = require("../config/database");
const Reminder_1 = require("../models/Reminder");
const User_1 = require("../models/User");
const Appointment_1 = require("../models/Appointment");
const typeorm_1 = require("typeorm");
class ReminderController {
}
exports.ReminderController = ReminderController;
_a = ReminderController;
// Create reminder
ReminderController.createReminder = async (req, res) => {
    try {
        const { userId, type, title, message, scheduledFor, appointmentId, medicationName, sendEmail, sendSms, sendNotification } = req.body;
        if (!userId || !type || !title || !message || !scheduledFor) {
            return res.status(400).json({ message: 'Required fields missing' });
        }
        const reminderRepo = database_1.AppDataSource.getRepository(Reminder_1.Reminder);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const reminder = reminderRepo.create({
            user,
            type,
            title,
            message,
            scheduledFor: new Date(scheduledFor),
            medicationName,
            sendEmail: sendEmail || false,
            sendSms: sendSms || false,
            sendNotification: sendNotification !== false
        });
        if (appointmentId) {
            const appointmentRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
            const appointment = await appointmentRepo.findOne({ where: { id: appointmentId } });
            if (appointment) {
                reminder.appointment = appointment;
            }
        }
        await reminderRepo.save(reminder);
        return res.status(201).json({
            message: 'Reminder created successfully',
            data: reminder
        });
    }
    catch (error) {
        console.error('Error creating reminder:', error);
        return res.status(500).json({ message: 'Error creating reminder' });
    }
};
// Get user reminders
ReminderController.getUserReminders = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const { status, type } = req.query;
        const reminderRepo = database_1.AppDataSource.getRepository(Reminder_1.Reminder);
        const queryBuilder = reminderRepo.createQueryBuilder('reminder')
            .leftJoinAndSelect('reminder.appointment', 'appointment')
            .where('reminder.userId = :userId', { userId })
            .orderBy('reminder.scheduledFor', 'ASC');
        if (status) {
            queryBuilder.andWhere('reminder.status = :status', { status });
        }
        if (type) {
            queryBuilder.andWhere('reminder.type = :type', { type });
        }
        const reminders = await queryBuilder.getMany();
        return res.json({
            data: reminders,
            total: reminders.length
        });
    }
    catch (error) {
        console.error('Error fetching reminders:', error);
        return res.status(500).json({ message: 'Error fetching reminders' });
    }
};
// Get pending reminders (for scheduler)
ReminderController.getPendingReminders = async (req, res) => {
    try {
        const reminderRepo = database_1.AppDataSource.getRepository(Reminder_1.Reminder);
        const now = new Date();
        const reminders = await reminderRepo.find({
            where: {
                status: Reminder_1.ReminderStatus.PENDING,
                scheduledFor: (0, typeorm_1.LessThan)(now)
            },
            relations: ['user', 'appointment']
        });
        return res.json({
            data: reminders,
            total: reminders.length
        });
    }
    catch (error) {
        console.error('Error fetching pending reminders:', error);
        return res.status(500).json({ message: 'Error fetching pending reminders' });
    }
};
// Update reminder status
ReminderController.updateReminderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const reminderRepo = database_1.AppDataSource.getRepository(Reminder_1.Reminder);
        const reminder = await reminderRepo.findOne({ where: { id } });
        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        reminder.status = status;
        if (status === Reminder_1.ReminderStatus.SENT) {
            reminder.sentAt = new Date();
        }
        await reminderRepo.save(reminder);
        return res.json({
            message: 'Reminder status updated',
            data: reminder
        });
    }
    catch (error) {
        console.error('Error updating reminder:', error);
        return res.status(500).json({ message: 'Error updating reminder' });
    }
};
// Delete reminder
ReminderController.deleteReminder = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const { id } = req.params;
        const reminderRepo = database_1.AppDataSource.getRepository(Reminder_1.Reminder);
        const reminder = await reminderRepo.findOne({
            where: { id },
            relations: ['user']
        });
        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        if (reminder.user.id !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await reminderRepo.remove(reminder);
        return res.json({ message: 'Reminder deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting reminder:', error);
        return res.status(500).json({ message: 'Error deleting reminder' });
    }
};
// Auto-create appointment reminders
ReminderController.createAppointmentReminders = async (req, res) => {
    var _b, _c;
    try {
        const appointmentRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const reminderRepo = database_1.AppDataSource.getRepository(Reminder_1.Reminder);
        // Get upcoming appointments (next 7 days)
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const appointments = await appointmentRepo
            .createQueryBuilder('appointment')
            .leftJoinAndSelect('appointment.patient', 'patient')
            .leftJoinAndSelect('appointment.doctor', 'doctor')
            .where('appointment.startTime BETWEEN :now AND :nextWeek', { now, nextWeek })
            .andWhere('appointment.status = :status', { status: 'confirmed' })
            .getMany();
        const remindersCreated = [];
        for (const appointment of appointments) {
            // Check if reminder already exists
            const existingReminder = await reminderRepo.findOne({
                where: {
                    appointment: { id: appointment.id },
                    type: Reminder_1.ReminderType.APPOINTMENT
                }
            });
            if (!existingReminder && appointment.patient) {
                // Create reminder for 24 hours before appointment
                const reminderTime = new Date(appointment.startTime.getTime() - 24 * 60 * 60 * 1000);
                const reminder = reminderRepo.create({
                    user: appointment.patient,
                    type: Reminder_1.ReminderType.APPOINTMENT,
                    title: 'Appointment Reminder',
                    message: `You have an appointment with Dr. ${(_b = appointment.doctor) === null || _b === void 0 ? void 0 : _b.firstName} ${(_c = appointment.doctor) === null || _c === void 0 ? void 0 : _c.lastName} tomorrow at ${appointment.startTime.toLocaleTimeString()}.`,
                    scheduledFor: reminderTime,
                    appointment,
                    sendNotification: true,
                    sendEmail: true
                });
                await reminderRepo.save(reminder);
                remindersCreated.push(reminder);
            }
        }
        return res.json({
            message: `Created ${remindersCreated.length} appointment reminders`,
            data: remindersCreated
        });
    }
    catch (error) {
        console.error('Error creating appointment reminders:', error);
        return res.status(500).json({ message: 'Error creating appointment reminders' });
    }
};
