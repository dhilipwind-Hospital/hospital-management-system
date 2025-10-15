"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const roles_1 = require("../types/roles");
const error_middleware_1 = require("../middleware/error.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const update_user_dto_1 = require("../dto/update-user.dto");
const router = (0, express_1.Router)();
// Multer storage for user photos
const uploadDir = path_1.default.resolve(process.cwd(), 'uploads');
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const name = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
        cb(null, name);
    }
});
const upload = (0, multer_1.default)({ storage });
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The user's unique ID
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         phone:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *           enum: [male, female, other, prefer_not_to_say]
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             country:
 *               type: string
 *             postalCode:
 *               type: string
 *         profileImage:
 *           type: string
 *           format: uri
 *         role:
 *           type: string
 *           enum: [patient, doctor, admin]
 *         isEmailVerified:
 *           type: boolean
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     UpdateUserProfile:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         phone:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *           enum: [male, female, other, prefer_not_to_say]
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             country:
 *               type: string
 *             postalCode:
 *               type: string
 *         profileImage:
 *           type: string
 *           format: uri
 *         role:
 *           type: string
 *           enum: [patient, doctor, admin]
 *         isEmailVerified:
 *           type: boolean
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
// Apply authentication middleware to all user routes
router.use(auth_middleware_1.authenticate);
// Self routes (must come before parameterized routes)
router.get('/me', (0, error_middleware_1.errorHandler)(user_controller_1.UserController.getCurrentUser));
router.patch('/me', (0, validation_middleware_1.validateDto)(update_user_dto_1.UpdateUserDto, true), (0, error_middleware_1.errorHandler)(user_controller_1.UserController.updateProfile));
router.get('/me/appointments', (0, error_middleware_1.errorHandler)(user_controller_1.UserController.getUserAppointments));
router.post('/me/photo', upload.single('photo'), (0, error_middleware_1.errorHandler)(user_controller_1.UserController.uploadMyPhoto));
// Doctor routes
router.get('/doctor/my-patients', rbac_middleware_1.isDoctor, (0, error_middleware_1.errorHandler)(user_controller_1.UserController.listDoctorPatients));
router.get('/doctor/my-patients.csv', rbac_middleware_1.isDoctor, (0, error_middleware_1.errorHandler)(user_controller_1.UserController.listDoctorPatientsCsv));
// Admin routes (permission-aware)
router.get('/', (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.VIEW_USER] }), (0, error_middleware_1.errorHandler)(user_controller_1.UserController.listUsers));
router.get('/export/csv', (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.VIEW_USER] }), (0, error_middleware_1.errorHandler)(user_controller_1.UserController.exportUsersCsv));
router.post('/', (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.CREATE_USER] }), (0, error_middleware_1.errorHandler)(user_controller_1.UserController.adminCreateUser));
router.delete('/bulk-delete', (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.DELETE_USER] }), (0, error_middleware_1.errorHandler)(user_controller_1.UserController.adminBulkDeleteUsers));
router.get('/:id', (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.VIEW_USER] }), (0, error_middleware_1.errorHandler)(user_controller_1.UserController.adminGetUserById));
router.put('/:id', (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.UPDATE_USER] }), (0, error_middleware_1.errorHandler)(user_controller_1.UserController.adminUpdateUser));
router.delete('/:id', (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.DELETE_USER] }), (0, error_middleware_1.errorHandler)(user_controller_1.UserController.adminDeleteUser));
router.post('/:id/photo', (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.UPDATE_USER] }), upload.single('photo'), (0, error_middleware_1.errorHandler)(user_controller_1.UserController.uploadUserPhoto));
/**
 * @swagger
 * /users/me/medical-records:
 *   get:
 *     summary: Get current user's medical records (Placeholder)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Placeholder response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Medical records endpoint is not implemented yet
 *                 data:
 *                   type: array
 *                   items: {}
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.get('/me/medical-records', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Medical records endpoint is not implemented yet',
        data: []
    });
});
// Admin: update user by id
router.put('/:id', (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.UPDATE_USER] }), (0, error_middleware_1.errorHandler)(user_controller_1.UserController.adminUpdateUser));
exports.default = router;
