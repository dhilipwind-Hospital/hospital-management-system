"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const database_1 = require("../config/database");
const Report_1 = require("../models/Report");
const User_1 = require("../models/User");
class ReportController {
}
exports.ReportController = ReportController;
_a = ReportController;
ReportController.listPatientReports = async (req, res) => {
    const { patientId } = req.params;
    const repo = database_1.AppDataSource.getRepository(Report_1.Report);
    try {
        const items = await repo.find({ where: { patientId }, order: { createdAt: 'DESC' } });
        return res.json(items);
    }
    catch (e) {
        console.error('List reports error:', e);
        return res.status(500).json({ message: 'Failed to list reports' });
    }
};
ReportController.getReport = async (req, res) => {
    const { reportId } = req.params;
    const repo = database_1.AppDataSource.getRepository(Report_1.Report);
    try {
        const report = await repo.findOne({ where: { id: reportId } });
        if (!report)
            return res.status(404).json({ message: 'Report not found' });
        return res.json(report);
    }
    catch (e) {
        console.error('Get report error:', e);
        return res.status(500).json({ message: 'Failed to get report' });
    }
};
ReportController.createReport = async (req, res) => {
    const { patientId, type = 'other', title, content } = req.body || {};
    if (!patientId || !title)
        return res.status(400).json({ message: 'patientId and title are required' });
    const repo = database_1.AppDataSource.getRepository(Report_1.Report);
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    try {
        const patient = await userRepo.findOne({ where: { id: patientId } });
        if (!patient)
            return res.status(404).json({ message: 'Patient not found' });
        const r = new Report_1.Report();
        r.patientId = patientId;
        r.type = type;
        r.title = title;
        r.content = content || null;
        const saved = await repo.save(r);
        return res.status(201).json(saved);
    }
    catch (e) {
        console.error('Create report error:', e);
        return res.status(500).json({ message: 'Failed to create report' });
    }
};
