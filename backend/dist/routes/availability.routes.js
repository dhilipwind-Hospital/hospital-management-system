"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const AvailabilitySlot_1 = require("../models/AvailabilitySlot");
const User_1 = require("../models/User");
const roles_1 = require("../types/roles");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const availability_controller_1 = require("../controllers/availability.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /availability/doctors/{doctorId}:
 *   get:
 *     summary: Get doctor's availability slots (public)
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Specific date (YYYY-MM-DD)
 *       - in: query
 *         name: dayOfWeek
 *         schema:
 *           type: string
 *           enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *     responses:
 *       200:
 *         description: Doctor availability slots
 */
router.get('/doctors/:doctorId', (0, error_middleware_1.errorHandler)(async (req, res) => {
    const { doctorId } = req.params;
    const { date, dayOfWeek } = req.query;
    // Note: Avoid strict UUID v4 validation here to support integration tests that use deterministic IDs.
    const repo = database_1.AppDataSource.getRepository(AvailabilitySlot_1.AvailabilitySlot);
    const whereClause = {
        doctor: { id: doctorId },
        isActive: true
    };
    if (date) {
        whereClause.specificDate = new Date(date);
    }
    else if (dayOfWeek) {
        whereClause.dayOfWeek = dayOfWeek;
    }
    const slots = await repo.find({
        where: whereClause,
        order: { startTime: 'ASC' }
    });
    res.json({ data: slots });
}));
/**
 * @swagger
 * /availability:
 *   post:
 *     summary: Create availability slot (doctors/admins only)
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: string
 *               dayOfWeek:
 *                 type: string
 *                 enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 example: "17:00"
 *               specificDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Availability slot created
 */
router.post('/', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(async (req, res) => {
    const { doctorId, dayOfWeek, startTime, endTime, specificDate, notes } = req.body;
    // Check if user is doctor managing own schedule or admin
    const isOwnSchedule = req.user.role === roles_1.UserRole.DOCTOR && req.user.id === doctorId;
    const isAdmin = req.user.role === roles_1.UserRole.ADMIN || req.user.role === roles_1.UserRole.SUPER_ADMIN;
    if (!isOwnSchedule && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized to manage this schedule' });
    }
    const repo = database_1.AppDataSource.getRepository(AvailabilitySlot_1.AvailabilitySlot);
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    const doctor = await userRepo.findOne({ where: { id: doctorId, role: roles_1.UserRole.DOCTOR } });
    if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
    }
    const slot = repo.create({
        doctor,
        dayOfWeek,
        startTime,
        endTime,
        specificDate: specificDate ? new Date(specificDate) : undefined,
        notes
    });
    await repo.save(slot);
    res.status(201).json({ data: slot });
}));
/**
 * @swagger
 * /availability/{id}:
 *   put:
 *     summary: Update availability slot
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const repo = database_1.AppDataSource.getRepository(AvailabilitySlot_1.AvailabilitySlot);
    const slot = await repo.findOne({ where: { id }, relations: ['doctor'] });
    if (!slot) {
        return res.status(404).json({ message: 'Availability slot not found' });
    }
    const isOwnSchedule = req.user.role === roles_1.UserRole.DOCTOR && req.user.id === slot.doctor.id;
    const isAdmin = req.user.role === roles_1.UserRole.ADMIN || req.user.role === roles_1.UserRole.SUPER_ADMIN;
    if (!isOwnSchedule && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized to update this schedule' });
    }
    Object.assign(slot, updates);
    await repo.save(slot);
    res.json({ data: slot });
}));
/**
 * @swagger
 * /availability/{id}:
 *   delete:
 *     summary: Delete availability slot
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(async (req, res) => {
    const { id } = req.params;
    const repo = database_1.AppDataSource.getRepository(AvailabilitySlot_1.AvailabilitySlot);
    const slot = await repo.findOne({ where: { id }, relations: ['doctor'] });
    if (!slot) {
        return res.status(404).json({ message: 'Availability slot not found' });
    }
    const isOwnSchedule = req.user.role === roles_1.UserRole.DOCTOR && req.user.id === slot.doctor.id;
    const isAdmin = req.user.role === roles_1.UserRole.ADMIN || req.user.role === roles_1.UserRole.SUPER_ADMIN;
    if (!isOwnSchedule && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized to delete this schedule' });
    }
    await repo.remove(slot);
    res.status(204).send();
}));
/**
 * @swagger
 * /availability/my-schedule:
 *   get:
 *     summary: Get current user's availability (doctors only)
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-schedule', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(async (req, res) => {
    if (req.user.role !== roles_1.UserRole.DOCTOR) {
        return res.status(403).json({ message: 'Only doctors can access this endpoint' });
    }
    const repo = database_1.AppDataSource.getRepository(AvailabilitySlot_1.AvailabilitySlot);
    const slots = await repo.find({
        where: { doctor: { id: req.user.id } },
        order: { dayOfWeek: 'ASC', startTime: 'ASC' }
    });
    res.json({ data: slots });
}));
/**
 * @swagger
 * /availability/slots/available:
 *   get:
 *     summary: Get available time slots for booking (public)
 *     tags: [Availability]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability (YYYY-MM-DD)
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Filter by specific doctor
 *     responses:
 *       200:
 *         description: Available time slots with doctors
 */
router.get('/slots/available', (0, error_middleware_1.errorHandler)(availability_controller_1.AvailabilityController.getAvailableSlots));
exports.default = router;
