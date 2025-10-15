"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VitalSignsController = void 0;
const database_1 = require("../config/database");
const VitalSigns_1 = require("../models/VitalSigns");
const User_1 = require("../models/User");
const ConsultationNote_1 = require("../models/ConsultationNote");
class VitalSignsController {
}
exports.VitalSignsController = VitalSignsController;
_a = VitalSignsController;
// Record vital signs
VitalSignsController.recordVitalSigns = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const { patientId, consultationId, systolicBp, diastolicBp, heartRate, respiratoryRate, temperature, temperatureUnit, oxygenSaturation, weight, weightUnit, height, heightUnit, painScale } = req.body;
        if (!patientId) {
            return res.status(400).json({ message: 'Patient ID is required' });
        }
        const vitalSignsRepo = database_1.AppDataSource.getRepository(VitalSigns_1.VitalSigns);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const patient = await userRepo.findOne({ where: { id: patientId } });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        const recordedBy = await userRepo.findOne({ where: { id: userId } });
        if (!recordedBy) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Calculate BMI if weight and height are provided
        let bmi;
        if (weight && height) {
            // Convert to metric if needed
            let weightKg = weight;
            let heightM = height / 100; // assuming height is in cm
            if (weightUnit === 'lbs') {
                weightKg = weight * 0.453592;
            }
            if (heightUnit === 'in') {
                heightM = (height * 2.54) / 100;
            }
            bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
        }
        const vitalSigns = vitalSignsRepo.create({
            patient,
            recordedBy,
            systolicBp,
            diastolicBp,
            heartRate,
            respiratoryRate,
            temperature,
            temperatureUnit,
            oxygenSaturation,
            weight,
            weightUnit,
            height,
            heightUnit,
            bmi,
            painScale
        });
        // Link to consultation if provided
        if (consultationId) {
            const consultationRepo = database_1.AppDataSource.getRepository(ConsultationNote_1.ConsultationNote);
            const consultation = await consultationRepo.findOne({ where: { id: consultationId } });
            if (consultation) {
                vitalSigns.consultation = consultation;
            }
        }
        await vitalSignsRepo.save(vitalSigns);
        return res.status(201).json({
            message: 'Vital signs recorded successfully',
            data: vitalSigns
        });
    }
    catch (error) {
        console.error('Error recording vital signs:', error);
        return res.status(500).json({ message: 'Error recording vital signs' });
    }
};
// Get vital signs by ID
VitalSignsController.getVitalSigns = async (req, res) => {
    try {
        const { id } = req.params;
        const vitalSignsRepo = database_1.AppDataSource.getRepository(VitalSigns_1.VitalSigns);
        const vitalSigns = await vitalSignsRepo.findOne({
            where: { id },
            relations: ['patient', 'recordedBy', 'consultation']
        });
        if (!vitalSigns) {
            return res.status(404).json({ message: 'Vital signs not found' });
        }
        return res.json({ data: vitalSigns });
    }
    catch (error) {
        console.error('Error fetching vital signs:', error);
        return res.status(500).json({ message: 'Error fetching vital signs' });
    }
};
// Get patient vital signs
VitalSignsController.getPatientVitalSigns = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        const vitalSignsRepo = database_1.AppDataSource.getRepository(VitalSigns_1.VitalSigns);
        const [vitalSigns, total] = await vitalSignsRepo.findAndCount({
            where: { patient: { id } },
            relations: ['recordedBy'],
            order: { recordedAt: 'DESC' },
            take: Number(limit),
            skip: Number(offset)
        });
        return res.json({
            data: vitalSigns,
            total,
            limit: Number(limit),
            offset: Number(offset)
        });
    }
    catch (error) {
        console.error('Error fetching patient vital signs:', error);
        return res.status(500).json({ message: 'Error fetching vital signs' });
    }
};
// Get vital signs trends
VitalSignsController.getVitalSignsTrends = async (req, res) => {
    try {
        const { id } = req.params;
        const { days = 30 } = req.query;
        const vitalSignsRepo = database_1.AppDataSource.getRepository(VitalSigns_1.VitalSigns);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));
        const vitalSigns = await vitalSignsRepo.createQueryBuilder('vs')
            .where('vs.patientId = :patientId', { patientId: id })
            .andWhere('vs.recordedAt >= :startDate', { startDate })
            .orderBy('vs.recordedAt', 'ASC')
            .getMany();
        // Calculate trends
        const trends = {
            bloodPressure: vitalSigns
                .filter(vs => vs.systolicBp && vs.diastolicBp)
                .map(vs => ({
                date: vs.recordedAt,
                systolic: vs.systolicBp,
                diastolic: vs.diastolicBp
            })),
            heartRate: vitalSigns
                .filter(vs => vs.heartRate)
                .map(vs => ({
                date: vs.recordedAt,
                value: vs.heartRate
            })),
            temperature: vitalSigns
                .filter(vs => vs.temperature)
                .map(vs => ({
                date: vs.recordedAt,
                value: vs.temperature,
                unit: vs.temperatureUnit
            })),
            weight: vitalSigns
                .filter(vs => vs.weight)
                .map(vs => ({
                date: vs.recordedAt,
                value: vs.weight,
                unit: vs.weightUnit,
                bmi: vs.bmi
            })),
            oxygenSaturation: vitalSigns
                .filter(vs => vs.oxygenSaturation)
                .map(vs => ({
                date: vs.recordedAt,
                value: vs.oxygenSaturation
            }))
        };
        // Calculate averages
        const averages = {
            systolicBp: trends.bloodPressure.length > 0
                ? Math.round(trends.bloodPressure.reduce((sum, item) => sum + (item.systolic || 0), 0) / trends.bloodPressure.length)
                : null,
            diastolicBp: trends.bloodPressure.length > 0
                ? Math.round(trends.bloodPressure.reduce((sum, item) => sum + (item.diastolic || 0), 0) / trends.bloodPressure.length)
                : null,
            heartRate: trends.heartRate.length > 0
                ? Math.round(trends.heartRate.reduce((sum, item) => sum + (item.value || 0), 0) / trends.heartRate.length)
                : null,
            temperature: trends.temperature.length > 0
                ? (trends.temperature.reduce((sum, item) => sum + (item.value || 0), 0) / trends.temperature.length).toFixed(1)
                : null,
            weight: trends.weight.length > 0
                ? (trends.weight.reduce((sum, item) => sum + (item.value || 0), 0) / trends.weight.length).toFixed(1)
                : null,
            oxygenSaturation: trends.oxygenSaturation.length > 0
                ? Math.round(trends.oxygenSaturation.reduce((sum, item) => sum + (item.value || 0), 0) / trends.oxygenSaturation.length)
                : null
        };
        return res.json({
            data: {
                trends,
                averages,
                period: {
                    days: Number(days),
                    startDate,
                    endDate: new Date()
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching vital signs trends:', error);
        return res.status(500).json({ message: 'Error fetching trends' });
    }
};
