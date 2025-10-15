"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionController = void 0;
const database_1 = require("../../config/database");
const Prescription_1 = require("../../models/pharmacy/Prescription");
const PrescriptionItem_1 = require("../../models/pharmacy/PrescriptionItem");
const Medicine_1 = require("../../models/pharmacy/Medicine");
const MedicineTransaction_1 = require("../../models/pharmacy/MedicineTransaction");
const class_validator_1 = require("class-validator");
const User_1 = require("../../models/User");
class PrescriptionController {
}
exports.PrescriptionController = PrescriptionController;
_a = PrescriptionController;
// Create a new prescription (for doctors)
PrescriptionController.createPrescription = async (req, res) => {
    var _b;
    try {
        const { patientId, items, diagnosis, notes } = req.body;
        // Get doctor ID from authenticated user
        const doctorId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!doctorId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // Validate required fields
        if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Patient ID and at least one prescription item are required' });
        }
        // Start a transaction
        const queryRunner = database_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Create prescription
            const prescriptionRepository = queryRunner.manager.getRepository(Prescription_1.Prescription);
            const prescription = prescriptionRepository.create({
                doctorId,
                patientId,
                prescriptionDate: new Date(),
                diagnosis,
                notes,
                status: Prescription_1.PrescriptionStatus.PENDING
            });
            // Validate prescription
            const errors = await (0, class_validator_1.validate)(prescription);
            if (errors.length > 0) {
                return res.status(400).json({ message: 'Validation failed', errors });
            }
            // Save prescription
            const savedPrescription = await prescriptionRepository.save(prescription);
            // Create prescription items
            const prescriptionItemRepository = queryRunner.manager.getRepository(PrescriptionItem_1.PrescriptionItem);
            const medicineRepository = queryRunner.manager.getRepository(Medicine_1.Medicine);
            const savedItems = [];
            for (const item of items) {
                // Check if medicine exists
                const medicine = await medicineRepository.findOne({ where: { id: item.medicineId } });
                if (!medicine) {
                    throw new Error(`Medicine with ID ${item.medicineId} not found`);
                }
                // Create prescription item
                const prescriptionItem = prescriptionItemRepository.create({
                    prescriptionId: savedPrescription.id,
                    medicineId: item.medicineId,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    duration: item.duration,
                    instructions: item.instructions,
                    quantity: item.quantity,
                    status: PrescriptionItem_1.PrescriptionItemStatus.PENDING
                });
                // Validate prescription item
                const itemErrors = await (0, class_validator_1.validate)(prescriptionItem);
                if (itemErrors.length > 0) {
                    throw new Error(`Validation failed for prescription item: ${JSON.stringify(itemErrors)}`);
                }
                // Save prescription item
                const savedItem = await prescriptionItemRepository.save(prescriptionItem);
                savedItems.push(savedItem);
            }
            // Commit transaction
            await queryRunner.commitTransaction();
            // Send prescription notification email
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const patient = await userRepository.findOne({ where: { id: patientId } });
                const doctor = await userRepository.findOne({ where: { id: doctorId } });
                if (patient && doctor) {
                    const { EmailService } = await Promise.resolve().then(() => __importStar(require('../../services/email.service')));
                    EmailService.sendPrescriptionNotificationEmail(patient.email, `${patient.firstName} ${patient.lastName}`, `${doctor.firstName} ${doctor.lastName}`).catch(err => console.error('Failed to send prescription notification email:', err));
                }
            }
            catch (emailError) {
                console.error('Email service error:', emailError);
            }
            return res.status(201).json({
                message: 'Prescription created successfully',
                prescription: {
                    ...savedPrescription,
                    items: savedItems
                }
            });
        }
        catch (error) {
            // Rollback transaction in case of error
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            // Release query runner
            await queryRunner.release();
        }
    }
    catch (error) {
        console.error('Error creating prescription:', error);
        return res.status(500).json({ message: 'Failed to create prescription', error: error.message });
    }
};
// Get prescriptions by patient
PrescriptionController.getPatientPrescriptions = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const prescriptionRepository = database_1.AppDataSource.getRepository(Prescription_1.Prescription);
        const [prescriptions, total] = await prescriptionRepository.findAndCount({
            where: { patientId },
            relations: ['doctor', 'patient', 'items', 'items.medicine'],
            skip,
            take,
            order: { prescriptionDate: 'DESC' }
        });
        return res.status(200).json({
            prescriptions,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error getting patient prescriptions:', error);
        return res.status(500).json({ message: 'Failed to get patient prescriptions', error: error.message });
    }
};
// Get single prescription by ID
PrescriptionController.getPrescriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const prescriptionRepository = database_1.AppDataSource.getRepository(Prescription_1.Prescription);
        const prescription = await prescriptionRepository.findOne({
            where: { id },
            relations: ['patient', 'doctor', 'items', 'items.medicine']
        });
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        return res.status(200).json({ data: prescription });
    }
    catch (error) {
        console.error('Error getting prescription:', error);
        return res.status(500).json({ message: 'Failed to get prescription', error: error.message });
    }
};
// Get prescriptions by doctor
PrescriptionController.getDoctorPrescriptions = async (req, res) => {
    var _b;
    try {
        // Get doctor ID from authenticated user
        const doctorId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!doctorId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { page = 1, limit = 10, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const prescriptionRepository = database_1.AppDataSource.getRepository(Prescription_1.Prescription);
        // Build query conditions
        const whereConditions = { doctorId };
        if (status) {
            whereConditions.status = status;
        }
        const [prescriptions, total] = await prescriptionRepository.findAndCount({
            where: whereConditions,
            relations: ['patient', 'doctor', 'items', 'items.medicine'],
            skip,
            take,
            order: { prescriptionDate: 'DESC' }
        });
        return res.status(200).json({
            prescriptions,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error getting doctor prescriptions:', error);
        return res.status(500).json({ message: 'Failed to get doctor prescriptions', error: error.message });
    }
};
// Get pending prescriptions (for pharmacy)
PrescriptionController.getPendingPrescriptions = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const prescriptionRepository = database_1.AppDataSource.getRepository(Prescription_1.Prescription);
        const [prescriptions, total] = await prescriptionRepository.findAndCount({
            where: { status: Prescription_1.PrescriptionStatus.PENDING },
            relations: ['doctor', 'patient', 'items', 'items.medicine'],
            skip,
            take,
            order: { prescriptionDate: 'ASC' }
        });
        return res.status(200).json({
            prescriptions,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error getting pending prescriptions:', error);
        return res.status(500).json({ message: 'Failed to get pending prescriptions', error: error.message });
    }
};
// Update prescription status (dispense)
PrescriptionController.dispensePrescription = async (req, res) => {
    var _b;
    try {
        const { id } = req.params;
        const { items } = req.body;
        // Get pharmacist ID from authenticated user
        const pharmacistId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!pharmacistId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Prescription items are required' });
        }
        // Start a transaction
        const queryRunner = database_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Get prescription
            const prescriptionRepository = queryRunner.manager.getRepository(Prescription_1.Prescription);
            const prescription = await prescriptionRepository.findOne({
                where: { id },
                relations: ['items']
            });
            if (!prescription) {
                return res.status(404).json({ message: 'Prescription not found' });
            }
            if (prescription.status === Prescription_1.PrescriptionStatus.DISPENSED) {
                return res.status(400).json({ message: 'Prescription has already been dispensed' });
            }
            if (prescription.status === Prescription_1.PrescriptionStatus.CANCELLED) {
                return res.status(400).json({ message: 'Cannot dispense a cancelled prescription' });
            }
            // Update prescription items
            const prescriptionItemRepository = queryRunner.manager.getRepository(PrescriptionItem_1.PrescriptionItem);
            const medicineRepository = queryRunner.manager.getRepository(Medicine_1.Medicine);
            const medicineTransactionRepository = queryRunner.manager.getRepository(MedicineTransaction_1.MedicineTransaction);
            let allItemsDispensed = true;
            for (const itemUpdate of items) {
                // Find prescription item
                const prescriptionItem = await prescriptionItemRepository.findOne({
                    where: { id: itemUpdate.id, prescriptionId: id }
                });
                if (!prescriptionItem) {
                    throw new Error(`Prescription item with ID ${itemUpdate.id} not found`);
                }
                // Update prescription item status
                prescriptionItem.status = itemUpdate.status;
                await prescriptionItemRepository.save(prescriptionItem);
                // If item is dispensed, update medicine stock
                if (itemUpdate.status === PrescriptionItem_1.PrescriptionItemStatus.DISPENSED) {
                    // Get medicine
                    const medicine = await medicineRepository.findOne({
                        where: { id: prescriptionItem.medicineId }
                    });
                    if (!medicine) {
                        throw new Error(`Medicine with ID ${prescriptionItem.medicineId} not found`);
                    }
                    // Check if enough stock
                    if (medicine.currentStock < prescriptionItem.quantity) {
                        throw new Error(`Not enough stock for medicine ${medicine.name}`);
                    }
                    // Update medicine stock
                    medicine.currentStock -= prescriptionItem.quantity;
                    await medicineRepository.save(medicine);
                    // Create medicine transaction
                    const transaction = medicineTransactionRepository.create({
                        medicineId: medicine.id,
                        transactionType: MedicineTransaction_1.TransactionType.SALE,
                        quantity: prescriptionItem.quantity,
                        transactionDate: new Date(),
                        reference: `Prescription: ${prescription.id}`,
                        performedById: pharmacistId
                    });
                    await medicineTransactionRepository.save(transaction);
                }
                else {
                    allItemsDispensed = false;
                }
            }
            // Update prescription status
            prescription.status = allItemsDispensed ?
                Prescription_1.PrescriptionStatus.DISPENSED :
                Prescription_1.PrescriptionStatus.PARTIALLY_DISPENSED;
            await prescriptionRepository.save(prescription);
            // Commit transaction
            await queryRunner.commitTransaction();
            return res.status(200).json({
                message: 'Prescription dispensed successfully',
                prescription
            });
        }
        catch (error) {
            // Rollback transaction in case of error
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            // Release query runner
            await queryRunner.release();
        }
    }
    catch (error) {
        console.error('Error dispensing prescription:', error);
        return res.status(500).json({ message: 'Failed to dispense prescription', error: error.message });
    }
};
// Cancel prescription
PrescriptionController.cancelPrescription = async (req, res) => {
    var _b;
    try {
        const { id } = req.params;
        const { reason } = req.body;
        // Get user ID from authenticated user
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // Start a transaction
        const queryRunner = database_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Get prescription
            const prescriptionRepository = queryRunner.manager.getRepository(Prescription_1.Prescription);
            const prescription = await prescriptionRepository.findOne({
                where: { id },
                relations: ['items']
            });
            if (!prescription) {
                return res.status(404).json({ message: 'Prescription not found' });
            }
            if (prescription.status === Prescription_1.PrescriptionStatus.DISPENSED) {
                return res.status(400).json({ message: 'Cannot cancel a dispensed prescription' });
            }
            if (prescription.status === Prescription_1.PrescriptionStatus.CANCELLED) {
                return res.status(400).json({ message: 'Prescription is already cancelled' });
            }
            // Update prescription status
            prescription.status = Prescription_1.PrescriptionStatus.CANCELLED;
            prescription.notes = prescription.notes ?
                `${prescription.notes}\n\nCancelled: ${reason}` :
                `Cancelled: ${reason}`;
            await prescriptionRepository.save(prescription);
            // Update all pending prescription items to cancelled
            const prescriptionItemRepository = queryRunner.manager.getRepository(PrescriptionItem_1.PrescriptionItem);
            for (const item of prescription.items) {
                if (item.status === PrescriptionItem_1.PrescriptionItemStatus.PENDING) {
                    item.status = PrescriptionItem_1.PrescriptionItemStatus.CANCELLED;
                    await prescriptionItemRepository.save(item);
                }
            }
            // Commit transaction
            await queryRunner.commitTransaction();
            return res.status(200).json({
                message: 'Prescription cancelled successfully',
                prescription
            });
        }
        catch (error) {
            // Rollback transaction in case of error
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            // Release query runner
            await queryRunner.release();
        }
    }
    catch (error) {
        console.error('Error cancelling prescription:', error);
        return res.status(500).json({ message: 'Failed to cancel prescription', error: error.message });
    }
};
