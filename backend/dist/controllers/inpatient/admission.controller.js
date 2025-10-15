"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdmissionController = void 0;
const database_1 = require("../../config/database");
const Admission_1 = require("../../models/inpatient/Admission");
const Bed_1 = require("../../models/inpatient/Bed");
const User_1 = require("../../models/User");
class AdmissionController {
    // Generate unique admission number
    static async generateAdmissionNumber() {
        const year = new Date().getFullYear();
        const admissionRepository = database_1.AppDataSource.getRepository(Admission_1.Admission);
        // Get count of admissions this year
        const count = await admissionRepository
            .createQueryBuilder('admission')
            .where('EXTRACT(YEAR FROM admission.createdAt) = :year', { year })
            .getCount();
        const sequence = (count + 1).toString().padStart(4, '0');
        return `ADM-${year}-${sequence}`;
    }
}
exports.AdmissionController = AdmissionController;
_a = AdmissionController;
// Create new admission
AdmissionController.createAdmission = async (req, res) => {
    try {
        const { patientId, admittingDoctorId, bedId, admissionReason, admissionDiagnosis, allergies, specialInstructions, isEmergency } = req.body;
        // Validate required fields
        if (!patientId || !admittingDoctorId || !bedId || !admissionReason) {
            return res.status(400).json({
                success: false,
                message: 'Patient, doctor, bed, and admission reason are required'
            });
        }
        const admissionRepository = database_1.AppDataSource.getRepository(Admission_1.Admission);
        const bedRepository = database_1.AppDataSource.getRepository(Bed_1.Bed);
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Verify patient exists
        const patient = await userRepository.findOne({
            where: { id: patientId, role: 'patient' }
        });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }
        // Verify doctor exists
        const doctor = await userRepository.findOne({
            where: { id: admittingDoctorId, role: 'doctor' }
        });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        // Verify bed exists and is available
        const bed = await bedRepository.findOne({
            where: { id: bedId },
            relations: ['currentAdmission']
        });
        if (!bed) {
            return res.status(404).json({
                success: false,
                message: 'Bed not found'
            });
        }
        if (bed.status !== Bed_1.BedStatus.AVAILABLE || bed.currentAdmission) {
            return res.status(400).json({
                success: false,
                message: 'Bed is not available'
            });
        }
        // Generate admission number
        const admissionNumber = await _a.generateAdmissionNumber();
        // Create admission
        const admission = admissionRepository.create({
            admissionNumber,
            patientId,
            admittingDoctorId,
            bedId,
            admissionDateTime: new Date(),
            admissionReason,
            admissionDiagnosis,
            allergies,
            specialInstructions,
            isEmergency: isEmergency || false,
            status: Admission_1.AdmissionStatus.ADMITTED
        });
        await admissionRepository.save(admission);
        // Update bed status
        bed.status = Bed_1.BedStatus.OCCUPIED;
        await bedRepository.save(bed);
        // Send admission notification email
        try {
            const { EmailService } = await Promise.resolve().then(() => __importStar(require('../../services/email.service')));
            EmailService.sendNotificationEmail(patient.email, 'Hospital Admission Confirmation', `You have been admitted to the hospital. Admission Number: ${admissionNumber}. Your assigned bed is ${bed.bedNumber}.`, 'info').catch(err => console.error('Failed to send admission email:', err));
        }
        catch (emailError) {
            console.error('Email service error:', emailError);
        }
        // Fetch complete admission with relations
        const savedAdmission = await admissionRepository.findOne({
            where: { id: admission.id },
            relations: ['patient', 'admittingDoctor', 'bed', 'bed.room', 'bed.room.ward']
        });
        return res.status(201).json({
            success: true,
            message: 'Patient admitted successfully',
            admission: savedAdmission
        });
    }
    catch (error) {
        console.error('Error creating admission:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create admission'
        });
    }
};
// Get all admissions
AdmissionController.getAllAdmissions = async (req, res) => {
    try {
        const { status } = req.query;
        const admissionRepository = database_1.AppDataSource.getRepository(Admission_1.Admission);
        const queryBuilder = admissionRepository
            .createQueryBuilder('admission')
            .leftJoinAndSelect('admission.patient', 'patient')
            .leftJoinAndSelect('admission.admittingDoctor', 'doctor')
            .leftJoinAndSelect('admission.bed', 'bed')
            .leftJoinAndSelect('bed.room', 'room')
            .leftJoinAndSelect('room.ward', 'ward')
            .orderBy('admission.admissionDateTime', 'DESC');
        if (status) {
            queryBuilder.where('admission.status = :status', { status });
        }
        const admissions = await queryBuilder.getMany();
        return res.json({
            success: true,
            admissions
        });
    }
    catch (error) {
        console.error('Error fetching admissions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch admissions'
        });
    }
};
// Get current admissions (active patients)
AdmissionController.getCurrentAdmissions = async (req, res) => {
    try {
        const admissionRepository = database_1.AppDataSource.getRepository(Admission_1.Admission);
        const admissions = await admissionRepository.find({
            where: { status: Admission_1.AdmissionStatus.ADMITTED },
            relations: ['patient', 'admittingDoctor', 'bed', 'bed.room', 'bed.room.ward'],
            order: { admissionDateTime: 'DESC' }
        });
        return res.json({
            success: true,
            admissions
        });
    }
    catch (error) {
        console.error('Error fetching current admissions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch current admissions'
        });
    }
};
// Get admission by ID
AdmissionController.getAdmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const admissionRepository = database_1.AppDataSource.getRepository(Admission_1.Admission);
        const admission = await admissionRepository.findOne({
            where: { id },
            relations: [
                'patient',
                'admittingDoctor',
                'bed',
                'bed.room',
                'bed.room.ward',
                'nursingNotes',
                'doctorNotes',
                'vitalSigns',
                'medications',
                'dischargeSummary'
            ]
        });
        if (!admission) {
            return res.status(404).json({
                success: false,
                message: 'Admission not found'
            });
        }
        return res.json({
            success: true,
            admission
        });
    }
    catch (error) {
        console.error('Error fetching admission:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch admission'
        });
    }
};
// Get patient admissions
AdmissionController.getPatientAdmissions = async (req, res) => {
    try {
        const { patientId } = req.params;
        const admissionRepository = database_1.AppDataSource.getRepository(Admission_1.Admission);
        const admissions = await admissionRepository.find({
            where: { patientId },
            relations: ['admittingDoctor', 'bed', 'bed.room', 'bed.room.ward'],
            order: { admissionDateTime: 'DESC' }
        });
        return res.json({
            success: true,
            admissions
        });
    }
    catch (error) {
        console.error('Error fetching patient admissions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch patient admissions'
        });
    }
};
// Get doctor's patients
AdmissionController.getDoctorPatients = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const admissionRepository = database_1.AppDataSource.getRepository(Admission_1.Admission);
        const admissions = await admissionRepository.find({
            where: {
                admittingDoctorId: doctorId,
                status: Admission_1.AdmissionStatus.ADMITTED
            },
            relations: ['patient', 'bed', 'bed.room', 'bed.room.ward'],
            order: { admissionDateTime: 'DESC' }
        });
        return res.json({
            success: true,
            admissions
        });
    }
    catch (error) {
        console.error('Error fetching doctor patients:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch doctor patients'
        });
    }
};
// Transfer patient to different bed
AdmissionController.transferPatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { newBedId, reason } = req.body;
        if (!newBedId) {
            return res.status(400).json({
                success: false,
                message: 'New bed ID is required'
            });
        }
        const admissionRepository = database_1.AppDataSource.getRepository(Admission_1.Admission);
        const bedRepository = database_1.AppDataSource.getRepository(Bed_1.Bed);
        // Get current admission
        const admission = await admissionRepository.findOne({
            where: { id },
            relations: ['bed']
        });
        if (!admission) {
            return res.status(404).json({
                success: false,
                message: 'Admission not found'
            });
        }
        // Verify new bed is available
        const newBed = await bedRepository.findOne({
            where: { id: newBedId },
            relations: ['currentAdmission']
        });
        if (!newBed) {
            return res.status(404).json({
                success: false,
                message: 'New bed not found'
            });
        }
        if (newBed.status !== Bed_1.BedStatus.AVAILABLE || newBed.currentAdmission) {
            return res.status(400).json({
                success: false,
                message: 'New bed is not available'
            });
        }
        // Free old bed
        const oldBed = admission.bed;
        oldBed.status = Bed_1.BedStatus.AVAILABLE;
        await bedRepository.save(oldBed);
        // Assign new bed
        admission.bedId = newBedId;
        newBed.status = Bed_1.BedStatus.OCCUPIED;
        await bedRepository.save(newBed);
        await admissionRepository.save(admission);
        return res.json({
            success: true,
            message: 'Patient transferred successfully',
            admission
        });
    }
    catch (error) {
        console.error('Error transferring patient:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to transfer patient'
        });
    }
};
// Discharge patient
AdmissionController.dischargePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const admissionRepository = database_1.AppDataSource.getRepository(Admission_1.Admission);
        const bedRepository = database_1.AppDataSource.getRepository(Bed_1.Bed);
        const admission = await admissionRepository.findOne({
            where: { id },
            relations: ['bed', 'patient', 'dischargeSummary']
        });
        if (!admission) {
            return res.status(404).json({
                success: false,
                message: 'Admission not found'
            });
        }
        if (admission.status === Admission_1.AdmissionStatus.DISCHARGED) {
            return res.status(400).json({
                success: false,
                message: 'Patient already discharged'
            });
        }
        // Check if discharge summary exists
        if (!admission.dischargeSummary) {
            return res.status(400).json({
                success: false,
                message: 'Discharge summary required before discharge'
            });
        }
        // Update admission
        admission.status = Admission_1.AdmissionStatus.DISCHARGED;
        admission.dischargeDateTime = new Date();
        await admissionRepository.save(admission);
        // Free bed
        const bed = admission.bed;
        bed.status = Bed_1.BedStatus.CLEANING;
        await bedRepository.save(bed);
        return res.json({
            success: true,
            message: 'Patient discharged successfully',
            admission
        });
    }
    catch (error) {
        console.error('Error discharging patient:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to discharge patient'
        });
    }
};
