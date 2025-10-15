"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderController = void 0;
const database_1 = require("../config/database");
const PurchaseOrder_1 = require("../models/PurchaseOrder");
const Supplier_1 = require("../models/Supplier");
const User_1 = require("../models/User");
const Medicine_1 = require("../models/pharmacy/Medicine");
const StockMovement_1 = require("../models/pharmacy/StockMovement");
class PurchaseOrderController {
}
exports.PurchaseOrderController = PurchaseOrderController;
_a = PurchaseOrderController;
// Get all purchase orders
PurchaseOrderController.getPurchaseOrders = async (req, res) => {
    try {
        const { status, supplierId } = req.query;
        const poRepo = database_1.AppDataSource.getRepository(PurchaseOrder_1.PurchaseOrder);
        const queryBuilder = poRepo.createQueryBuilder('po')
            .leftJoinAndSelect('po.supplier', 'supplier')
            .leftJoinAndSelect('po.createdBy', 'createdBy')
            .leftJoinAndSelect('po.approvedBy', 'approvedBy')
            .orderBy('po.createdAt', 'DESC');
        if (status) {
            queryBuilder.andWhere('po.status = :status', { status });
        }
        if (supplierId) {
            queryBuilder.andWhere('po.supplierId = :supplierId', { supplierId });
        }
        const orders = await queryBuilder.getMany();
        return res.json({
            data: orders,
            total: orders.length
        });
    }
    catch (error) {
        console.error('Error fetching purchase orders:', error);
        return res.status(500).json({ message: 'Error fetching purchase orders' });
    }
};
// Get purchase order by ID
PurchaseOrderController.getPurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const poRepo = database_1.AppDataSource.getRepository(PurchaseOrder_1.PurchaseOrder);
        const order = await poRepo.findOne({
            where: { id },
            relations: ['supplier', 'createdBy', 'approvedBy']
        });
        if (!order) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        return res.json({ data: order });
    }
    catch (error) {
        console.error('Error fetching purchase order:', error);
        return res.status(500).json({ message: 'Error fetching purchase order' });
    }
};
// Create purchase order
PurchaseOrderController.createPurchaseOrder = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const { supplierId, items, expectedDeliveryDate, notes } = req.body;
        if (!supplierId || !items || items.length === 0) {
            return res.status(400).json({ message: 'Supplier and items are required' });
        }
        const poRepo = database_1.AppDataSource.getRepository(PurchaseOrder_1.PurchaseOrder);
        const supplierRepo = database_1.AppDataSource.getRepository(Supplier_1.Supplier);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const supplier = await supplierRepo.findOne({ where: { id: supplierId } });
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        // Generate order number
        const orderNumber = `PO-${Date.now()}`;
        const purchaseOrder = poRepo.create({
            orderNumber,
            supplier,
            status: PurchaseOrder_1.PurchaseOrderStatus.DRAFT,
            items,
            totalAmount,
            expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
            notes,
            createdBy: user
        });
        await poRepo.save(purchaseOrder);
        return res.status(201).json({
            message: 'Purchase order created successfully',
            data: purchaseOrder
        });
    }
    catch (error) {
        console.error('Error creating purchase order:', error);
        return res.status(500).json({ message: 'Error creating purchase order' });
    }
};
// Update purchase order status
PurchaseOrderController.updateOrderStatus = async (req, res) => {
    var _b;
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const poRepo = database_1.AppDataSource.getRepository(PurchaseOrder_1.PurchaseOrder);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const order = await poRepo.findOne({ where: { id } });
        if (!order) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        order.status = status;
        if (status === PurchaseOrder_1.PurchaseOrderStatus.APPROVED) {
            const user = await userRepo.findOne({ where: { id: userId } });
            if (user) {
                order.approvedBy = user;
            }
        }
        await poRepo.save(order);
        return res.json({
            message: 'Purchase order status updated successfully',
            data: order
        });
    }
    catch (error) {
        console.error('Error updating purchase order status:', error);
        return res.status(500).json({ message: 'Error updating purchase order status' });
    }
};
// Receive purchase order (update stock)
PurchaseOrderController.receivePurchaseOrder = async (req, res) => {
    var _b;
    try {
        const { id } = req.params;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const poRepo = database_1.AppDataSource.getRepository(PurchaseOrder_1.PurchaseOrder);
        const medicineRepo = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        const movementRepo = database_1.AppDataSource.getRepository(StockMovement_1.StockMovement);
        const order = await poRepo.findOne({ where: { id } });
        if (!order) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        if (order.status !== PurchaseOrder_1.PurchaseOrderStatus.ORDERED) {
            return res.status(400).json({ message: 'Order must be in ORDERED status to receive' });
        }
        // Update stock for each item
        for (const item of order.items) {
            const medicine = await medicineRepo.findOne({ where: { id: item.medicineId } });
            if (medicine) {
                const previousStock = medicine.currentStock;
                medicine.currentStock += item.quantity;
                await medicineRepo.save(medicine);
                // Record stock movement
                const movement = movementRepo.create({
                    medicine,
                    movementType: StockMovement_1.MovementType.PURCHASE,
                    quantity: item.quantity,
                    previousStock,
                    newStock: medicine.currentStock,
                    referenceNumber: order.orderNumber,
                    notes: `Purchase order received: ${order.orderNumber}`,
                    performedBy: { id: userId }
                });
                await movementRepo.save(movement);
            }
        }
        // Update order status
        order.status = PurchaseOrder_1.PurchaseOrderStatus.RECEIVED;
        order.receivedDate = new Date();
        await poRepo.save(order);
        return res.json({
            message: 'Purchase order received and stock updated successfully',
            data: order
        });
    }
    catch (error) {
        console.error('Error receiving purchase order:', error);
        return res.status(500).json({ message: 'Error receiving purchase order' });
    }
};
// Auto-generate purchase orders for low stock items
PurchaseOrderController.generateAutoOrders = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const medicineRepo = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        const poRepo = database_1.AppDataSource.getRepository(PurchaseOrder_1.PurchaseOrder);
        // Get medicines that need reordering
        const lowStockMedicines = await medicineRepo.createQueryBuilder('m')
            .where('m.currentStock <= m.reorderLevel')
            .andWhere('m.isActive = true')
            .getMany();
        if (lowStockMedicines.length === 0) {
            return res.json({
                message: 'No medicines need reordering',
                data: []
            });
        }
        // Group by supplier (for now, we'll create one order with all items)
        // In production, you'd group by actual supplier relationships
        const items = lowStockMedicines.map(medicine => ({
            medicineId: medicine.id,
            medicineName: medicine.name,
            quantity: (medicine.reorderLevel * 2) - medicine.currentStock,
            unitPrice: medicine.unitPrice
        }));
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        // For demo, use first active supplier
        const supplierRepo = database_1.AppDataSource.getRepository(Supplier_1.Supplier);
        const supplier = await supplierRepo.findOne({ where: { isActive: true } });
        if (!supplier) {
            return res.status(400).json({ message: 'No active supplier found' });
        }
        const orderNumber = `PO-AUTO-${Date.now()}`;
        const purchaseOrder = poRepo.create({
            orderNumber,
            supplier,
            status: PurchaseOrder_1.PurchaseOrderStatus.DRAFT,
            items,
            totalAmount,
            notes: 'Auto-generated purchase order for low stock items',
            createdBy: { id: userId }
        });
        await poRepo.save(purchaseOrder);
        return res.status(201).json({
            message: 'Auto purchase order generated successfully',
            data: purchaseOrder
        });
    }
    catch (error) {
        console.error('Error generating auto purchase order:', error);
        return res.status(500).json({ message: 'Error generating auto purchase order' });
    }
};
