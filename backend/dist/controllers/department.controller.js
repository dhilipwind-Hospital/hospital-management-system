"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentController = void 0;
const database_1 = require("../config/database");
const Department_1 = require("../models/Department");
const typeorm_1 = require("typeorm");
class DepartmentController {
}
exports.DepartmentController = DepartmentController;
_a = DepartmentController;
// Get all departments
DepartmentController.listAll = async (req, res) => {
    const departmentRepository = database_1.AppDataSource.getRepository(Department_1.Department);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const isActiveParam = req.query.isActive;
    const where = {};
    // Map isActive=true to status='active', false to status!='active'
    if (typeof isActiveParam !== 'undefined') {
        const active = String(isActiveParam).toLowerCase() === 'true';
        if (active)
            where.status = 'active';
        else
            where.status = (0, typeorm_1.Not)('active');
    }
    try {
        const [items, total] = await departmentRepository.findAndCount({
            where,
            order: { name: 'ASC' },
            relations: ['services'],
            skip: (page - 1) * limit,
            take: limit
        });
        const meta = { total, page, limit, totalPages: Math.ceil(total / limit) };
        return res.json({ data: items, meta });
    }
    catch (error) {
        console.error('Error fetching departments:', error);
        return res.status(500).json({ message: 'Error fetching departments' });
    }
};
// Get department by ID
DepartmentController.getOneById = async (req, res) => {
    const departmentRepository = database_1.AppDataSource.getRepository(Department_1.Department);
    const id = req.params.id;
    try {
        const department = await departmentRepository.findOne({
            where: { id },
            relations: ['services']
        });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        return res.json(department);
    }
    catch (error) {
        console.error('Error fetching department:', error);
        return res.status(500).json({ message: 'Error fetching department' });
    }
};
// Get services by department
DepartmentController.getDepartmentServices = async (req, res) => {
    const departmentId = req.params.id;
    const serviceRepository = database_1.AppDataSource.getRepository(Department_1.Department);
    try {
        const department = await serviceRepository.findOne({
            where: { id: departmentId },
            relations: ['services']
        });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        return res.json(department.services || []);
    }
    catch (error) {
        console.error('Error fetching department services:', error);
        return res.status(500).json({ message: 'Error fetching department services' });
    }
};
// Admin: create department
DepartmentController.create = async (req, res) => {
    const repo = database_1.AppDataSource.getRepository(Department_1.Department);
    const { name, description, status } = req.body || {};
    try {
        if (!name)
            return res.status(400).json({ message: 'Name is required' });
        const entity = repo.create({
            name,
            description,
            status: status || 'active'
        });
        const saved = await repo.save(entity);
        return res.status(201).json(saved);
    }
    catch (e) {
        console.error('Error creating department:', e);
        return res.status(500).json({ message: 'Error creating department' });
    }
};
// Admin: update department
DepartmentController.update = async (req, res) => {
    const repo = database_1.AppDataSource.getRepository(Department_1.Department);
    const { id } = req.params;
    const { name, description, status } = req.body || {};
    try {
        const dept = await repo.findOne({ where: { id } });
        if (!dept)
            return res.status(404).json({ message: 'Department not found' });
        if (typeof name !== 'undefined')
            dept.name = name;
        if (typeof description !== 'undefined')
            dept.description = description;
        if (typeof status !== 'undefined')
            dept.status = status;
        await repo.save(dept);
        return res.json(dept);
    }
    catch (e) {
        console.error('Error updating department:', e);
        return res.status(500).json({ message: 'Error updating department' });
    }
};
// Admin: set status
DepartmentController.setStatus = async (req, res) => {
    const repo = database_1.AppDataSource.getRepository(Department_1.Department);
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status)
        return res.status(400).json({ message: 'status is required' });
    try {
        const dept = await repo.findOne({ where: { id } });
        if (!dept)
            return res.status(404).json({ message: 'Department not found' });
        dept.status = status;
        await repo.save(dept);
        return res.json({ message: 'Status updated' });
    }
    catch (e) {
        console.error('Error updating department status:', e);
        return res.status(500).json({ message: 'Error updating department status' });
    }
};
