"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientAccessService = void 0;
const database_1 = require("../config/database");
const PatientAccessRequest_1 = require("../models/PatientAccessRequest");
const PatientSharedAccess_1 = require("../models/PatientSharedAccess");
const PatientAccessAudit_1 = require("../models/PatientAccessAudit");
const User_1 = require("../models/User");
const typeorm_1 = require("typeorm");
class PatientAccessService {
    /**
     * Check if doctor has access to patient (direct or shared)
     */
    static async hasAccess(doctorId, patientId) {
        const sharedAccessRepo = database_1.AppDataSource.getRepository(PatientSharedAccess_1.PatientSharedAccess);
        const sharedAccess = await sharedAccessRepo.findOne({
            where: {
                doctorId,
                patientId,
                isActive: true,
                expiresAt: (0, typeorm_1.MoreThan)(new Date()),
            },
        });
        return !!sharedAccess;
    }
    /**
     * Search patient by ID (returns limited info)
     */
    static async searchPatient(patientId) {
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        // Search by globalPatientId (e.g., CHN-2025-00007) or by UUID
        const patient = await userRepo.findOne({
            where: [
                { globalPatientId: patientId, role: 'patient' },
                { id: patientId, role: 'patient' }
            ],
            select: ['id', 'firstName', 'lastName', 'registeredLocation', 'globalPatientId'],
        });
        if (!patient) {
            throw new Error('Patient not found');
        }
        return {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            location: patient.registeredLocation || 'Unknown',
            globalPatientId: patient.globalPatientId,
        };
    }
    /**
     * Create access request
     */
    static async createRequest(data) {
        const requestRepo = database_1.AppDataSource.getRepository(PatientAccessRequest_1.PatientAccessRequest);
        const auditRepo = database_1.AppDataSource.getRepository(PatientAccessAudit_1.PatientAccessAudit);
        // Check if pending request already exists
        const existingRequest = await requestRepo.findOne({
            where: {
                patientId: data.patientId,
                requestingDoctorId: data.requestingDoctorId,
                status: PatientAccessRequest_1.AccessRequestStatus.PENDING,
            },
        });
        if (existingRequest) {
            throw new Error('You already have a pending request for this patient');
        }
        // Create request
        const request = requestRepo.create({
            patientId: data.patientId,
            requestingDoctorId: data.requestingDoctorId,
            reason: data.reason,
            requestedDurationHours: data.durationHours,
            status: PatientAccessRequest_1.AccessRequestStatus.PENDING,
        });
        await requestRepo.save(request);
        // Log audit
        await auditRepo.save({
            patientId: data.patientId,
            doctorId: data.requestingDoctorId,
            action: PatientAccessAudit_1.AuditAction.REQUEST_CREATED,
            details: {
                requestId: request.id,
                reason: data.reason,
                durationHours: data.durationHours,
            },
        });
        return request;
    }
    /**
     * Get pending requests for patient
     */
    static async getPendingRequestsForPatient(patientId) {
        const requestRepo = database_1.AppDataSource.getRepository(PatientAccessRequest_1.PatientAccessRequest);
        return await requestRepo.find({
            where: {
                patientId,
                status: PatientAccessRequest_1.AccessRequestStatus.PENDING,
            },
            relations: ['requestingDoctor'],
            order: { createdAt: 'DESC' },
        });
    }
    /**
     * Approve access request (by patient)
     */
    static async approveRequest(requestId, patientId) {
        const requestRepo = database_1.AppDataSource.getRepository(PatientAccessRequest_1.PatientAccessRequest);
        const sharedAccessRepo = database_1.AppDataSource.getRepository(PatientSharedAccess_1.PatientSharedAccess);
        const auditRepo = database_1.AppDataSource.getRepository(PatientAccessAudit_1.PatientAccessAudit);
        const request = await requestRepo.findOne({
            where: { id: requestId, patientId },
        });
        if (!request) {
            throw new Error('Request not found');
        }
        if (request.status !== PatientAccessRequest_1.AccessRequestStatus.PENDING) {
            throw new Error('Request is not pending');
        }
        // Calculate expiry
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + request.requestedDurationHours);
        // Update request
        request.status = PatientAccessRequest_1.AccessRequestStatus.APPROVED;
        request.approvedByPatientAt = new Date();
        request.expiresAt = expiresAt;
        await requestRepo.save(request);
        // Create shared access
        const sharedAccess = sharedAccessRepo.create({
            patientId: request.patientId,
            doctorId: request.requestingDoctorId,
            accessRequestId: request.id,
            expiresAt,
            isActive: true,
        });
        await sharedAccessRepo.save(sharedAccess);
        // Log audit
        await auditRepo.save({
            patientId: request.patientId,
            doctorId: request.requestingDoctorId,
            action: PatientAccessAudit_1.AuditAction.REQUEST_APPROVED,
            details: {
                requestId: request.id,
                expiresAt,
            },
        });
        await auditRepo.save({
            patientId: request.patientId,
            doctorId: request.requestingDoctorId,
            action: PatientAccessAudit_1.AuditAction.ACCESS_GRANTED,
            details: {
                sharedAccessId: sharedAccess.id,
                expiresAt,
            },
        });
        return { request, sharedAccess };
    }
    /**
     * Reject access request (by patient)
     */
    static async rejectRequest(requestId, patientId, reason) {
        const requestRepo = database_1.AppDataSource.getRepository(PatientAccessRequest_1.PatientAccessRequest);
        const auditRepo = database_1.AppDataSource.getRepository(PatientAccessAudit_1.PatientAccessAudit);
        const request = await requestRepo.findOne({
            where: { id: requestId, patientId },
        });
        if (!request) {
            throw new Error('Request not found');
        }
        if (request.status !== PatientAccessRequest_1.AccessRequestStatus.PENDING) {
            throw new Error('Request is not pending');
        }
        // Update request
        request.status = PatientAccessRequest_1.AccessRequestStatus.REJECTED;
        request.rejectedAt = new Date();
        request.rejectionReason = reason;
        await requestRepo.save(request);
        // Log audit
        await auditRepo.save({
            patientId: request.patientId,
            doctorId: request.requestingDoctorId,
            action: PatientAccessAudit_1.AuditAction.REQUEST_REJECTED,
            details: {
                requestId: request.id,
                reason,
            },
        });
        return request;
    }
    /**
     * Get shared patients for doctor
     */
    static async getSharedPatientsForDoctor(doctorId) {
        const sharedAccessRepo = database_1.AppDataSource.getRepository(PatientSharedAccess_1.PatientSharedAccess);
        return await sharedAccessRepo.find({
            where: {
                doctorId,
                isActive: true,
                expiresAt: (0, typeorm_1.MoreThan)(new Date()),
            },
            relations: ['patient', 'accessRequest'],
            order: { expiresAt: 'ASC' },
        });
    }
    /**
     * Log access to patient record
     */
    static async logAccess(doctorId, patientId, action, details, ipAddress) {
        const auditRepo = database_1.AppDataSource.getRepository(PatientAccessAudit_1.PatientAccessAudit);
        await auditRepo.save({
            patientId,
            doctorId,
            action,
            details,
            ipAddress,
        });
    }
    /**
     * Expire old access grants (for cron job)
     */
    static async expireOldAccess() {
        const sharedAccessRepo = database_1.AppDataSource.getRepository(PatientSharedAccess_1.PatientSharedAccess);
        const auditRepo = database_1.AppDataSource.getRepository(PatientAccessAudit_1.PatientAccessAudit);
        const expiredAccess = await sharedAccessRepo.find({
            where: {
                isActive: true,
                expiresAt: (0, typeorm_1.MoreThan)(new Date()),
            },
        });
        for (const access of expiredAccess) {
            access.isActive = false;
            await sharedAccessRepo.save(access);
            await auditRepo.save({
                patientId: access.patientId,
                doctorId: access.doctorId,
                action: PatientAccessAudit_1.AuditAction.ACCESS_EXPIRED,
                details: {
                    sharedAccessId: access.id,
                },
            });
        }
        return expiredAccess.length;
    }
}
exports.PatientAccessService = PatientAccessService;
