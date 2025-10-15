"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralController = void 0;
const database_1 = require("../config/database");
const Referral_1 = require("../models/Referral");
const User_1 = require("../models/User");
const Department_1 = require("../models/Department");
const access_middleware_1 = require("../middleware/access.middleware");
class ReferralController {
}
exports.ReferralController = ReferralController;
_a = ReferralController;
ReferralController.createReferral = async (req, res) => {
    const { patientId, departmentId } = req.body || {};
    if (!patientId || !departmentId) {
        return res.status(400).json({ message: 'patientId and departmentId are required' });
    }
    try {
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const deptRepo = database_1.AppDataSource.getRepository(Department_1.Department);
        const refRepo = database_1.AppDataSource.getRepository(Referral_1.Referral);
        const patient = await userRepo.findOne({ where: { id: patientId } });
        if (!patient)
            return res.status(404).json({ message: 'Patient not found' });
        const dept = await deptRepo.findOne({ where: { id: departmentId } });
        if (!dept)
            return res.status(404).json({ message: 'Department not found' });
        const existing = await refRepo.findOne({ where: { patientId, departmentId } });
        if (existing)
            return res.status(200).json(existing);
        const r = new Referral_1.Referral();
        r.patientId = patientId;
        r.departmentId = departmentId;
        const saved = await refRepo.save(r);
        return res.status(201).json(saved);
    }
    catch (e) {
        console.error('Create referral error:', e);
        return res.status(500).json({ message: 'Failed to create referral' });
    }
};
ReferralController.listPatientReferrals = async (req, res) => {
    const { patientId } = req.params;
    try {
        const refRepo = database_1.AppDataSource.getRepository(Referral_1.Referral);
        const items = await refRepo.find({ where: { patientId }, relations: ['department'] });
        return res.json(items);
    }
    catch (e) {
        console.error('List referrals error:', e);
        return res.status(500).json({ message: 'Failed to list referrals' });
    }
};
// Doctor: create referral if doctor has access to the patient per FR-001
ReferralController.doctorCreateReferral = async (req, res) => {
    var _b;
    const doctorId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const { patientId } = req.params;
    const { departmentId } = req.body || {};
    if (!doctorId)
        return res.status(401).json({ message: 'Authentication required' });
    if (!patientId || !departmentId)
        return res.status(400).json({ message: 'patientId and departmentId are required' });
    try {
        const ok = await (0, access_middleware_1.canDoctorAccessPatient)(patientId, doctorId);
        if (!ok)
            return res.status(403).json({ message: 'Access denied by department policy (FR-001)' });
        const dept = await database_1.AppDataSource.getRepository(Department_1.Department).findOne({ where: { id: departmentId } });
        if (!dept)
            return res.status(404).json({ message: 'Department not found' });
        const refRepo = database_1.AppDataSource.getRepository(Referral_1.Referral);
        const existing = await refRepo.findOne({ where: { patientId, departmentId } });
        if (existing)
            return res.json(existing);
        const r = new Referral_1.Referral();
        r.patientId = patientId;
        r.departmentId = departmentId;
        const saved = await refRepo.save(r);
        return res.status(201).json(saved);
    }
    catch (e) {
        console.error('Doctor create referral error:', e);
        return res.status(500).json({ message: 'Failed to create referral' });
    }
};
// Doctor: list patient referrals if doctor has access per FR-001
ReferralController.doctorListReferrals = async (req, res) => {
    var _b;
    const doctorId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const { patientId } = req.params;
    if (!doctorId)
        return res.status(401).json({ message: 'Authentication required' });
    try {
        const ok = await (0, access_middleware_1.canDoctorAccessPatient)(patientId, doctorId);
        if (!ok)
            return res.status(403).json({ message: 'Access denied by department policy (FR-001)' });
        const refRepo = database_1.AppDataSource.getRepository(Referral_1.Referral);
        const items = await refRepo.find({ where: { patientId }, relations: ['department'] });
        return res.json(items);
    }
    catch (e) {
        console.error('Doctor list referrals error:', e);
        return res.status(500).json({ message: 'Failed to list referrals' });
    }
};
