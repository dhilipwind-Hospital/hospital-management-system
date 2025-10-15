"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabOrderController = void 0;
const database_1 = require("../config/database");
const LabOrder_1 = require("../models/LabOrder");
const LabOrderItem_1 = require("../models/LabOrderItem");
const LabTest_1 = require("../models/LabTest");
class LabOrderController {
    // Generate order number
    static async generateOrderNumber() {
        const labOrderRepo = database_1.AppDataSource.getRepository(LabOrder_1.LabOrder);
        const year = new Date().getFullYear();
        const lastOrder = await labOrderRepo
            .createQueryBuilder('order')
            .where('order.orderNumber LIKE :pattern', { pattern: `LAB-${year}-%` })
            .orderBy('order.createdAt', 'DESC')
            .getOne();
        let sequence = 1;
        if (lastOrder) {
            const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
            sequence = lastSequence + 1;
        }
        return `LAB-${year}-${sequence.toString().padStart(4, '0')}`;
    }
}
exports.LabOrderController = LabOrderController;
_a = LabOrderController;
// Create a new lab order (for doctors)
LabOrderController.createLabOrder = async (req, res) => {
    try {
        const { patientId, tests, clinicalNotes, diagnosis, isUrgent } = req.body;
        const doctorId = req.user.id;
        const labOrderRepo = database_1.AppDataSource.getRepository(LabOrder_1.LabOrder);
        const labOrderItemRepo = database_1.AppDataSource.getRepository(LabOrderItem_1.LabOrderItem);
        const labTestRepo = database_1.AppDataSource.getRepository(LabTest_1.LabTest);
        // Generate order number
        const orderNumber = await LabOrderController.generateOrderNumber();
        // Create lab order
        const labOrder = labOrderRepo.create({
            orderNumber,
            doctorId,
            patientId,
            orderDate: new Date(),
            clinicalNotes,
            diagnosis,
            isUrgent: isUrgent || false,
            status: 'ordered'
        });
        const savedOrder = await labOrderRepo.save(labOrder);
        // Create order items
        const orderItems = [];
        for (const testId of tests) {
            const test = await labTestRepo.findOne({ where: { id: testId } });
            if (test) {
                const item = labOrderItemRepo.create({
                    labOrderId: savedOrder.id,
                    labTestId: testId,
                    status: 'ordered'
                });
                orderItems.push(item);
            }
        }
        await labOrderItemRepo.save(orderItems);
        // Fetch complete order with relations
        const completeOrder = await labOrderRepo.findOne({
            where: { id: savedOrder.id },
            relations: ['doctor', 'patient', 'items', 'items.labTest']
        });
        res.status(201).json(completeOrder);
    }
    catch (error) {
        console.error('Error creating lab order:', error);
        res.status(500).json({ message: 'Error creating lab order' });
    }
};
// Get lab orders by patient
LabOrderController.getPatientLabOrders = async (req, res) => {
    try {
        const { patientId } = req.params;
        const labOrderRepo = database_1.AppDataSource.getRepository(LabOrder_1.LabOrder);
        const orders = await labOrderRepo.find({
            where: { patientId },
            relations: ['doctor', 'patient', 'items', 'items.labTest', 'items.result'],
            order: { createdAt: 'DESC' }
        });
        res.json(orders);
    }
    catch (error) {
        console.error('Error fetching patient lab orders:', error);
        res.status(500).json({ message: 'Error fetching patient lab orders' });
    }
};
// Get lab orders by doctor
LabOrderController.getDoctorLabOrders = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const labOrderRepo = database_1.AppDataSource.getRepository(LabOrder_1.LabOrder);
        const orders = await labOrderRepo.find({
            where: { doctorId },
            relations: ['doctor', 'patient', 'items', 'items.labTest', 'items.result'],
            order: { createdAt: 'DESC' }
        });
        res.json(orders);
    }
    catch (error) {
        console.error('Error fetching doctor lab orders:', error);
        res.status(500).json({ message: 'Error fetching doctor lab orders' });
    }
};
// Get pending lab orders (for lab technicians)
LabOrderController.getPendingLabOrders = async (req, res) => {
    try {
        const labOrderRepo = database_1.AppDataSource.getRepository(LabOrder_1.LabOrder);
        const orders = await labOrderRepo.find({
            where: [
                { status: 'ordered' },
                { status: 'sample_collected' },
                { status: 'in_progress' }
            ],
            relations: ['doctor', 'patient', 'items', 'items.labTest', 'items.sample'],
            order: { isUrgent: 'DESC', createdAt: 'ASC' }
        });
        res.json(orders);
    }
    catch (error) {
        console.error('Error fetching pending lab orders:', error);
        res.status(500).json({ message: 'Error fetching pending lab orders' });
    }
};
// Get all lab orders (admin)
LabOrderController.getAllLabOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = '' } = req.query;
        const labOrderRepo = database_1.AppDataSource.getRepository(LabOrder_1.LabOrder);
        const whereConditions = {};
        if (status) {
            whereConditions.status = status;
        }
        const [orders, total] = await labOrderRepo.findAndCount({
            where: whereConditions,
            relations: ['doctor', 'patient', 'items', 'items.labTest'],
            order: { createdAt: 'DESC' },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit)
        });
        res.json({
            orders,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    }
    catch (error) {
        console.error('Error fetching all lab orders:', error);
        res.status(500).json({ message: 'Error fetching all lab orders' });
    }
};
// Get single lab order by ID
LabOrderController.getLabOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const labOrderRepo = database_1.AppDataSource.getRepository(LabOrder_1.LabOrder);
        const order = await labOrderRepo.findOne({
            where: { id },
            relations: ['doctor', 'patient', 'items', 'items.labTest', 'items.sample', 'items.result']
        });
        if (!order) {
            return res.status(404).json({ message: 'Lab order not found' });
        }
        res.json(order);
    }
    catch (error) {
        console.error('Error fetching lab order:', error);
        res.status(500).json({ message: 'Error fetching lab order' });
    }
};
// Update lab order status
LabOrderController.updateLabOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const labOrderRepo = database_1.AppDataSource.getRepository(LabOrder_1.LabOrder);
        const order = await labOrderRepo.findOne({ where: { id } });
        if (!order) {
            return res.status(404).json({ message: 'Lab order not found' });
        }
        order.status = status;
        const updatedOrder = await labOrderRepo.save(order);
        res.json(updatedOrder);
    }
    catch (error) {
        console.error('Error updating lab order status:', error);
        res.status(500).json({ message: 'Error updating lab order status' });
    }
};
// Cancel lab order
LabOrderController.cancelLabOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const labOrderRepo = database_1.AppDataSource.getRepository(LabOrder_1.LabOrder);
        const labOrderItemRepo = database_1.AppDataSource.getRepository(LabOrderItem_1.LabOrderItem);
        const order = await labOrderRepo.findOne({
            where: { id },
            relations: ['items']
        });
        if (!order) {
            return res.status(404).json({ message: 'Lab order not found' });
        }
        // Update order status
        order.status = 'cancelled';
        await labOrderRepo.save(order);
        // Update all items status
        for (const item of order.items) {
            item.status = 'cancelled';
            if (reason) {
                item.notes = `Cancelled: ${reason}`;
            }
            await labOrderItemRepo.save(item);
        }
        res.json({ message: 'Lab order cancelled successfully' });
    }
    catch (error) {
        console.error('Error cancelling lab order:', error);
        res.status(500).json({ message: 'Error cancelling lab order' });
    }
};
