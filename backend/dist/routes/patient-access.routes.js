"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PatientAccessService_1 = require("../services/PatientAccessService");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * Search patient by ID (limited info)
 * POST /api/patient-access/search
 */
router.post('/search', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { patientId } = req.body;
        const user = req.user;
        if (!patientId) {
            return res.status(400).json({ message: 'Patient ID is required' });
        }
        // Only doctors can search
        if (user.role !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can search patients' });
        }
        const patient = await PatientAccessService_1.PatientAccessService.searchPatient(patientId);
        return res.json({
            success: true,
            patient,
        });
    }
    catch (error) {
        console.error('Search patient error:', error);
        return res.status(error.message === 'Patient not found' ? 404 : 500).json({
            message: error.message || 'Failed to search patient',
        });
    }
});
/**
 * Create access request
 * POST /api/patient-access/request
 */
router.post('/request', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { patientId, reason, durationHours = 24 } = req.body;
        const user = req.user;
        if (!patientId || !reason) {
            return res.status(400).json({ message: 'Patient ID and reason are required' });
        }
        // Only doctors can request access
        if (user.role !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can request access' });
        }
        // Validate duration (max 7 days)
        if (durationHours > 168) {
            return res.status(400).json({ message: 'Maximum duration is 7 days (168 hours)' });
        }
        const request = await PatientAccessService_1.PatientAccessService.createRequest({
            patientId,
            requestingDoctorId: user.id,
            reason,
            durationHours,
        });
        return res.status(201).json({
            success: true,
            message: 'Access request created successfully',
            request: {
                id: request.id,
                status: request.status,
                createdAt: request.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Create request error:', error);
        return res.status(400).json({
            message: error.message || 'Failed to create access request',
        });
    }
});
/**
 * Get pending requests for patient
 * GET /api/patient-access/requests/pending
 */
router.get('/requests/pending', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        // Only patients can view their pending requests
        if (user.role !== 'patient') {
            return res.status(403).json({ message: 'Only patients can view pending requests' });
        }
        const requests = await PatientAccessService_1.PatientAccessService.getPendingRequestsForPatient(user.id);
        return res.json({
            success: true,
            requests: requests.map(r => ({
                id: r.id,
                requestingDoctor: {
                    id: r.requestingDoctor.id,
                    firstName: r.requestingDoctor.firstName,
                    lastName: r.requestingDoctor.lastName,
                    specialization: r.requestingDoctor.specialization,
                },
                reason: r.reason,
                requestedDurationHours: r.requestedDurationHours,
                createdAt: r.createdAt,
            })),
        });
    }
    catch (error) {
        console.error('Get pending requests error:', error);
        return res.status(500).json({
            message: 'Failed to get pending requests',
        });
    }
});
/**
 * Approve access request
 * PATCH /api/patient-access/requests/:id/approve
 */
router.patch('/requests/:id/approve', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        // Only patients can approve requests
        if (user.role !== 'patient') {
            return res.status(403).json({ message: 'Only patients can approve requests' });
        }
        const result = await PatientAccessService_1.PatientAccessService.approveRequest(id, user.id);
        return res.json({
            success: true,
            message: 'Access request approved successfully',
            expiresAt: result.sharedAccess.expiresAt,
        });
    }
    catch (error) {
        console.error('Approve request error:', error);
        return res.status(400).json({
            message: error.message || 'Failed to approve request',
        });
    }
});
/**
 * Reject access request
 * PATCH /api/patient-access/requests/:id/reject
 */
router.patch('/requests/:id/reject', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const user = req.user;
        // Only patients can reject requests
        if (user.role !== 'patient') {
            return res.status(403).json({ message: 'Only patients can reject requests' });
        }
        await PatientAccessService_1.PatientAccessService.rejectRequest(id, user.id, reason);
        return res.json({
            success: true,
            message: 'Access request rejected',
        });
    }
    catch (error) {
        console.error('Reject request error:', error);
        return res.status(400).json({
            message: error.message || 'Failed to reject request',
        });
    }
});
/**
 * Get shared patients for doctor
 * GET /api/patient-access/shared
 */
router.get('/shared', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        // Only doctors can view shared patients
        if (user.role !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can view shared patients' });
        }
        const sharedAccess = await PatientAccessService_1.PatientAccessService.getSharedPatientsForDoctor(user.id);
        return res.json({
            success: true,
            sharedPatients: sharedAccess.map(access => ({
                id: access.id,
                patient: {
                    id: access.patient.id,
                    firstName: access.patient.firstName,
                    lastName: access.patient.lastName,
                    location: access.patient.registeredLocation,
                },
                grantedAt: access.grantedAt,
                expiresAt: access.expiresAt,
                reason: access.accessRequest.reason,
            })),
        });
    }
    catch (error) {
        console.error('Get shared patients error:', error);
        return res.status(500).json({
            message: 'Failed to get shared patients',
        });
    }
});
exports.default = router;
