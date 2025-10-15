"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsuranceController = void 0;
const database_1 = require("../config/database");
const typeorm_1 = require("typeorm");
const Plan_1 = require("../models/Plan");
const Policy_1 = require("../models/Policy");
const Claim_1 = require("../models/Claim");
class InsuranceController {
}
exports.InsuranceController = InsuranceController;
_a = InsuranceController;
InsuranceController.listPlans = async (req, res) => {
    var _b;
    try {
        const repo = database_1.AppDataSource.getRepository(Plan_1.Plan);
        const country = String(((_b = req.query) === null || _b === void 0 ? void 0 : _b.country) || '').toUpperCase();
        const where = country && country !== 'ALL' ? { country } : {};
        const plans = await repo.find({ where, order: { priceMonthly: 'ASC' } });
        return res.json(plans);
    }
    catch (e) {
        console.error('listPlans error:', e);
        return res.status(500).json({ message: 'Failed to list plans' });
    }
};
InsuranceController.recommendPlans = async (req, res) => {
    var _b;
    try {
        const repo = database_1.AppDataSource.getRepository(Plan_1.Plan);
        const country = String(((_b = req.query) === null || _b === void 0 ? void 0 : _b.country) || '').toUpperCase();
        const where = country && country !== 'ALL' ? { country } : {};
        const plans = await repo.find({ where, order: { priceMonthly: 'ASC' }, take: 3 });
        return res.json(plans);
    }
    catch (e) {
        console.error('recommendPlans error:', e);
        return res.status(500).json({ message: 'Failed to recommend plans' });
    }
};
InsuranceController.comparePlans = async (req, res) => {
    try {
        const { planIds = [] } = req.body || {};
        const repo = database_1.AppDataSource.getRepository(Plan_1.Plan);
        if (!Array.isArray(planIds) || planIds.length === 0)
            return res.json([]);
        const items = await repo.find({ where: { id: (0, typeorm_1.In)(planIds) } });
        const mapped = items.map(p => ({
            id: p.id,
            name: p.name,
            insurer: p.insurer,
            coverageLevel: p.coverageLevel,
            waitingPeriod: p.waitingPeriod,
            priceMonthly: Number(p.priceMonthly),
            benefits: Array.isArray(p.benefits) ? p.benefits : [],
        }));
        return res.json(mapped);
    }
    catch (e) {
        console.error('comparePlans error:', e);
        return res.status(500).json({ message: 'Failed to compare plans' });
    }
};
InsuranceController.calculatePremium = async (req, res) => {
    try {
        const { age = 30, dependents = 0, prevYears = 0 } = req.body || {};
        const a = Number(age) || 0;
        const d = Number(dependents) || 0;
        const base = 50 + Math.max(0, a - 30) * 1.2 + d * 15;
        const loading = a > 34 ? Math.round(base * 0.1) : 0; // LCR placeholder
        const total = Math.round((base + loading) * 100) / 100;
        return res.json({ base, loading, total });
    }
    catch (e) {
        console.error('calculatePremium error:', e);
        return res.status(500).json({ message: 'Failed to calculate premium' });
    }
};
InsuranceController.familyCalc = async (req, res) => {
    var _b;
    try {
        // Placeholder: return cheapest few plans (optionally filtered by country)
        const repo = database_1.AppDataSource.getRepository(Plan_1.Plan);
        const country = String(((_b = req.query) === null || _b === void 0 ? void 0 : _b.country) || '').toUpperCase();
        const where = country && country !== 'ALL' ? { country } : {};
        const plans = await repo.find({ where, order: { priceMonthly: 'ASC' }, take: 5 });
        return res.json(plans);
    }
    catch (e) {
        console.error('familyCalc error:', e);
        return res.status(500).json({ message: 'Failed to compute family packages' });
    }
};
InsuranceController.purchase = async (req, res) => {
    var _b, _c;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!userId)
            return res.status(401).json({ message: 'Authentication required' });
        const { planId, billingCycle = 'monthly' } = req.body || {};
        if (!planId)
            return res.status(400).json({ message: 'planId is required' });
        const planRepo = database_1.AppDataSource.getRepository(Plan_1.Plan);
        const policyRepo = database_1.AppDataSource.getRepository(Policy_1.Policy);
        const plan = await planRepo.findOne({ where: { id: planId } });
        if (!plan)
            return res.status(404).json({ message: 'Plan not found' });
        const policy = policyRepo.create({
            userId,
            planId,
            billingCycle,
            status: 'active',
            startDate: new Date(),
        });
        const saved = await policyRepo.save(policy);
        const policyId = Array.isArray(saved) ? (_c = saved[0]) === null || _c === void 0 ? void 0 : _c.id : saved === null || saved === void 0 ? void 0 : saved.id;
        return res.status(201).json({ policyId, documents: [] });
    }
    catch (e) {
        console.error('purchase error:', e);
        return res.status(500).json({ message: 'Failed to purchase plan' });
    }
};
InsuranceController.listMyClaims = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!userId)
            return res.status(401).json({ message: 'Authentication required' });
        const repo = database_1.AppDataSource.getRepository(Claim_1.Claim);
        const claims = await repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
        return res.json(claims);
    }
    catch (e) {
        console.error('listMyClaims error:', e);
        return res.status(500).json({ message: 'Failed to list claims' });
    }
};
InsuranceController.myDashboard = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!userId)
            return res.status(401).json({ message: 'Authentication required' });
        // Placeholder benefit usage
        const benefits = [
            { key: 'gp', label: 'GP Visits', used: 1, total: 6 },
            { key: 'physio', label: 'Physio Sessions', used: 2, total: 8 },
            { key: 'scan', label: 'Scans', used: 0, total: 3 },
        ];
        return res.json({ benefits });
    }
    catch (e) {
        console.error('myDashboard error:', e);
        return res.status(500).json({ message: 'Failed to fetch dashboard' });
    }
};
