"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_controller_1 = require("../controllers/department.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const roles_1 = require("../types/roles");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Hospital departments management
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The department ID
 *         name:
 *           type: string
 *           description: Name of the department
 *         description:
 *           type: string
 *           description: Detailed description of the department
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: URL to the department's image
 *         isActive:
 *           type: boolean
 *           description: Whether the department is currently active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     DepartmentWithServices:
 *       allOf:
 *         - $ref: '#/components/schemas/Department'
 *         - type: object
 *           properties:
 *             services:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *
 *     PaginatedDepartments:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Department'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     parameters:
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of departments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedDepartments'
 */
router.get('/', department_controller_1.DepartmentController.listAll);
/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Get a department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       404:
 *         description: Department not found
 */
router.get('/:id', department_controller_1.DepartmentController.getOneById);
/**
 * @swagger
 * /departments/{id}/services:
 *   get:
 *     summary: Get all services for a specific department
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter services by active status
 *     responses:
 *       200:
 *         description: List of services in the department
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       404:
 *         description: Department not found
 */
router.get('/:id/services', department_controller_1.DepartmentController.getDepartmentServices);
// Admin routes
router.post('/', auth_middleware_1.authenticate, (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.MANAGE_SETTINGS] }), department_controller_1.DepartmentController.create);
router.put('/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.MANAGE_SETTINGS] }), department_controller_1.DepartmentController.update);
router.patch('/:id/status', auth_middleware_1.authenticate, (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.MANAGE_SETTINGS] }), department_controller_1.DepartmentController.setStatus);
exports.default = router;
