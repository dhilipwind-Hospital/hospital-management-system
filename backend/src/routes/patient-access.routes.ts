import { Router, Request, Response } from 'express';
import { PatientAccessService } from '../services/PatientAccessService';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * Search patient by ID (limited info)
 * POST /api/patient-access/search
 */
router.post('/search', authenticate, async (req: Request, res: Response) => {
  try {
    const { patientId } = req.body;
    const user = (req as any).user;

    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    // Only doctors can search
    if (user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can search patients' });
    }

    const patient = await PatientAccessService.searchPatient(patientId);
    
    return res.json({
      success: true,
      patient,
    });
  } catch (error: any) {
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
router.post('/request', authenticate, async (req: Request, res: Response) => {
  try {
    const { patientId, reason, durationHours = 24 } = req.body;
    const user = (req as any).user;

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

    const request = await PatientAccessService.createRequest({
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
  } catch (error: any) {
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
router.get('/requests/pending', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Only patients can view their pending requests
    if (user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can view pending requests' });
    }

    const requests = await PatientAccessService.getPendingRequestsForPatient(user.id);

    return res.json({
      success: true,
      requests: requests.map(r => ({
        id: r.id,
        requestingDoctor: {
          id: r.requestingDoctor.id,
          firstName: r.requestingDoctor.firstName,
          lastName: r.requestingDoctor.lastName,
          specialization: (r.requestingDoctor as any).specialization,
        },
        reason: r.reason,
        requestedDurationHours: r.requestedDurationHours,
        createdAt: r.createdAt,
      })),
    });
  } catch (error: any) {
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
router.patch('/requests/:id/approve', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Only patients can approve requests
    if (user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can approve requests' });
    }

    const result = await PatientAccessService.approveRequest(id, user.id);

    return res.json({
      success: true,
      message: 'Access request approved successfully',
      expiresAt: result.sharedAccess.expiresAt,
    });
  } catch (error: any) {
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
router.patch('/requests/:id/reject', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = (req as any).user;

    // Only patients can reject requests
    if (user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can reject requests' });
    }

    await PatientAccessService.rejectRequest(id, user.id, reason);

    return res.json({
      success: true,
      message: 'Access request rejected',
    });
  } catch (error: any) {
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
router.get('/shared', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Only doctors can view shared patients
    if (user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can view shared patients' });
    }

    const sharedAccess = await PatientAccessService.getSharedPatientsForDoctor(user.id);

    return res.json({
      success: true,
      sharedPatients: sharedAccess.map(access => ({
        id: access.id,
        patient: {
          id: access.patient.id,
          firstName: access.patient.firstName,
          lastName: access.patient.lastName,
          location: (access.patient as any).registeredLocation,
          globalPatientId: (access.patient as any).globalPatientId,
          email: access.patient.email,
          phone: (access.patient as any).phone,
          dateOfBirth: (access.patient as any).dateOfBirth,
          gender: (access.patient as any).gender,
          bloodGroup: (access.patient as any).bloodGroup,
        },
        grantedAt: access.grantedAt,
        expiresAt: access.expiresAt,
        reason: access.accessRequest.reason,
      })),
    });
  } catch (error: any) {
    console.error('Get shared patients error:', error);
    return res.status(500).json({
      message: 'Failed to get shared patients',
    });
  }
});

/**
 * Doctor verifies OTP to gain access
 * POST /api/patient-access/requests/:id/verify-otp
 */
router.post('/requests/:id/verify-otp', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { otpCode } = req.body;
    const user = (req as any).user;

    // Only doctors can verify OTP
    if (user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can verify OTP' });
    }

    if (!otpCode) {
      return res.status(400).json({ message: 'OTP code is required' });
    }

    const result = await PatientAccessService.verifyOTPByDoctor(
      id,
      user.id,
      otpCode,
      req.ip || 'unknown'
    );

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.json({
      success: true,
      message: result.message,
      expiresAt: result.sharedAccess?.expiresAt,
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return res.status(400).json({
      message: error.message || 'Failed to verify OTP',
    });
  }
});

/**
 * Get doctor's pending requests (for OTP entry)
 * GET /api/patient-access/requests/my-pending
 */
router.get('/requests/my-pending', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can view their requests' });
    }

    const requests = await PatientAccessService.getPendingRequestsForDoctor(user.id);

    return res.json({
      success: true,
      requests,
    });
  } catch (error: any) {
    console.error('Get pending requests error:', error);
    return res.status(500).json({
      message: 'Failed to get pending requests',
    });
  }
});

export default router;
