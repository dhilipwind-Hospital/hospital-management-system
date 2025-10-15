"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicineController = void 0;
const database_1 = require("../../config/database");
const Medicine_1 = require("../../models/pharmacy/Medicine");
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
class MedicineController {
}
exports.MedicineController = MedicineController;
_a = MedicineController;
// Get all medicines with pagination and filtering
MedicineController.getAllMedicines = async (req, res) => {
    try {
        const { page = 1, limit = 10, name, category, manufacturer, lowStock, expiringSoon, sortBy = 'name', sortOrder = 'ASC' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const medicineRepository = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        // Build query conditions
        const whereConditions = { isActive: true };
        if (name) {
            whereConditions.name = name;
        }
        if (category) {
            whereConditions.category = category;
        }
        if (manufacturer) {
            whereConditions.manufacturer = manufacturer;
        }
        if (lowStock === 'true') {
            whereConditions.currentStock = (0, typeorm_1.LessThanOrEqual)('reorderLevel');
        }
        if (expiringSoon === 'true') {
            const threeMonthsFromNow = new Date();
            threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
            whereConditions.expiryDate = (0, typeorm_1.Between)(new Date(), threeMonthsFromNow);
        }
        // Execute query with pagination and sorting
        const [medicines, total] = await medicineRepository.findAndCount({
            where: whereConditions,
            skip,
            take,
            order: {
                [sortBy]: sortOrder
            }
        });
        return res.status(200).json({
            medicines,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error getting medicines:', error);
        return res.status(500).json({ message: 'Failed to get medicines', error: error.message });
    }
};
// Get a single medicine by ID
MedicineController.getMedicineById = async (req, res) => {
    try {
        const { id } = req.params;
        const medicineRepository = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        const medicine = await medicineRepository.findOne({ where: { id } });
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        return res.status(200).json(medicine);
    }
    catch (error) {
        console.error('Error getting medicine:', error);
        return res.status(500).json({ message: 'Failed to get medicine', error: error.message });
    }
};
// Create a new medicine
MedicineController.createMedicine = async (req, res) => {
    try {
        const medicineRepository = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        const medicine = medicineRepository.create(req.body);
        // Validate medicine data
        const errors = await (0, class_validator_1.validate)(medicine);
        if (errors.length > 0) {
            return res.status(400).json({ message: 'Validation failed', errors });
        }
        // Save medicine
        await medicineRepository.save(medicine);
        return res.status(201).json({ message: 'Medicine created successfully', medicine });
    }
    catch (error) {
        console.error('Error creating medicine:', error);
        return res.status(500).json({ message: 'Failed to create medicine', error: error.message });
    }
};
// Update an existing medicine
MedicineController.updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const medicineRepository = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        // Find existing medicine
        let medicine = await medicineRepository.findOne({ where: { id } });
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        // Update medicine properties
        medicineRepository.merge(medicine, req.body);
        // Validate updated medicine
        const errors = await (0, class_validator_1.validate)(medicine);
        if (errors.length > 0) {
            return res.status(400).json({ message: 'Validation failed', errors });
        }
        // Save updated medicine
        medicine = await medicineRepository.save(medicine);
        return res.status(200).json({ message: 'Medicine updated successfully', medicine });
    }
    catch (error) {
        console.error('Error updating medicine:', error);
        return res.status(500).json({ message: 'Failed to update medicine', error: error.message });
    }
};
// Delete a medicine (soft delete)
MedicineController.deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const medicineRepository = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        // Find existing medicine
        const medicine = await medicineRepository.findOne({ where: { id } });
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        // Soft delete by setting isActive to false
        medicine.isActive = false;
        await medicineRepository.save(medicine);
        return res.status(200).json({ message: 'Medicine deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting medicine:', error);
        return res.status(500).json({ message: 'Failed to delete medicine', error: error.message });
    }
};
// Get low stock medicines
MedicineController.getLowStockMedicines = async (req, res) => {
    try {
        const medicineRepository = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        const medicines = await medicineRepository.find({
            where: {
                isActive: true,
                currentStock: (0, typeorm_1.LessThanOrEqual)('reorderLevel')
            }
        });
        return res.status(200).json(medicines);
    }
    catch (error) {
        console.error('Error getting low stock medicines:', error);
        return res.status(500).json({ message: 'Failed to get low stock medicines', error: error.message });
    }
};
// Get expiring medicines
MedicineController.getExpiringMedicines = async (req, res) => {
    try {
        const { days = 90 } = req.query; // Default to 90 days
        const medicineRepository = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Number(days));
        const medicines = await medicineRepository.find({
            where: {
                isActive: true,
                currentStock: (0, typeorm_1.LessThanOrEqual)('reorderLevel'),
                expiryDate: (0, typeorm_1.Between)(new Date(), futureDate)
            }
        });
        return res.status(200).json(medicines);
    }
    catch (error) {
        console.error('Error getting expiring medicines:', error);
        return res.status(500).json({ message: 'Failed to get expiring medicines', error: error.message });
    }
};
