"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelPrescription = exports.updatePrescription = exports.updatePrescriptionStatus = exports.getPrescriptionById = exports.getPharmacyPrescriptions = exports.getPrescriptionsByPatient = exports.getPrescriptionsByDoctor = exports.createPrescription = void 0;
const Prescription_1 = __importDefault(require("../models/Prescription"));
const PrescriptionItem_1 = __importDefault(require("../models/PrescriptionItem"));
const User_1 = __importDefault(require("../models/User"));
const Patient_1 = __importDefault(require("../models/Patient"));
const Medicine_1 = __importDefault(require("../models/Medicine"));
const sequelize_1 = require("sequelize");
// Create a new prescription
const createPrescription = async (req, res) => {
    try {
        const { patientId, doctorId, diagnosis, notes, prescriptionDate, items } = req.body;
        // Validate required fields
        if (!patientId || !doctorId || !diagnosis || !prescriptionDate || !items || items.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // Create prescription in database
        const prescription = await Prescription_1.default.create({
            patientId,
            doctorId,
            diagnosis,
            notes,
            prescriptionDate,
            status: 'pending',
        });
        // Create prescription items
        const prescriptionItems = await Promise.all(items.map((item) => PrescriptionItem_1.default.create({
            prescriptionId: prescription.id,
            medicineId: item.medicineId,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity,
            instructions: item.instructions,
            status: 'pending',
        })));
        return res.status(201).json({
            message: 'Prescription created successfully',
            prescription: {
                ...prescription.toJSON(),
                items: prescriptionItems,
            },
        });
    }
    catch (error) {
        console.error('Error creating prescription:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createPrescription = createPrescription;
// Get prescriptions by doctor
const getPrescriptionsByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const prescriptions = await Prescription_1.default.findAll({
            where: { doctorId },
            include: [
                {
                    model: User_1.default,
                    as: 'doctor',
                    attributes: ['id', 'firstName', 'lastName', 'specialization']
                },
                {
                    model: Patient_1.default,
                    as: 'patient',
                    attributes: ['id', 'firstName', 'lastName', 'age', 'gender']
                },
                {
                    model: PrescriptionItem_1.default,
                    as: 'items',
                    include: [{
                            model: Medicine_1.default,
                            as: 'medicine',
                            attributes: ['id', 'name', 'dosageForm', 'strength']
                        }]
                },
            ],
            order: [['prescriptionDate', 'DESC']],
        });
        return res.status(200).json({ prescriptions });
    }
    catch (error) {
        console.error('Error fetching prescriptions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPrescriptionsByDoctor = getPrescriptionsByDoctor;
// Get prescriptions by patient
const getPrescriptionsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const prescriptions = await Prescription_1.default.findAll({
            where: { patientId },
            include: [
                {
                    model: User_1.default,
                    as: 'doctor',
                    attributes: ['id', 'firstName', 'lastName', 'specialization']
                },
                {
                    model: Patient_1.default,
                    as: 'patient',
                    attributes: ['id', 'firstName', 'lastName', 'age', 'gender']
                },
                {
                    model: PrescriptionItem_1.default,
                    as: 'items',
                    include: [{
                            model: Medicine_1.default,
                            as: 'medicine',
                            attributes: ['id', 'name', 'dosageForm', 'strength']
                        }]
                },
            ],
            order: [['prescriptionDate', 'DESC']],
        });
        return res.status(200).json({ prescriptions });
    }
    catch (error) {
        console.error('Error fetching prescriptions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPrescriptionsByPatient = getPrescriptionsByPatient;
// Get prescriptions for pharmacy
const getPharmacyPrescriptions = async (req, res) => {
    try {
        const { status } = req.query;
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        const prescriptions = await Prescription_1.default.findAll({
            where: whereClause,
            include: [
                {
                    model: User_1.default,
                    as: 'doctor',
                    attributes: ['id', 'firstName', 'lastName', 'specialization']
                },
                {
                    model: Patient_1.default,
                    as: 'patient',
                    attributes: ['id', 'firstName', 'lastName', 'age', 'gender']
                },
                {
                    model: PrescriptionItem_1.default,
                    as: 'items',
                    include: [{
                            model: Medicine_1.default,
                            as: 'medicine',
                            attributes: ['id', 'name', 'dosageForm', 'strength', 'currentStock']
                        }]
                },
            ],
            order: [['prescriptionDate', 'DESC']],
        });
        return res.status(200).json({ prescriptions });
    }
    catch (error) {
        console.error('Error fetching prescriptions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPharmacyPrescriptions = getPharmacyPrescriptions;
// Get a single prescription by ID
const getPrescriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const prescription = await Prescription_1.default.findByPk(id, {
            include: [
                {
                    model: User_1.default,
                    as: 'doctor',
                    attributes: ['id', 'firstName', 'lastName', 'specialization']
                },
                {
                    model: Patient_1.default,
                    as: 'patient',
                    attributes: ['id', 'firstName', 'lastName', 'age', 'gender']
                },
                {
                    model: PrescriptionItem_1.default,
                    as: 'items',
                    include: [{
                            model: Medicine_1.default,
                            as: 'medicine',
                            attributes: ['id', 'name', 'dosageForm', 'strength', 'currentStock']
                        }]
                },
            ],
        });
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        return res.status(200).json({ prescription });
    }
    catch (error) {
        console.error('Error fetching prescription:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPrescriptionById = getPrescriptionById;
// Update prescription status (for pharmacy dispensing)
const updatePrescriptionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: 'Invalid items data' });
        }
        const prescription = await Prescription_1.default.findByPk(id, {
            include: [{ model: PrescriptionItem_1.default, as: 'items' }],
        });
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        // Update each prescription item
        await Promise.all(items.map(async (item) => {
            await PrescriptionItem_1.default.update({ status: item.status }, { where: { id: item.id } });
            // If item is dispensed, update medicine stock
            if (item.status === 'dispensed') {
                const prescriptionItem = await PrescriptionItem_1.default.findByPk(item.id);
                if (prescriptionItem) {
                    await Medicine_1.default.decrement('currentStock', { by: prescriptionItem.quantity, where: { id: prescriptionItem.medicineId } });
                }
            }
        }));
        // Determine overall prescription status
        const updatedItems = await PrescriptionItem_1.default.findAll({
            where: { prescriptionId: id },
        });
        const allDispensed = updatedItems.every(item => item.status === 'dispensed');
        const anyDispensed = updatedItems.some(item => item.status === 'dispensed');
        const anyOutOfStock = updatedItems.some(item => item.status === 'out_of_stock');
        let newStatus = 'pending';
        if (allDispensed) {
            newStatus = 'dispensed';
        }
        else if (anyDispensed || anyOutOfStock) {
            newStatus = 'partially_dispensed';
        }
        await prescription.update({ status: newStatus });
        // Get updated prescription with all relations
        const updatedPrescription = await Prescription_1.default.findByPk(id, {
            include: [
                {
                    model: User_1.default,
                    as: 'doctor',
                    attributes: ['id', 'firstName', 'lastName', 'specialization']
                },
                {
                    model: Patient_1.default,
                    as: 'patient',
                    attributes: ['id', 'firstName', 'lastName', 'age', 'gender']
                },
                {
                    model: PrescriptionItem_1.default,
                    as: 'items',
                    include: [{
                            model: Medicine_1.default,
                            as: 'medicine',
                            attributes: ['id', 'name', 'dosageForm', 'strength', 'currentStock']
                        }]
                },
            ],
        });
        return res.status(200).json({
            message: 'Prescription status updated successfully',
            prescription: updatedPrescription,
        });
    }
    catch (error) {
        console.error('Error updating prescription status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updatePrescriptionStatus = updatePrescriptionStatus;
// Update prescription (for doctors to edit pending prescriptions)
const updatePrescription = async (req, res) => {
    try {
        const { id } = req.params;
        const { diagnosis, notes, prescriptionDate, items } = req.body;
        const prescription = await Prescription_1.default.findByPk(id);
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        if (prescription.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending prescriptions can be updated' });
        }
        // Update prescription
        await prescription.update({
            diagnosis,
            notes,
            prescriptionDate,
        });
        // Handle items
        if (items && Array.isArray(items)) {
            // Get existing items
            const existingItems = await PrescriptionItem_1.default.findAll({
                where: { prescriptionId: id },
            });
            // Items to delete (not in the updated list)
            const existingItemIds = existingItems.map(item => item.id);
            const updatedItemIds = items.filter(item => item.id).map(item => item.id);
            const itemsToDelete = existingItemIds.filter(id => !updatedItemIds.includes(id));
            // Delete items
            if (itemsToDelete.length > 0) {
                await PrescriptionItem_1.default.destroy({
                    where: { id: { [sequelize_1.Op.in]: itemsToDelete } },
                });
            }
            // Update or create items
            await Promise.all(items.map(async (item) => {
                if (item.id) {
                    // Update existing item
                    await PrescriptionItem_1.default.update({
                        medicineId: item.medicineId,
                        dosage: item.dosage,
                        frequency: item.frequency,
                        duration: item.duration,
                        quantity: item.quantity,
                        instructions: item.instructions,
                    }, { where: { id: item.id } });
                }
                else {
                    // Create new item
                    await PrescriptionItem_1.default.create({
                        prescriptionId: id,
                        medicineId: item.medicineId,
                        dosage: item.dosage,
                        frequency: item.frequency,
                        duration: item.duration,
                        quantity: item.quantity,
                        instructions: item.instructions,
                        status: 'pending',
                    });
                }
            }));
        }
        // Get updated prescription with all relations
        const updatedPrescription = await Prescription_1.default.findByPk(id, {
            include: [
                {
                    model: User_1.default,
                    as: 'doctor',
                    attributes: ['id', 'firstName', 'lastName', 'specialization']
                },
                {
                    model: Patient_1.default,
                    as: 'patient',
                    attributes: ['id', 'firstName', 'lastName', 'age', 'gender']
                },
                {
                    model: PrescriptionItem_1.default,
                    as: 'items',
                    include: [{
                            model: Medicine_1.default,
                            as: 'medicine',
                            attributes: ['id', 'name', 'dosageForm', 'strength']
                        }]
                },
            ],
        });
        return res.status(200).json({
            message: 'Prescription updated successfully',
            prescription: updatedPrescription,
        });
    }
    catch (error) {
        console.error('Error updating prescription:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updatePrescription = updatePrescription;
// Cancel a prescription
const cancelPrescription = async (req, res) => {
    try {
        const { id } = req.params;
        const prescription = await Prescription_1.default.findByPk(id);
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        if (prescription.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending prescriptions can be cancelled' });
        }
        // Update prescription status
        await prescription.update({ status: 'cancelled' });
        // Update all items to cancelled
        await PrescriptionItem_1.default.update({ status: 'cancelled' }, { where: { prescriptionId: id } });
        return res.status(200).json({
            message: 'Prescription cancelled successfully',
        });
    }
    catch (error) {
        console.error('Error cancelling prescription:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.cancelPrescription = cancelPrescription;
