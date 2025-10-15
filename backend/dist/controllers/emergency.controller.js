"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyController = void 0;
const database_1 = require("../config/database");
const EmergencyRequest_1 = require("../models/EmergencyRequest");
const User_1 = require("../models/User");
class EmergencyController {
}
exports.EmergencyController = EmergencyController;
_a = EmergencyController;
// Get all emergency requests (dashboard)
EmergencyController.getDashboard = async (req, res) => {
    try {
        const { status, priority, search, limit = 50, offset = 0 } = req.query;
        const repo = database_1.AppDataSource.getRepository(EmergencyRequest_1.EmergencyRequest);
        const queryBuilder = repo.createQueryBuilder('emergency')
            .leftJoinAndSelect('emergency.assignedTo', 'assignedTo')
            .orderBy('emergency.createdAt', 'DESC');
        // Filter by status
        if (status && status !== 'all') {
            queryBuilder.andWhere('emergency.status = :status', { status });
        }
        // Filter by priority
        if (priority && priority !== 'all') {
            queryBuilder.andWhere('emergency.priority = :priority', { priority });
        }
        // Search by name or phone
        if (search) {
            queryBuilder.andWhere('(emergency.name ILIKE :search OR emergency.phone ILIKE :search)', { search: `%${search}%` });
        }
        // Pagination
        queryBuilder.skip(Number(offset)).take(Number(limit));
        const [requests, total] = await queryBuilder.getManyAndCount();
        // Calculate response times
        const requestsWithMetrics = requests.map(req => ({
            ...req,
            responseTime: req.respondedAt
                ? Math.round((req.respondedAt.getTime() - req.createdAt.getTime()) / 1000 / 60) // minutes
                : null,
            waitingTime: !req.respondedAt
                ? Math.round((Date.now() - req.createdAt.getTime()) / 1000 / 60) // minutes
                : null
        }));
        return res.json({
            data: requestsWithMetrics,
            total,
            limit: Number(limit),
            offset: Number(offset)
        });
    }
    catch (error) {
        console.error('Error fetching emergency dashboard:', error);
        return res.status(500).json({ message: 'Error fetching emergency requests' });
    }
};
// Get statistics
EmergencyController.getStatistics = async (req, res) => {
    try {
        const repo = database_1.AppDataSource.getRepository(EmergencyRequest_1.EmergencyRequest);
        const [total, pending, inProgress, resolved, critical, avgResponseTime] = await Promise.all([
            repo.count(),
            repo.count({ where: { status: EmergencyRequest_1.EmergencyStatus.PENDING } }),
            repo.count({ where: { status: EmergencyRequest_1.EmergencyStatus.IN_PROGRESS } }),
            repo.count({ where: { status: EmergencyRequest_1.EmergencyStatus.RESOLVED } }),
            repo.count({ where: { priority: EmergencyRequest_1.EmergencyPriority.CRITICAL } }),
            repo.createQueryBuilder('emergency')
                .select('AVG(EXTRACT(EPOCH FROM (emergency.respondedAt - emergency.createdAt)))', 'avg')
                .where('emergency.respondedAt IS NOT NULL')
                .getRawOne()
        ]);
        return res.json({
            total,
            pending,
            inProgress,
            resolved,
            critical,
            avgResponseTimeMinutes: (avgResponseTime === null || avgResponseTime === void 0 ? void 0 : avgResponseTime.avg) ? Math.round(avgResponseTime.avg / 60) : null
        });
    }
    catch (error) {
        console.error('Error fetching statistics:', error);
        return res.status(500).json({ message: 'Error fetching statistics' });
    }
};
// Assign emergency request to staff
EmergencyController.assignRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }
        const repo = database_1.AppDataSource.getRepository(EmergencyRequest_1.EmergencyRequest);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const request = await repo.findOne({ where: { id } });
        if (!request) {
            return res.status(404).json({ message: 'Emergency request not found' });
        }
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        request.assignedTo = user;
        if (request.status === EmergencyRequest_1.EmergencyStatus.PENDING) {
            request.status = EmergencyRequest_1.EmergencyStatus.IN_PROGRESS;
        }
        await repo.save(request);
        const updated = await repo.findOne({
            where: { id },
            relations: ['assignedTo']
        });
        return res.json({
            message: 'Emergency request assigned successfully',
            data: updated
        });
    }
    catch (error) {
        console.error('Error assigning request:', error);
        return res.status(500).json({ message: 'Error assigning request' });
    }
};
// Update status
EmergencyController.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, responseNotes } = req.body;
        if (!status || !Object.values(EmergencyRequest_1.EmergencyStatus).includes(status)) {
            return res.status(400).json({ message: 'Valid status is required' });
        }
        const repo = database_1.AppDataSource.getRepository(EmergencyRequest_1.EmergencyRequest);
        const request = await repo.findOne({ where: { id } });
        if (!request) {
            return res.status(404).json({ message: 'Emergency request not found' });
        }
        request.status = status;
        if (responseNotes) {
            request.responseNotes = responseNotes;
        }
        // Set respondedAt when moving to in_progress or resolved
        if ((status === EmergencyRequest_1.EmergencyStatus.IN_PROGRESS || status === EmergencyRequest_1.EmergencyStatus.RESOLVED) && !request.respondedAt) {
            request.respondedAt = new Date();
        }
        await repo.save(request);
        const updated = await repo.findOne({
            where: { id },
            relations: ['assignedTo']
        });
        return res.json({
            message: 'Status updated successfully',
            data: updated
        });
    }
    catch (error) {
        console.error('Error updating status:', error);
        return res.status(500).json({ message: 'Error updating status' });
    }
};
// Update priority
EmergencyController.updatePriority = async (req, res) => {
    try {
        const { id } = req.params;
        const { priority } = req.body;
        if (!priority || !Object.values(EmergencyRequest_1.EmergencyPriority).includes(priority)) {
            return res.status(400).json({ message: 'Valid priority is required' });
        }
        const repo = database_1.AppDataSource.getRepository(EmergencyRequest_1.EmergencyRequest);
        const request = await repo.findOne({ where: { id } });
        if (!request) {
            return res.status(404).json({ message: 'Emergency request not found' });
        }
        request.priority = priority;
        await repo.save(request);
        const updated = await repo.findOne({
            where: { id },
            relations: ['assignedTo']
        });
        return res.json({
            message: 'Priority updated successfully',
            data: updated
        });
    }
    catch (error) {
        console.error('Error updating priority:', error);
        return res.status(500).json({ message: 'Error updating priority' });
    }
};
// Add response notes
EmergencyController.addNotes = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;
        if (!notes) {
            return res.status(400).json({ message: 'Notes are required' });
        }
        const repo = database_1.AppDataSource.getRepository(EmergencyRequest_1.EmergencyRequest);
        const request = await repo.findOne({ where: { id } });
        if (!request) {
            return res.status(404).json({ message: 'Emergency request not found' });
        }
        // Append notes with timestamp
        const timestamp = new Date().toISOString();
        const newNote = `[${timestamp}] ${notes}`;
        request.responseNotes = request.responseNotes
            ? `${request.responseNotes}\n${newNote}`
            : newNote;
        await repo.save(request);
        const updated = await repo.findOne({
            where: { id },
            relations: ['assignedTo']
        });
        return res.json({
            message: 'Notes added successfully',
            data: updated
        });
    }
    catch (error) {
        console.error('Error adding notes:', error);
        return res.status(500).json({ message: 'Error adding notes' });
    }
};
// Get single emergency request
EmergencyController.getRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const repo = database_1.AppDataSource.getRepository(EmergencyRequest_1.EmergencyRequest);
        const request = await repo.findOne({
            where: { id },
            relations: ['assignedTo']
        });
        if (!request) {
            return res.status(404).json({ message: 'Emergency request not found' });
        }
        // Calculate metrics
        const responseTime = request.respondedAt
            ? Math.round((request.respondedAt.getTime() - request.createdAt.getTime()) / 1000 / 60)
            : null;
        const waitingTime = !request.respondedAt
            ? Math.round((Date.now() - request.createdAt.getTime()) / 1000 / 60)
            : null;
        return res.json({
            data: {
                ...request,
                responseTime,
                waitingTime
            }
        });
    }
    catch (error) {
        console.error('Error fetching request:', error);
        return res.status(500).json({ message: 'Error fetching request' });
    }
};
// Delete emergency request
EmergencyController.deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const repo = database_1.AppDataSource.getRepository(EmergencyRequest_1.EmergencyRequest);
        const request = await repo.findOne({ where: { id } });
        if (!request) {
            return res.status(404).json({ message: 'Emergency request not found' });
        }
        await repo.remove(request);
        return res.json({
            message: 'Emergency request deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting request:', error);
        return res.status(500).json({ message: 'Error deleting request' });
    }
};
