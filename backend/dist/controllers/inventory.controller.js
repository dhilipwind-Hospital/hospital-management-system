"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const database_1 = require("../config/database");
const Medicine_1 = require("../models/pharmacy/Medicine");
const StockAlert_1 = require("../models/pharmacy/StockAlert");
const StockMovement_1 = require("../models/pharmacy/StockMovement");
class InventoryController {
}
exports.InventoryController = InventoryController;
_a = InventoryController;
// Generate stock alerts
InventoryController.generateAlerts = async (req, res) => {
    try {
        const medicineRepo = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        const alertRepo = database_1.AppDataSource.getRepository(StockAlert_1.StockAlert);
        const medicines = await medicineRepo.find({ where: { isActive: true } });
        const alerts = [];
        const now = new Date();
        for (const medicine of medicines) {
            // Clear old active alerts for this medicine
            await alertRepo.update({ medicine: { id: medicine.id }, status: StockAlert_1.AlertStatus.ACTIVE }, { status: StockAlert_1.AlertStatus.RESOLVED });
            // Check for low stock
            if (medicine.currentStock <= medicine.reorderLevel && medicine.currentStock > 0) {
                const alert = alertRepo.create({
                    medicine,
                    alertType: StockAlert_1.AlertType.LOW_STOCK,
                    status: StockAlert_1.AlertStatus.ACTIVE,
                    message: `${medicine.name} is running low. Current stock: ${medicine.currentStock}, Reorder level: ${medicine.reorderLevel}`,
                    currentStock: medicine.currentStock,
                    reorderLevel: medicine.reorderLevel
                });
                alerts.push(alert);
            }
            // Check for out of stock
            if (medicine.currentStock === 0) {
                const alert = alertRepo.create({
                    medicine,
                    alertType: StockAlert_1.AlertType.OUT_OF_STOCK,
                    status: StockAlert_1.AlertStatus.ACTIVE,
                    message: `${medicine.name} is out of stock!`,
                    currentStock: medicine.currentStock
                });
                alerts.push(alert);
            }
            // Check for expiry
            if (medicine.expiryDate) {
                const expiryDate = new Date(medicine.expiryDate);
                const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiry < 0) {
                    const alert = alertRepo.create({
                        medicine,
                        alertType: StockAlert_1.AlertType.EXPIRED,
                        status: StockAlert_1.AlertStatus.ACTIVE,
                        message: `${medicine.name} has expired on ${expiryDate.toDateString()}`,
                        expiryDate: medicine.expiryDate,
                        daysUntilExpiry
                    });
                    alerts.push(alert);
                }
                else if (daysUntilExpiry <= 90) {
                    const alert = alertRepo.create({
                        medicine,
                        alertType: StockAlert_1.AlertType.NEAR_EXPIRY,
                        status: StockAlert_1.AlertStatus.ACTIVE,
                        message: `${medicine.name} will expire in ${daysUntilExpiry} days`,
                        expiryDate: medicine.expiryDate,
                        daysUntilExpiry
                    });
                    alerts.push(alert);
                }
            }
        }
        if (alerts.length > 0) {
            await alertRepo.save(alerts);
        }
        return res.json({
            message: 'Alerts generated successfully',
            alertsCreated: alerts.length,
            data: alerts
        });
    }
    catch (error) {
        console.error('Error generating alerts:', error);
        return res.status(500).json({ message: 'Error generating alerts' });
    }
};
// Get active alerts
InventoryController.getAlerts = async (req, res) => {
    try {
        const { type, status = 'active' } = req.query;
        const alertRepo = database_1.AppDataSource.getRepository(StockAlert_1.StockAlert);
        const queryBuilder = alertRepo.createQueryBuilder('alert')
            .leftJoinAndSelect('alert.medicine', 'medicine')
            .orderBy('alert.createdAt', 'DESC');
        if (status) {
            queryBuilder.andWhere('alert.status = :status', { status });
        }
        if (type) {
            queryBuilder.andWhere('alert.alertType = :type', { type });
        }
        const alerts = await queryBuilder.getMany();
        // Categorize alerts
        const categorized = {
            critical: alerts.filter(a => a.alertType === StockAlert_1.AlertType.OUT_OF_STOCK || a.alertType === StockAlert_1.AlertType.EXPIRED),
            warning: alerts.filter(a => a.alertType === StockAlert_1.AlertType.LOW_STOCK || a.alertType === StockAlert_1.AlertType.NEAR_EXPIRY),
            all: alerts
        };
        return res.json({
            data: alerts,
            categorized,
            total: alerts.length,
            criticalCount: categorized.critical.length
        });
    }
    catch (error) {
        console.error('Error fetching alerts:', error);
        return res.status(500).json({ message: 'Error fetching alerts' });
    }
};
// Acknowledge alert
InventoryController.acknowledgeAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const alertRepo = database_1.AppDataSource.getRepository(StockAlert_1.StockAlert);
        await alertRepo.update(id, { status: StockAlert_1.AlertStatus.ACKNOWLEDGED });
        return res.json({ message: 'Alert acknowledged successfully' });
    }
    catch (error) {
        console.error('Error acknowledging alert:', error);
        return res.status(500).json({ message: 'Error acknowledging alert' });
    }
};
// Get stock movements
InventoryController.getStockMovements = async (req, res) => {
    try {
        const { medicineId, type, limit = 50 } = req.query;
        const movementRepo = database_1.AppDataSource.getRepository(StockMovement_1.StockMovement);
        const queryBuilder = movementRepo.createQueryBuilder('movement')
            .leftJoinAndSelect('movement.medicine', 'medicine')
            .leftJoinAndSelect('movement.performedBy', 'user')
            .orderBy('movement.createdAt', 'DESC')
            .take(Number(limit));
        if (medicineId) {
            queryBuilder.andWhere('movement.medicineId = :medicineId', { medicineId });
        }
        if (type) {
            queryBuilder.andWhere('movement.movementType = :type', { type });
        }
        const movements = await queryBuilder.getMany();
        return res.json({
            data: movements,
            total: movements.length
        });
    }
    catch (error) {
        console.error('Error fetching stock movements:', error);
        return res.status(500).json({ message: 'Error fetching stock movements' });
    }
};
// Record stock movement
InventoryController.recordMovement = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const { medicineId, movementType, quantity, notes, referenceNumber } = req.body;
        const medicineRepo = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        const movementRepo = database_1.AppDataSource.getRepository(StockMovement_1.StockMovement);
        const medicine = await medicineRepo.findOne({ where: { id: medicineId } });
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        const previousStock = medicine.currentStock;
        let newStock = previousStock;
        // Calculate new stock based on movement type
        if ([StockMovement_1.MovementType.PURCHASE, StockMovement_1.MovementType.RETURN].includes(movementType)) {
            newStock = previousStock + quantity;
        }
        else if ([StockMovement_1.MovementType.SALE, StockMovement_1.MovementType.EXPIRED, StockMovement_1.MovementType.DAMAGED].includes(movementType)) {
            newStock = previousStock - quantity;
        }
        else if (movementType === StockMovement_1.MovementType.ADJUSTMENT) {
            newStock = quantity; // Direct adjustment
        }
        // Update medicine stock
        medicine.currentStock = newStock;
        await medicineRepo.save(medicine);
        // Record movement
        const movement = movementRepo.create({
            medicine,
            movementType,
            quantity,
            previousStock,
            newStock,
            notes,
            referenceNumber,
            performedBy: { id: userId }
        });
        await movementRepo.save(movement);
        return res.status(201).json({
            message: 'Stock movement recorded successfully',
            data: movement
        });
    }
    catch (error) {
        console.error('Error recording stock movement:', error);
        return res.status(500).json({ message: 'Error recording stock movement' });
    }
};
// Get inventory dashboard
InventoryController.getDashboard = async (req, res) => {
    try {
        const medicineRepo = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        const alertRepo = database_1.AppDataSource.getRepository(StockAlert_1.StockAlert);
        const [totalMedicines, lowStockCount, outOfStockCount, nearExpiryCount, expiredCount, activeAlerts] = await Promise.all([
            medicineRepo.count({ where: { isActive: true } }),
            medicineRepo.createQueryBuilder('m')
                .where('m.currentStock <= m.reorderLevel')
                .andWhere('m.currentStock > 0')
                .andWhere('m.isActive = true')
                .getCount(),
            medicineRepo.count({ where: { currentStock: 0, isActive: true } }),
            medicineRepo.createQueryBuilder('m')
                .where('m.expiryDate <= :date', {
                date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            })
                .andWhere('m.expiryDate > :now', { now: new Date() })
                .andWhere('m.isActive = true')
                .getCount(),
            medicineRepo.createQueryBuilder('m')
                .where('m.expiryDate < :now', { now: new Date() })
                .andWhere('m.isActive = true')
                .getCount(),
            alertRepo.count({ where: { status: StockAlert_1.AlertStatus.ACTIVE } })
        ]);
        // Get total stock value
        const medicines = await medicineRepo.find({ where: { isActive: true } });
        const totalValue = medicines.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0);
        return res.json({
            data: {
                totalMedicines,
                lowStockCount,
                outOfStockCount,
                nearExpiryCount,
                expiredCount,
                activeAlerts,
                totalStockValue: totalValue.toFixed(2),
                criticalIssues: outOfStockCount + expiredCount
            }
        });
    }
    catch (error) {
        console.error('Error fetching dashboard:', error);
        return res.status(500).json({ message: 'Error fetching dashboard data' });
    }
};
// Get expiry report
InventoryController.getExpiryReport = async (req, res) => {
    try {
        const { days = 90 } = req.query;
        const medicineRepo = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Number(days));
        const expiringMedicines = await medicineRepo.createQueryBuilder('m')
            .where('m.expiryDate <= :futureDate', { futureDate })
            .andWhere('m.expiryDate >= :now', { now: new Date() })
            .andWhere('m.isActive = true')
            .orderBy('m.expiryDate', 'ASC')
            .getMany();
        const expiredMedicines = await medicineRepo.createQueryBuilder('m')
            .where('m.expiryDate < :now', { now: new Date() })
            .andWhere('m.isActive = true')
            .orderBy('m.expiryDate', 'DESC')
            .getMany();
        return res.json({
            data: {
                expiring: expiringMedicines,
                expired: expiredMedicines,
                expiringCount: expiringMedicines.length,
                expiredCount: expiredMedicines.length
            }
        });
    }
    catch (error) {
        console.error('Error fetching expiry report:', error);
        return res.status(500).json({ message: 'Error fetching expiry report' });
    }
};
// Get reorder report
InventoryController.getReorderReport = async (req, res) => {
    try {
        const medicineRepo = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        const reorderNeeded = await medicineRepo.createQueryBuilder('m')
            .where('m.currentStock <= m.reorderLevel')
            .andWhere('m.isActive = true')
            .orderBy('m.currentStock', 'ASC')
            .getMany();
        const suggestedOrders = reorderNeeded.map(medicine => ({
            medicine,
            currentStock: medicine.currentStock,
            reorderLevel: medicine.reorderLevel,
            suggestedQuantity: (medicine.reorderLevel * 2) - medicine.currentStock,
            estimatedCost: ((medicine.reorderLevel * 2) - medicine.currentStock) * medicine.unitPrice
        }));
        const totalEstimatedCost = suggestedOrders.reduce((sum, order) => sum + order.estimatedCost, 0);
        return res.json({
            data: suggestedOrders,
            total: suggestedOrders.length,
            totalEstimatedCost: totalEstimatedCost.toFixed(2)
        });
    }
    catch (error) {
        console.error('Error fetching reorder report:', error);
        return res.status(500).json({ message: 'Error fetching reorder report' });
    }
};
