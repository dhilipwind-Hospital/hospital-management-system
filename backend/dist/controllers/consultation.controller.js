"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultationController = void 0;
const database_1 = require("../config/database");
const ConsultationNote_1 = require("../models/ConsultationNote");
const Appointment_1 = require("../models/Appointment");
const User_1 = require("../models/User");
class ConsultationController {
}
exports.ConsultationController = ConsultationController;
_a = ConsultationController;
// Create consultation note
ConsultationController.createConsultation = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const { appointmentId, patientId, chiefComplaint, historyPresentIllness, pastMedicalHistory, currentMedications, physicalExamination, assessment, plan, doctorNotes, followUpDate, followUpInstructions } = req.body;
        if (!appointmentId || !patientId) {
            return res.status(400).json({ message: 'Appointment ID and Patient ID are required' });
        }
        const consultationRepo = database_1.AppDataSource.getRepository(ConsultationNote_1.ConsultationNote);
        const appointmentRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        // Verify appointment exists
        const appointment = await appointmentRepo.findOne({ where: { id: appointmentId } });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        // Verify patient exists
        const patient = await userRepo.findOne({ where: { id: patientId } });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        // Get doctor
        const doctor = await userRepo.findOne({ where: { id: userId } });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        const consultation = consultationRepo.create({
            appointment,
            patient,
            doctor,
            chiefComplaint,
            historyPresentIllness,
            pastMedicalHistory,
            currentMedications,
            physicalExamination,
            assessment,
            plan,
            doctorNotes,
            followUpDate: followUpDate ? new Date(followUpDate) : undefined,
            followUpInstructions
        });
        await consultationRepo.save(consultation);
        return res.status(201).json({
            message: 'Consultation note created successfully',
            data: consultation
        });
    }
    catch (error) {
        console.error('Error creating consultation:', error);
        return res.status(500).json({ message: 'Error creating consultation note' });
    }
};
// Get consultation by ID
ConsultationController.getConsultation = async (req, res) => {
    var _b, _c;
    try {
        const { id } = req.params;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const userRole = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
        const consultationRepo = database_1.AppDataSource.getRepository(ConsultationNote_1.ConsultationNote);
        const consultation = await consultationRepo.findOne({
            where: { id },
            relations: ['appointment', 'patient', 'doctor', 'signedBy']
        });
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }
        // Check authorization
        const isDoctor = consultation.doctor.id === userId;
        const isPatient = consultation.patient.id === userId;
        const isAdmin = ['admin', 'super_admin'].includes(userRole);
        if (!isDoctor && !isPatient && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this consultation' });
        }
        return res.json({ data: consultation });
    }
    catch (error) {
        console.error('Error fetching consultation:', error);
        return res.status(500).json({ message: 'Error fetching consultation' });
    }
};
// Update consultation note
ConsultationController.updateConsultation = async (req, res) => {
    var _b;
    try {
        const { id } = req.params;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const updateData = req.body;
        const consultationRepo = database_1.AppDataSource.getRepository(ConsultationNote_1.ConsultationNote);
        const consultation = await consultationRepo.findOne({
            where: { id },
            relations: ['doctor']
        });
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }
        // Only the doctor who created it can update
        if (consultation.doctor.id !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this consultation' });
        }
        // Cannot update if already signed
        if (consultation.isSigned) {
            return res.status(400).json({ message: 'Cannot update signed consultation note' });
        }
        // Update fields
        Object.assign(consultation, updateData);
        await consultationRepo.save(consultation);
        return res.json({
            message: 'Consultation note updated successfully',
            data: consultation
        });
    }
    catch (error) {
        console.error('Error updating consultation:', error);
        return res.status(500).json({ message: 'Error updating consultation note' });
    }
};
// Get patient consultations
ConsultationController.getPatientConsultations = async (req, res) => {
    var _b, _c;
    try {
        const { id } = req.params;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const userRole = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
        // Check authorization
        const isPatient = id === userId;
        const isDoctor = userRole === 'doctor';
        const isAdmin = ['admin', 'super_admin'].includes(userRole);
        if (!isPatient && !isDoctor && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const consultationRepo = database_1.AppDataSource.getRepository(ConsultationNote_1.ConsultationNote);
        const consultations = await consultationRepo.find({
            where: { patient: { id } },
            relations: ['appointment', 'doctor', 'signedBy'],
            order: { createdAt: 'DESC' }
        });
        return res.json({
            data: consultations,
            total: consultations.length
        });
    }
    catch (error) {
        console.error('Error fetching patient consultations:', error);
        return res.status(500).json({ message: 'Error fetching consultations' });
    }
};
// Sign consultation note
ConsultationController.signConsultation = async (req, res) => {
    var _b;
    try {
        const { id } = req.params;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const consultationRepo = database_1.AppDataSource.getRepository(ConsultationNote_1.ConsultationNote);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const consultation = await consultationRepo.findOne({
            where: { id },
            relations: ['doctor']
        });
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }
        // Only the doctor who created it can sign
        if (consultation.doctor.id !== userId) {
            return res.status(403).json({ message: 'Not authorized to sign this consultation' });
        }
        // Already signed
        if (consultation.isSigned) {
            return res.status(400).json({ message: 'Consultation already signed' });
        }
        const doctor = await userRepo.findOne({ where: { id: userId } });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        consultation.isSigned = true;
        consultation.signedAt = new Date();
        consultation.signedBy = doctor;
        await consultationRepo.save(consultation);
        return res.json({
            message: 'Consultation note signed successfully',
            data: consultation
        });
    }
    catch (error) {
        console.error('Error signing consultation:', error);
        return res.status(500).json({ message: 'Error signing consultation note' });
    }
};
// Get consultation PDF (placeholder)
ConsultationController.getConsultationPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const consultationRepo = database_1.AppDataSource.getRepository(ConsultationNote_1.ConsultationNote);
        const consultation = await consultationRepo.findOne({
            where: { id },
            relations: ['appointment', 'patient', 'doctor', 'signedBy']
        });
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }
        // TODO: Implement PDF generation
        return res.json({
            message: 'PDF generation not yet implemented',
            data: consultation
        });
    }
    catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({ message: 'Error generating PDF' });
    }
};
