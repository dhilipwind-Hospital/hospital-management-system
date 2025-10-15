"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabResultController = void 0;
const database_1 = require("../config/database");
const LabResult_1 = require("../models/LabResult");
const LabOrderItem_1 = require("../models/LabOrderItem");
const LabOrder_1 = require("../models/LabOrder");
const email_service_1 = require("../services/email.service");
class LabResultController {
}
exports.LabResultController = LabResultController;
_a = LabResultController;
// Enter lab result
LabResultController.enterLabResult = async (req, res) => {
    try {
        const { orderItemId, resultValue, units, referenceRange, interpretation, flag, comments, additionalData } = req.body;
        const performedById = req.user.id;
        const labResultRepo = database_1.AppDataSource.getRepository(LabResult_1.LabResult);
        const labOrderItemRepo = database_1.AppDataSource.getRepository(LabOrderItem_1.LabOrderItem);
        // Check if order item exists
        const orderItem = await labOrderItemRepo.findOne({
            where: { id: orderItemId },
            relations: ['labTest', 'labOrder', 'labOrder.patient', 'labOrder.doctor']
        });
        if (!orderItem) {
            return res.status(404).json({ message: 'Lab order item not found' });
        }
        // Create result
        const result = labResultRepo.create({
            resultValue,
            units: units || orderItem.labTest.units,
            referenceRange: referenceRange || orderItem.labTest.normalRange,
            interpretation,
            flag: flag || 'normal',
            resultTime: new Date(),
            performedById,
            comments,
            additionalData,
            isVerified: false
        });
        const savedResult = await labResultRepo.save(result);
        // Update order item
        orderItem.resultId = savedResult.id;
        orderItem.status = 'completed';
        await labOrderItemRepo.save(orderItem);
        // Check if all items in order are completed
        const allItems = await labOrderItemRepo.find({
            where: { labOrderId: orderItem.labOrderId }
        });
        const allCompleted = allItems.every(item => item.status === 'completed');
        if (allCompleted) {
            const labOrderRepo = database_1.AppDataSource.getRepository(LabOrder_1.LabOrder);
            const order = await labOrderRepo.findOne({
                where: { id: orderItem.labOrderId }
            });
            if (order) {
                order.status = 'completed';
                await labOrderRepo.save(order);
            }
        }
        // Send notification for critical results
        if (flag === 'critical') {
            try {
                await email_service_1.EmailService.sendEmail({
                    to: orderItem.labOrder.doctor.email,
                    subject: `🚨 CRITICAL Lab Result - ${orderItem.labTest.name}`,
                    html: `
              <h2>Critical Lab Result Alert</h2>
              <p><strong>Patient:</strong> ${orderItem.labOrder.patient.firstName} ${orderItem.labOrder.patient.lastName}</p>
              <p><strong>Test:</strong> ${orderItem.labTest.name}</p>
              <p><strong>Result:</strong> ${resultValue} ${units || ''}</p>
              <p><strong>Reference Range:</strong> ${referenceRange || orderItem.labTest.normalRange}</p>
              <p><strong>Interpretation:</strong> ${interpretation || 'N/A'}</p>
              <p style="color: red;"><strong>This is a CRITICAL result requiring immediate attention!</strong></p>
            `
                });
            }
            catch (emailError) {
                console.error('Error sending critical result email:', emailError);
            }
        }
        res.status(201).json(savedResult);
    }
    catch (error) {
        console.error('Error entering lab result:', error);
        res.status(500).json({ message: 'Error entering lab result' });
    }
};
// Verify lab result
LabResultController.verifyLabResult = async (req, res) => {
    try {
        const { id } = req.params;
        const verifiedById = req.user.id;
        const labResultRepo = database_1.AppDataSource.getRepository(LabResult_1.LabResult);
        const result = await labResultRepo.findOne({ where: { id } });
        if (!result) {
            return res.status(404).json({ message: 'Lab result not found' });
        }
        result.isVerified = true;
        result.verifiedById = verifiedById;
        result.verificationTime = new Date();
        const updatedResult = await labResultRepo.save(result);
        res.json(updatedResult);
    }
    catch (error) {
        console.error('Error verifying lab result:', error);
        res.status(500).json({ message: 'Error verifying lab result' });
    }
};
// Get result by ID
LabResultController.getResultById = async (req, res) => {
    try {
        const { id } = req.params;
        const labResultRepo = database_1.AppDataSource.getRepository(LabResult_1.LabResult);
        const result = await labResultRepo.findOne({
            where: { id },
            relations: ['performedBy', 'verifiedBy']
        });
        if (!result) {
            return res.status(404).json({ message: 'Lab result not found' });
        }
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching lab result:', error);
        res.status(500).json({ message: 'Error fetching lab result' });
    }
};
// Get results by lab order
LabResultController.getResultsByLabOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const labOrderItemRepo = database_1.AppDataSource.getRepository(LabOrderItem_1.LabOrderItem);
        const items = await labOrderItemRepo.find({
            where: { labOrderId: orderId },
            relations: ['result', 'result.performedBy', 'result.verifiedBy', 'labTest']
        });
        const results = items
            .filter(item => item.result)
            .map(item => ({
            ...item.result,
            testName: item.labTest.name,
            testCode: item.labTest.code
        }));
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ message: 'Error fetching results' });
    }
};
// Get patient lab results
LabResultController.getPatientLabResults = async (req, res) => {
    try {
        const { patientId } = req.params;
        const labOrderRepo = database_1.AppDataSource.getRepository(LabOrder_1.LabOrder);
        const orders = await labOrderRepo.find({
            where: { patientId, status: 'completed' },
            relations: ['items', 'items.result', 'items.labTest', 'doctor'],
            order: { createdAt: 'DESC' }
        });
        const results = orders.flatMap(order => order.items
            .filter(item => item.result)
            .map(item => ({
            orderId: order.id,
            orderNumber: order.orderNumber,
            orderDate: order.orderDate,
            doctorName: `${order.doctor.firstName} ${order.doctor.lastName}`,
            testName: item.labTest.name,
            testCode: item.labTest.code,
            result: item.result
        })));
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching patient lab results:', error);
        res.status(500).json({ message: 'Error fetching patient lab results' });
    }
};
