"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
const MedicalRecord_1 = require("../models/MedicalRecord");
const Bill_1 = require("../models/Bill");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /patient-portal/medical-records:
 *   get:
 *     summary: Get patient's medical records
 *     tags: [Patient Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of medical records
 */
router.get('/medical-records', (0, error_middleware_1.errorHandler)(async (req, res) => {
    const repo = database_1.AppDataSource.getRepository(MedicalRecord_1.MedicalRecord);
    const { page = '1', limit = '10', startDate, endDate, q, type } = req.query;
    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 100);
    const qb = repo.createQueryBuilder('r')
        .leftJoin('r.patient', 'p')
        .leftJoinAndSelect('r.doctor', 'doctor')
        .where('p.id = :pid', { pid: req.user.id })
        .orderBy('r.recordDate', 'DESC')
        .skip((pageNum - 1) * limitNum)
        .take(limitNum);
    if (startDate && endDate) {
        qb.andWhere('r.recordDate BETWEEN :start AND :end', { start: new Date(String(startDate)), end: new Date(String(endDate)) });
    }
    if (type) {
        qb.andWhere('r.type = :type', { type: String(type) });
    }
    if (q) {
        const s = `%${String(q).toLowerCase()}%`;
        qb.andWhere('(LOWER(r.title) LIKE :s OR LOWER(r.description) LIKE :s OR LOWER(r.diagnosis) LIKE :s OR LOWER(r.treatment) LIKE :s OR LOWER(r.medications) LIKE :s)', { s });
    }
    const [items, total] = await qb.getManyAndCount();
    res.json({ data: items, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
}));
/**
 * @swagger
 * /patient-portal/bills/{id}/invoice.pdf:
 *   get:
 *     summary: Download invoice PDF for a bill
 *     tags: [Patient Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: PDF stream
 */
router.get('/bills/:id/invoice.pdf', (0, error_middleware_1.errorHandler)(async (req, res) => {
    var _a;
    const repo = database_1.AppDataSource.getRepository(Bill_1.Bill);
    const id = String(req.params.id);
    const bill = await repo.createQueryBuilder('b')
        .leftJoinAndSelect('b.patient', 'p')
        .leftJoinAndSelect('b.appointment', 'a')
        .where('b.id = :id', { id })
        .getOne();
    if (!bill || String((_a = bill.patient) === null || _a === void 0 ? void 0 : _a.id) !== String(req.user.id)) {
        return res.status(404).json({ message: 'Bill not found' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice_${bill.billNumber}.pdf"`);
    const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
    doc.pipe(res);
    // Header with optional logo and settings
    const hospitalName = process.env.HOSPITAL_NAME || 'Ayphen Hospitals';
    const hospitalAddress = process.env.HOSPITAL_ADDRESS || '123 Health St, Wellness City, 00000';
    const hospitalPhone = process.env.HOSPITAL_PHONE || '';
    const logoPath = process.env.HOSPITAL_LOGO_PATH ? path_1.default.resolve(process.env.HOSPITAL_LOGO_PATH) : '';
    let headerX = 50;
    let curY = 50;
    try {
        if (logoPath && fs_1.default.existsSync(logoPath)) {
            doc.image(logoPath, headerX, curY, { width: 64 });
            headerX += 72;
        }
    }
    catch (_b) { }
    doc
        .fontSize(18)
        .fillColor('#13C2C2')
        .text(hospitalName, headerX, curY)
        .moveDown(0.2)
        .fontSize(10)
        .fillColor('#555')
        .text(hospitalAddress, headerX)
        .text(hospitalPhone, headerX)
        .moveDown(0.5)
        .fontSize(12)
        .fillColor('#333')
        .text('Invoice', { align: 'left' })
        .moveDown(1);
    // Bill To
    const patient = bill.patient;
    doc
        .fontSize(11)
        .text(`Bill #: ${bill.billNumber}`)
        .text(`Date: ${new Date(bill.billDate).toDateString()}`)
        .text(`Status: ${bill.status}`)
        .moveDown(0.5)
        .text('Bill To:', { continued: false })
        .text(`${(patient === null || patient === void 0 ? void 0 : patient.firstName) || ''} ${(patient === null || patient === void 0 ? void 0 : patient.lastName) || ''}`)
        .text(`${(patient === null || patient === void 0 ? void 0 : patient.email) || ''}`)
        .moveDown(1);
    // Items
    const items = Array.isArray(bill.itemDetails) ? bill.itemDetails : [];
    if (!items.length) {
        items.push({ name: 'Healthcare Services', quantity: 1, unitPrice: Number(bill.amount || 0), total: Number(bill.amount || 0) });
    }
    doc.fontSize(12).text('Details', { underline: true }).moveDown(0.5);
    const tableTop = doc.y;
    const colX = [50, 300, 380, 460];
    doc.fontSize(11).text('Item', colX[0], tableTop).text('Qty', colX[1], tableTop).text('Unit', colX[2], tableTop).text('Total', colX[3], tableTop);
    let y = tableTop + 18;
    items.forEach((it) => {
        doc.text(it.name, colX[0], y).text(String(it.quantity), colX[1], y).text(`$${Number(it.unitPrice).toFixed(2)}`, colX[2], y).text(`$${Number(it.total).toFixed(2)}`, colX[3], y);
        y += 18;
    });
    y += 10;
    const subtotal = items.reduce((sum, it) => sum + Number(it.total || 0), 0);
    const paid = Number(bill.paidAmount || 0);
    const balance = Math.max(0, subtotal - paid);
    doc.moveTo(colX[2], y).lineTo(550, y).strokeColor('#ccc').stroke();
    y += 8;
    doc.fontSize(11).text('Subtotal:', colX[2], y).text(`$${subtotal.toFixed(2)}`, colX[3], y, { align: 'left' });
    y += 16;
    doc.text('Paid:', colX[2], y).text(`$${paid.toFixed(2)}`, colX[3], y);
    y += 16;
    doc.font('Helvetica-Bold').text('Balance:', colX[2], y).text(`$${balance.toFixed(2)}`, colX[3], y).font('Helvetica');
    // Footer
    doc.moveDown(2).fontSize(10).fillColor('#666').text('Thank you for choosing Ayphen Hospitals. For questions about this invoice, contact billing@ayphen.example.com');
    doc.end();
}));
// Stripe test mode stub
router.post('/bills/:id/stripe-test', (0, error_middleware_1.errorHandler)(async (req, res) => {
    var _a;
    const repo = database_1.AppDataSource.getRepository(Bill_1.Bill);
    const id = String(req.params.id);
    const bill = await repo.createQueryBuilder('b').leftJoinAndSelect('b.patient', 'p').where('b.id = :id', { id }).getOne();
    if (!bill || String((_a = bill.patient) === null || _a === void 0 ? void 0 : _a.id) !== String(req.user.id)) {
        return res.status(404).json({ message: 'Bill not found' });
    }
    // In real integration, create a PaymentIntent here. For now, return a mock URL in test mode.
    if (String(process.env.STRIPE_TEST_MODE || '1') === '1') {
        const url = `https://dashboard.stripe.com/test/payments`;
        return res.json({ checkoutUrl: url, amount: bill.amount, currency: 'usd', testMode: true });
    }
    return res.status(501).json({ message: 'Stripe not configured' });
}));
/**
 * @swagger
 * /patient-portal/bills:
 *   get:
 *     summary: Get patient's billing history
 *     tags: [Patient Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bills
 */
router.get('/bills', (0, error_middleware_1.errorHandler)(async (req, res) => {
    const repo = database_1.AppDataSource.getRepository(Bill_1.Bill);
    const { page = '1', limit = '10', startDate, endDate, q, status } = req.query;
    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 100);
    const qb = repo.createQueryBuilder('b')
        .leftJoin('b.patient', 'p')
        .where('p.id = :pid', { pid: req.user.id })
        .orderBy('b.billDate', 'DESC')
        .skip((pageNum - 1) * limitNum)
        .take(limitNum);
    if (startDate && endDate) {
        qb.andWhere('b.billDate BETWEEN :start AND :end', { start: new Date(String(startDate)), end: new Date(String(endDate)) });
    }
    if (status) {
        qb.andWhere('b.status = :status', { status: String(status) });
    }
    if (q) {
        const s = `%${String(q).toLowerCase()}%`;
        qb.andWhere('(LOWER(b.billNumber) LIKE :s OR LOWER(b.description) LIKE :s)', { s });
    }
    const [items, total] = await qb.getManyAndCount();
    res.json({ data: items, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
}));
/**
 * @swagger
 * /patient-portal/dashboard:
 *   get:
 *     summary: Get patient dashboard summary
 *     tags: [Patient Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary
 */
router.get('/dashboard', (0, error_middleware_1.errorHandler)(async (req, res) => {
    const [recordRepo, billRepo] = [
        database_1.AppDataSource.getRepository(MedicalRecord_1.MedicalRecord),
        database_1.AppDataSource.getRepository(Bill_1.Bill)
    ];
    const [recentRecords, pendingBills, totalBills] = await Promise.all([
        recordRepo.find({
            where: { patient: { id: req.user.id } },
            order: { recordDate: 'DESC' },
            take: 3
        }),
        billRepo.find({
            where: { patient: { id: req.user.id }, status: Bill_1.BillStatus.PENDING },
            order: { billDate: 'DESC' }
        }),
        billRepo.count({ where: { patient: { id: req.user.id } } })
    ]);
    res.json({
        data: {
            recentRecords,
            pendingBills,
            stats: {
                totalRecords: await recordRepo.count({ where: { patient: { id: req.user.id } } }),
                totalBills,
                pendingBillsCount: pendingBills.length
            }
        }
    });
}));
/**
 * @swagger
 * /patient-portal/bills/{id}/pay:
 *   post:
 *     summary: Pay a bill (stub)
 *     tags: [Patient Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, insurance, online]
 *     responses:
 *       200:
 *         description: Updated bill
 */
router.post('/bills/:id/pay', (0, error_middleware_1.errorHandler)(async (req, res) => {
    var _a, _b;
    const repo = database_1.AppDataSource.getRepository(Bill_1.Bill);
    const id = String(req.params.id);
    const bill = await repo.createQueryBuilder('b').leftJoinAndSelect('b.patient', 'p').where('b.id = :id', { id }).getOne();
    if (!bill || String((_a = bill.patient) === null || _a === void 0 ? void 0 : _a.id) !== String(req.user.id)) {
        return res.status(404).json({ message: 'Bill not found' });
    }
    if (bill.status === Bill_1.BillStatus.PAID) {
        return res.status(400).json({ message: 'Bill already paid' });
    }
    if (bill.status === Bill_1.BillStatus.CANCELLED) {
        return res.status(400).json({ message: 'Bill is cancelled' });
    }
    const method = (_b = req.body) === null || _b === void 0 ? void 0 : _b.paymentMethod;
    bill.paidAmount = bill.amount;
    bill.status = Bill_1.BillStatus.PAID;
    bill.paidDate = new Date();
    if (method)
        bill.paymentMethod = method;
    await repo.save(bill);
    const updated = await repo.findOne({ where: { id } });
    return res.json(updated);
}));
exports.default = router;
