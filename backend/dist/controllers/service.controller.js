"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceController = void 0;
const database_1 = require("../config/database");
const Service_1 = require("../models/Service");
const Department_1 = require("../models/Department");
class ServiceController {
}
exports.ServiceController = ServiceController;
_a = ServiceController;
// Get all services with optional search and filters
ServiceController.listAll = async (req, res) => {
    const serviceRepository = database_1.AppDataSource.getRepository(Service_1.Service);
    const { search, department, status, departmentId, isActive } = req.query;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    try {
        const query = serviceRepository
            .createQueryBuilder('service')
            .leftJoinAndSelect('service.department', 'department');
        // Apply search filter
        if (search) {
            query.where('(LOWER(service.name) LIKE :search OR LOWER(service.description) LIKE :search)', { search: `%${String(search).toLowerCase()}%` });
        }
        // Apply department filter (support both department and departmentId)
        const deptId = department || departmentId;
        if (deptId) {
            query.andWhere('department.id = :deptId', { deptId });
        }
        // Apply status/isActive filter
        if (typeof status !== 'undefined') {
            query.andWhere('service.status = :status', { status });
        }
        // Service entity does not have an 'isActive' column; map to status
        if (typeof isActive !== 'undefined') {
            const active = String(isActive) === 'true';
            if (active) {
                query.andWhere('service.status = :activeStatus', { activeStatus: 'active' });
            }
            else {
                query.andWhere('service.status != :activeStatus', { activeStatus: 'active' });
            }
        }
        const [items, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        const meta = { total, page, limit, totalPages: Math.ceil(total / limit) };
        return res.json({ data: items, meta });
    }
    catch (error) {
        console.error('Error fetching services:', error);
        return res.status(500).json({ message: 'Error fetching services' });
    }
};
// Stats: count services grouped by department
ServiceController.statsByDepartment = async (req, res) => {
    const repo = database_1.AppDataSource.getRepository(Service_1.Service);
    try {
        const qb = repo.createQueryBuilder('s')
            .leftJoin('s.department', 'd')
            .select('d.id', 'departmentId')
            .addSelect('d.name', 'departmentName')
            .addSelect('COUNT(s.id)', 'count')
            .groupBy('d.id')
            .addGroupBy('d.name')
            .orderBy('d.name', 'ASC');
        const rows = await qb.getRawMany();
        const total = rows.reduce((acc, r) => acc + Number(r.count || 0), 0);
        return res.json({ data: rows.map(r => ({
                departmentId: r.departmentId || null,
                departmentName: r.departmentName || 'Unassigned',
                count: Number(r.count || 0),
            })), meta: { total } });
    }
    catch (e) {
        console.error('statsByDepartment error:', e);
        return res.status(500).json({ message: 'Failed to compute stats' });
    }
};
// Get service by ID
ServiceController.getOneById = async (req, res) => {
    const serviceRepository = database_1.AppDataSource.getRepository(Service_1.Service);
    const id = req.params.id;
    try {
        const service = await serviceRepository.findOne({
            where: { id },
            relations: ['department']
        });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        return res.json(service);
    }
    catch (error) {
        console.error('Error fetching service:', error);
        return res.status(500).json({ message: 'Error fetching service' });
    }
};
// Get services by department
ServiceController.getByDepartment = async (req, res) => {
    const serviceRepository = database_1.AppDataSource.getRepository(Service_1.Service);
    const departmentId = req.params.departmentId;
    try {
        const services = await serviceRepository.find({
            where: { department: { id: departmentId } },
            relations: ['department']
        });
        return res.json(services);
    }
    catch (error) {
        console.error('Error fetching services by department:', error);
        return res.status(500).json({ message: 'Error fetching services by department' });
    }
};
// Search services
ServiceController.search = async (req, res) => {
    const serviceRepository = database_1.AppDataSource.getRepository(Service_1.Service);
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
    }
    try {
        const services = await serviceRepository
            .createQueryBuilder('service')
            .leftJoinAndSelect('service.department', 'department')
            .where('LOWER(service.name) LIKE :query OR LOWER(service.description) LIKE :query', { query: `%${query.toString().toLowerCase()}%` })
            .getMany();
        return res.json(services);
    }
    catch (error) {
        console.error('Error searching services:', error);
        return res.status(500).json({ message: 'Error searching services' });
    }
};
// Admin: create service
ServiceController.create = async (req, res) => {
    const repo = database_1.AppDataSource.getRepository(Service_1.Service);
    const deptRepo = database_1.AppDataSource.getRepository(Department_1.Department);
    const { name, description, departmentId, status, averageDuration } = req.body || {};
    try {
        if (!name)
            return res.status(400).json({ message: 'Name is required' });
        let department = null;
        if (departmentId) {
            department = await deptRepo.findOne({ where: { id: departmentId } });
            if (!department)
                return res.status(400).json({ message: 'Invalid departmentId' });
        }
        const entity = repo.create({
            name,
            description,
            status: status || 'active',
            averageDuration,
            department: department || undefined,
            departmentId: department === null || department === void 0 ? void 0 : department.id,
        });
        const saved = await repo.save(entity);
        const savedEntity = Array.isArray(saved) ? saved[0] : saved;
        const withDept = await repo.findOne({ where: { id: savedEntity.id }, relations: ['department'] });
        return res.status(201).json(withDept);
    }
    catch (e) {
        console.error('Error creating service:', e);
        return res.status(500).json({ message: 'Error creating service' });
    }
};
// Admin: update service
ServiceController.update = async (req, res) => {
    const repo = database_1.AppDataSource.getRepository(Service_1.Service);
    const deptRepo = database_1.AppDataSource.getRepository(Department_1.Department);
    const { id } = req.params;
    const { name, description, departmentId, status, averageDuration } = req.body || {};
    try {
        const svc = await repo.findOne({ where: { id }, relations: ['department'] });
        if (!svc)
            return res.status(404).json({ message: 'Service not found' });
        if (typeof name !== 'undefined')
            svc.name = name;
        if (typeof description !== 'undefined')
            svc.description = description;
        if (typeof status !== 'undefined')
            svc.status = status;
        if (typeof averageDuration !== 'undefined')
            svc.averageDuration = averageDuration;
        if (typeof departmentId !== 'undefined') {
            if (departmentId) {
                const dept = await deptRepo.findOne({ where: { id: departmentId } });
                if (!dept)
                    return res.status(400).json({ message: 'Invalid departmentId' });
                svc.department = dept;
                svc.departmentId = dept.id;
            }
            else {
                svc.department = null;
                svc.departmentId = null;
            }
        }
        await repo.save(svc);
        const updated = await repo.findOne({ where: { id }, relations: ['department'] });
        return res.json(updated);
    }
    catch (e) {
        console.error('Error updating service:', e);
        return res.status(500).json({ message: 'Error updating service' });
    }
};
// Admin: set status (activate/deactivate)
ServiceController.setStatus = async (req, res) => {
    const repo = database_1.AppDataSource.getRepository(Service_1.Service);
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status)
        return res.status(400).json({ message: 'status is required' });
    try {
        const svc = await repo.findOne({ where: { id } });
        if (!svc)
            return res.status(404).json({ message: 'Service not found' });
        svc.status = status;
        await repo.save(svc);
        return res.json({ message: 'Status updated' });
    }
    catch (e) {
        console.error('Error updating service status:', e);
        return res.status(500).json({ message: 'Error updating service status' });
    }
};
