"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAggregatedRecords = exports.downloadMedicalRecord = exports.deleteMedicalRecord = exports.updateMedicalRecord = exports.createMedicalRecord = exports.getMedicalRecord = exports.getMedicalRecords = exports.upload = void 0;
const database_1 = require("../config/database");
const MedicalRecord_1 = require("../models/MedicalRecord");
const User_1 = require("../models/User");
const Prescription_1 = require("../models/pharmacy/Prescription");
const LabOrder_1 = require("../models/LabOrder");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const medicalRecordRepo = database_1.AppDataSource.getRepository(MedicalRecord_1.MedicalRecord);
const userRepo = database_1.AppDataSource.getRepository(User_1.User);
const prescriptionRepo = database_1.AppDataSource.getRepository(Prescription_1.Prescription);
const labOrderRepo = database_1.AppDataSource.getRepository(LabOrder_1.LabOrder);
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/medical-records');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only images, PDFs, and Word documents are allowed'));
        }
    }
});
// Get all medical records for a patient
const getMedicalRecords = async (req, res) => {
    try {
        const { patientId, type, startDate, endDate, search, page = 1, limit = 10 } = req.query;
        const user = req.user;
        // Build query
        const queryBuilder = medicalRecordRepo
            .createQueryBuilder('record')
            .leftJoinAndSelect('record.patient', 'patient')
            .leftJoinAndSelect('record.doctor', 'doctor');
        // Filter by patient
        if (patientId) {
            queryBuilder.andWhere('record.patient_id = :patientId', { patientId });
        }
        else if (user.role === 'patient') {
            // If patient is logged in, show only their records
            queryBuilder.andWhere('record.patient_id = :userId', { userId: user.id });
        }
        // Filter by type
        if (type && type !== 'all') {
            queryBuilder.andWhere('record.type = :type', { type });
        }
        // Filter by date range
        if (startDate) {
            queryBuilder.andWhere('record.recordDate >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('record.recordDate <= :endDate', { endDate });
        }
        // Search
        if (search) {
            queryBuilder.andWhere('(record.title ILIKE :search OR record.description ILIKE :search OR record.diagnosis ILIKE :search)', { search: `%${search}%` });
        }
        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        queryBuilder.skip(skip).take(Number(limit));
        // Order by date
        queryBuilder.orderBy('record.recordDate', 'DESC');
        const [records, total] = await queryBuilder.getManyAndCount();
        return res.json({
            data: records,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error fetching medical records:', error);
        return res.status(500).json({ message: 'Failed to fetch medical records' });
    }
};
exports.getMedicalRecords = getMedicalRecords;
// Get single medical record
const getMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const record = await medicalRecordRepo.findOne({
            where: { id },
            relations: ['patient', 'doctor']
        });
        if (!record) {
            return res.status(404).json({ message: 'Medical record not found' });
        }
        // Check permissions
        if (user.role === 'patient' && record.patient.id !== user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        return res.json(record);
    }
    catch (error) {
        console.error('Error fetching medical record:', error);
        return res.status(500).json({ message: 'Failed to fetch medical record' });
    }
};
exports.getMedicalRecord = getMedicalRecord;
// Create medical record
const createMedicalRecord = async (req, res) => {
    try {
        const { patientId, doctorId, type, title, description, diagnosis, treatment, medications, recordDate } = req.body;
        const file = req.file;
        const user = req.user;
        // Validate patient exists
        const patient = await userRepo.findOne({ where: { id: patientId } });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        // Validate doctor if provided
        let doctor;
        if (doctorId) {
            doctor = await userRepo.findOne({ where: { id: doctorId } });
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }
        }
        else if (user.role === 'doctor') {
            doctor = user;
        }
        // Create record
        const record = medicalRecordRepo.create({
            patient,
            doctor,
            type: type || MedicalRecord_1.RecordType.CONSULTATION,
            title,
            description,
            diagnosis,
            treatment,
            medications,
            recordDate: recordDate || new Date(),
            fileUrl: file ? `/uploads/medical-records/${file.filename}` : undefined
        });
        await medicalRecordRepo.save(record);
        return res.status(201).json(record);
    }
    catch (error) {
        console.error('Error creating medical record:', error);
        return res.status(500).json({ message: 'Failed to create medical record' });
    }
};
exports.createMedicalRecord = createMedicalRecord;
// Update medical record
const updateMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, description, diagnosis, treatment, medications, recordDate } = req.body;
        const file = req.file;
        const record = await medicalRecordRepo.findOne({ where: { id } });
        if (!record) {
            return res.status(404).json({ message: 'Medical record not found' });
        }
        // Update fields
        if (type)
            record.type = type;
        if (title)
            record.title = title;
        if (description !== undefined)
            record.description = description;
        if (diagnosis !== undefined)
            record.diagnosis = diagnosis;
        if (treatment !== undefined)
            record.treatment = treatment;
        if (medications !== undefined)
            record.medications = medications;
        if (recordDate)
            record.recordDate = recordDate;
        if (file)
            record.fileUrl = `/uploads/medical-records/${file.filename}`;
        await medicalRecordRepo.save(record);
        return res.json(record);
    }
    catch (error) {
        console.error('Error updating medical record:', error);
        return res.status(500).json({ message: 'Failed to update medical record' });
    }
};
exports.updateMedicalRecord = updateMedicalRecord;
// Delete medical record
const deleteMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await medicalRecordRepo.findOne({ where: { id } });
        if (!record) {
            return res.status(404).json({ message: 'Medical record not found' });
        }
        // Delete file if exists
        if (record.fileUrl) {
            const filePath = path_1.default.join(__dirname, '../..', record.fileUrl);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        await medicalRecordRepo.remove(record);
        return res.json({ message: 'Medical record deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting medical record:', error);
        return res.status(500).json({ message: 'Failed to delete medical record' });
    }
};
exports.deleteMedicalRecord = deleteMedicalRecord;
// Download medical record file
const downloadMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const record = await medicalRecordRepo.findOne({
            where: { id },
            relations: ['patient']
        });
        if (!record) {
            return res.status(404).json({ message: 'Medical record not found' });
        }
        // Check permissions
        if (user.role === 'patient' && record.patient.id !== user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (!record.fileUrl) {
            return res.status(404).json({ message: 'No file attached to this record' });
        }
        const filePath = path_1.default.join(__dirname, '../..', record.fileUrl);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }
        return res.download(filePath);
    }
    catch (error) {
        console.error('Error downloading medical record:', error);
        return res.status(500).json({ message: 'Failed to download medical record' });
    }
};
exports.downloadMedicalRecord = downloadMedicalRecord;
// Get aggregated medical records (prescriptions + lab results + records)
const getAggregatedRecords = async (req, res) => {
    try {
        const { patientId } = req.query;
        const user = req.user;
        const targetPatientId = patientId || (user.role === 'patient' ? user.id : null);
        if (!targetPatientId) {
            return res.status(400).json({ message: 'Patient ID is required' });
        }
        // Get medical records
        const medicalRecords = await medicalRecordRepo.find({
            where: { patient: { id: targetPatientId } },
            relations: ['patient', 'doctor'],
            order: { recordDate: 'DESC' },
            take: 50
        });
        // Get prescriptions
        const prescriptions = await prescriptionRepo.find({
            where: { patient: { id: targetPatientId } },
            relations: ['patient', 'doctor'],
            order: { createdAt: 'DESC' },
            take: 50
        });
        // Get lab orders
        const labOrders = await labOrderRepo.find({
            where: { patient: { id: targetPatientId } },
            relations: ['patient', 'doctor', 'items'],
            order: { createdAt: 'DESC' },
            take: 50
        });
        // Combine and format
        const aggregated = [
            ...medicalRecords.map(r => ({
                id: r.id,
                type: r.type,
                title: r.title,
                date: r.recordDate,
                doctor: r.doctor ? `Dr. ${r.doctor.firstName} ${r.doctor.lastName}` : 'N/A',
                patient: r.patient ? `${r.patient.firstName} ${r.patient.lastName}` : 'N/A',
                hasFile: !!r.fileUrl,
                source: 'medical_record'
            })),
            ...prescriptions.map(p => ({
                id: p.id,
                type: 'prescription',
                title: 'Prescription',
                date: p.createdAt,
                doctor: p.doctor ? `Dr. ${p.doctor.firstName} ${p.doctor.lastName}` : 'N/A',
                patient: p.patient ? `${p.patient.firstName} ${p.patient.lastName}` : 'N/A',
                status: p.status,
                hasFile: false,
                source: 'prescription'
            })),
            ...labOrders.map(l => ({
                id: l.id,
                type: 'lab_report',
                title: `Lab Order ${l.orderNumber}`,
                date: l.createdAt,
                doctor: l.doctor ? `Dr. ${l.doctor.firstName} ${l.doctor.lastName}` : 'N/A',
                patient: l.patient ? `${l.patient.firstName} ${l.patient.lastName}` : 'N/A',
                hasFile: false,
                source: 'lab_order'
            }))
        ];
        // Sort by date
        aggregated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return res.json({ data: aggregated });
    }
    catch (error) {
        console.error('Error fetching aggregated records:', error);
        return res.status(500).json({ message: 'Failed to fetch aggregated records' });
    }
};
exports.getAggregatedRecords = getAggregatedRecords;
