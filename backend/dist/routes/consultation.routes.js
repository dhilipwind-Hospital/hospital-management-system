"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const consultation_controller_1 = require("../controllers/consultation.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /consultations:
 *   post:
 *     summary: Create consultation note
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(consultation_controller_1.ConsultationController.createConsultation));
/**
 * @swagger
 * /consultations/{id}:
 *   get:
 *     summary: Get consultation note
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(consultation_controller_1.ConsultationController.getConsultation));
/**
 * @swagger
 * /consultations/{id}:
 *   put:
 *     summary: Update consultation note
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(consultation_controller_1.ConsultationController.updateConsultation));
/**
 * @swagger
 * /patients/{id}/consultations:
 *   get:
 *     summary: Get patient consultations
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/patient/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(consultation_controller_1.ConsultationController.getPatientConsultations));
/**
 * @swagger
 * /consultations/{id}/sign:
 *   post:
 *     summary: Sign consultation note
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/sign', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(consultation_controller_1.ConsultationController.signConsultation));
/**
 * @swagger
 * /consultations/{id}/pdf:
 *   get:
 *     summary: Generate consultation PDF
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/pdf', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(consultation_controller_1.ConsultationController.getConsultationPDF));
exports.default = router;
