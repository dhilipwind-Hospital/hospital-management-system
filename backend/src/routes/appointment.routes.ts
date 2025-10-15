import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin, isDoctor } from '../middleware/rbac.middleware';
import { validateDto } from '../middleware/validation.middleware';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../dto/create-appointment.dto';
import { errorHandler } from '../middleware/error.middleware';

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - serviceId
 *         - startTime
 *         - endTime
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated ID of the appointment
 *         serviceId:
 *           type: string
 *           format: uuid
 *           description: The ID of the service being booked
 *         doctorId:
 *           type: string
 *           format: uuid
 *           description: The ID of the doctor (optional)
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: The start time of the appointment
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: The end time of the appointment
 *         status:
 *           type: string
 *           enum: [scheduled, completed, cancelled, no_show]
 *           default: scheduled
 *         notes:
 *           type: string
 *           description: Additional notes for the appointment
 *         reason:
 *           type: string
 *           description: Reason for the appointment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the appointment was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the appointment was last updated
 *         service:
 *           $ref: '#/components/schemas/Service'
 *         doctor:
 *           $ref: '#/components/schemas/User'
 *         patient:
 *           $ref: '#/components/schemas/User'
 *     
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         duration:
 *           type: integer
 *         price:
 *           type: number
 *     
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 * 
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: Error message describing what went wrong
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Error detail 1", "Error detail 2"]
 */

const router = Router();

// Apply authentication middleware to all appointment routes
router.use(authenticate);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - User not authorized to create appointment
 *       409:
 *         description: Conflict - Time slot not available
 */
router.post(
  '/',
  validateDto(CreateAppointmentDto),
  errorHandler(AppointmentController.bookAppointment)
);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get list of user's appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled, no_show]
 *         description: Filter appointments by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter appointments after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter appointments before this date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for service or doctor name
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.get('/', errorHandler(AppointmentController.listUserAppointments));

// Admin: list all appointments
router.get('/admin', authenticate, isAdmin, errorHandler(AppointmentController.listAllAppointments));
router.get('/admin/:id', authenticate, isAdmin, errorHandler(AppointmentController.adminGetAppointment));
router.patch('/admin/:id/notes', authenticate, isAdmin, errorHandler(AppointmentController.adminBackfillDepartments));
router.patch('/admin/:id/cancel', authenticate, isAdmin, errorHandler(AppointmentController.adminCancelAppointment));
router.post('/admin/:id/confirm', authenticate, isAdmin, errorHandler(AppointmentController.adminConfirmAppointment));

// Doctor: list own appointments
router.get('/doctor/me', isDoctor, errorHandler(AppointmentController.listDoctorAppointments));
// Doctor: update notes for own appointment
router.patch('/doctor/:id/notes', isDoctor, errorHandler(AppointmentController.doctorUpdateNotes));
// Doctor: create follow-up appointment for a patient
router.post('/doctor', isDoctor, errorHandler(AppointmentController.doctorCreateAppointment));

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment details by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not authorized to view this appointment
 *       404:
 *         description: Appointment not found
 */
router.get(
  '/:id',
  errorHandler(AppointmentController.getAppointment)
);

/**
 * @swagger
 * /appointments/{id}:
 *   patch:
 *     summary: Update an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not authorized to update this appointment
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Conflict - Time slot not available
 */
router.patch(
  '/:id',
  validateDto(UpdateAppointmentDto, true), // Allow partial updates
  errorHandler(AppointmentController.updateAppointment)
);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Cancel an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       204:
 *         description: Appointment cancelled successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not authorized to cancel this appointment
 *       404:
 *         description: Appointment not found
 */
router.delete(
  '/:id',
  errorHandler(AppointmentController.cancelAppointment)
);

// Patient: cancel with reason (accepts body { reason })
router.post(
  '/:id/cancel',
  errorHandler(AppointmentController.cancelAppointmentWithReason)
);

// Reschedule appointment
router.post(
  '/:id/reschedule',
  authenticate,
  errorHandler(AppointmentController.rescheduleAppointment)
);

// Complete appointment (doctor only)
router.post(
  '/:id/complete',
  authenticate,
  errorHandler(AppointmentController.completeAppointment)
);

// Mark as no-show (doctor only)
router.post(
  '/:id/no-show',
  authenticate,
  errorHandler(AppointmentController.markNoShow)
);

// Add consultation notes (doctor only)
router.post(
  '/:id/consultation-notes',
  authenticate,
  errorHandler(AppointmentController.addConsultationNotes)
);

// Appointment history timeline
router.get(
  '/:id/history',
  errorHandler(AppointmentController.listHistory)
);

export default router;
