import { AppDataSource } from '../config/database';
import { PatientAccessRequest, AccessRequestStatus } from '../models/PatientAccessRequest';
import { PatientSharedAccess } from '../models/PatientSharedAccess';
import { PatientAccessAudit, AuditAction } from '../models/PatientAccessAudit';
import { User } from '../models/User';
import { Department } from '../models/Department';
import { MoreThan } from 'typeorm';
import { EmailService } from './email.service';
import { OTPService } from './OTPService';

export class PatientAccessService {
  /**
   * Check if doctor has access to patient (direct or shared)
   */
  static async hasAccess(doctorId: string, patientId: string): Promise<boolean> {
    const sharedAccessRepo = AppDataSource.getRepository(PatientSharedAccess);
    
    const sharedAccess = await sharedAccessRepo.findOne({
      where: {
        doctorId,
        patientId,
        isActive: true,
        expiresAt: MoreThan(new Date()),
      },
    });

    return !!sharedAccess;
  }

  /**
   * Search patient by ID (returns limited info)
   */
  static async searchPatient(patientId: string) {
    const userRepo = AppDataSource.getRepository(User);
    
    // First try to search by globalPatientId
    let patient = await userRepo.findOne({
      where: { globalPatientId: patientId, role: 'patient' as any },
      select: ['id', 'firstName', 'lastName', 'registeredLocation', 'globalPatientId'],
    });

    // If not found and patientId looks like a UUID, try searching by id
    if (!patient && patientId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      patient = await userRepo.findOne({
        where: { id: patientId, role: 'patient' as any },
        select: ['id', 'firstName', 'lastName', 'registeredLocation', 'globalPatientId'],
      });
    }

    if (!patient) {
      throw new Error('Patient not found');
    }

    return {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      location: (patient as any).registeredLocation || 'Unknown',
      globalPatientId: (patient as any).globalPatientId,
    };
  }

  /**
   * Create access request
   */
  static async createRequest(data: {
    patientId: string;
    requestingDoctorId: string;
    reason: string;
    durationHours: number;
  }) {
    const requestRepo = AppDataSource.getRepository(PatientAccessRequest);
    const auditRepo = AppDataSource.getRepository(PatientAccessAudit);

    // Check if pending request already exists
    const existingRequest = await requestRepo.findOne({
      where: {
        patientId: data.patientId,
        requestingDoctorId: data.requestingDoctorId,
        status: AccessRequestStatus.PENDING,
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
      status: AccessRequestStatus.PENDING,
    });

    await requestRepo.save(request);

    // Log audit
    await auditRepo.save({
      patientId: data.patientId,
      doctorId: data.requestingDoctorId,
      action: AuditAction.REQUEST_CREATED,
      details: {
        requestId: request.id,
        reason: data.reason,
        durationHours: data.durationHours,
      },
    });

    // Generate OTP for this request
    let otpCode: string | undefined;
    try {
      otpCode = await OTPService.createOTP(request.id);
      console.log(`✅ OTP generated for request ${request.id}: ${otpCode}`);
    } catch (otpError) {
      console.error('❌ Failed to generate OTP:', otpError);
      // Continue without OTP
    }

    // Send email notification to patient with OTP
    try {
      const userRepo = AppDataSource.getRepository(User);
      const patient = await userRepo.findOne({ where: { id: data.patientId } });
      const doctor = await userRepo.findOne({
        where: { id: data.requestingDoctorId },
        relations: ['primaryDepartment']
      });

      if (patient && patient.email && doctor && otpCode) {
        const doctorName = `${doctor.firstName} ${doctor.lastName}`;
        const patientName = `${patient.firstName} ${patient.lastName}`;
        const departmentName = (doctor as any).primaryDepartment?.name || 'General Medicine';

        await EmailService.sendAccessRequestWithOTP(
          patient.email,
          patientName,
          doctorName,
          departmentName,
          data.reason,
          data.durationHours,
          otpCode,
          request.id
        );
        console.log(`✅ Access request email with OTP sent to patient: ${patient.email}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send access request email:', emailError);
      // Don't fail the request creation if email fails
    }

    return request;
  }

  /**
   * Doctor verifies OTP to gain access
   */
  static async verifyOTPByDoctor(
    requestId: string,
    doctorId: string,
    otpCode: string,
    ipAddress: string
  ): Promise<{ success: boolean; message: string; sharedAccess?: PatientSharedAccess }> {
    console.log(`🔍 Verifying OTP for request ${requestId} by doctor ${doctorId}`);
    console.log(`📝 OTP Code: ${otpCode}`);
    
    const requestRepo = AppDataSource.getRepository(PatientAccessRequest);
    const auditRepo = AppDataSource.getRepository(PatientAccessAudit);

    // Get the request
    const request = await requestRepo.findOne({
      where: { id: requestId, requestingDoctorId: doctorId, status: AccessRequestStatus.PENDING },
      relations: ['patient', 'requestingDoctor'],
    });

    console.log(`📋 Request found:`, request ? 'YES' : 'NO');
    if (request) {
      console.log(`   - Status: ${request.status}`);
      console.log(`   - Requesting Doctor ID: ${request.requestingDoctorId}`);
      console.log(`   - Current Doctor ID: ${doctorId}`);
    }

    if (!request) {
      console.log(`❌ Request not found or already processed`);
      return { success: false, message: 'Access request not found or already processed' };
    }

    // Verify OTP
    const otpVerification = await OTPService.verifyOTP(requestId, otpCode);

    if (!otpVerification.valid) {
      // Log failed attempt
      await auditRepo.save({
        patientId: request.patientId,
        doctorId,
        action: AuditAction.REQUEST_REJECTED,
        details: {
          requestId,
          reason: `OTP verification failed: ${otpVerification.message}`,
          enteredBy: 'doctor',
          ipAddress,
        },
      });

      return { success: false, message: otpVerification.message };
    }

    // Mark OTP as used
    await OTPService.markOTPAsUsed(requestId, otpCode);

    // Update request status
    request.status = AccessRequestStatus.APPROVED;
    request.approvedByPatientAt = new Date(); // Patient implicitly approved by sharing OTP
    request.expiresAt = new Date(Date.now() + request.requestedDurationHours * 60 * 60 * 1000);
    await requestRepo.save(request);

    // Update OTP verification fields
    await AppDataSource.query(
      `UPDATE patient_access_requests 
       SET otp_verified = true, otp_verified_at = NOW() 
       WHERE id = $1`,
      [requestId]
    );

    // Create shared access
    const sharedAccessRepo = AppDataSource.getRepository(PatientSharedAccess);
    const sharedAccess = sharedAccessRepo.create({
      patientId: request.patientId,
      doctorId: request.requestingDoctorId,
      accessRequestId: request.id,
      expiresAt: request.expiresAt,
      isActive: true,
    });
    await sharedAccessRepo.save(sharedAccess);

    // Send confirmation emails
    try {
      const patientName = `${request.patient.firstName} ${request.patient.lastName}`;
      const doctorName = `Dr. ${request.requestingDoctor.firstName} ${request.requestingDoctor.lastName}`;

      // Email to patient
      await EmailService.sendEmail({
        to: request.patient.email,
        subject: '✅ Medical Record Access Granted',
        html: `
          <h2>Access Granted</h2>
          <p>Hello ${patientName},</p>
          <p>Access has been granted to <strong>${doctorName}</strong>.</p>
          <p><strong>Access expires:</strong> ${sharedAccess.expiresAt.toLocaleString()}</p>
          <p>The doctor now has read-only access to your medical records.</p>
        `,
      });

      // Email to doctor
      await EmailService.sendAccessApprovedNotificationEmail(
        request.requestingDoctor.email,
        doctorName,
        patientName,
        sharedAccess.expiresAt
      );
    } catch (emailError) {
      console.error('❌ Failed to send confirmation emails:', emailError);
    }

    // Log success
    await auditRepo.save({
      patientId: request.patientId,
      doctorId,
      action: AuditAction.REQUEST_APPROVED,
      details: {
        requestId,
        otpVerified: true,
        enteredBy: 'doctor',
        ipAddress,
      },
    });

    console.log(`✅ Access granted via OTP for request ${requestId}`);
    return {
      success: true,
      message: 'Access granted successfully',
      sharedAccess,
    };
  }

  /**
   * Get pending requests for doctor (for OTP entry)
   */
  static async getPendingRequestsForDoctor(doctorId: string) {
    const requestRepo = AppDataSource.getRepository(PatientAccessRequest);

    return await requestRepo.find({
      where: {
        requestingDoctorId: doctorId,
        status: AccessRequestStatus.PENDING,
      },
      relations: ['patient'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get pending requests for patient
   */
  static async getPendingRequestsForPatient(patientId: string) {
    const requestRepo = AppDataSource.getRepository(PatientAccessRequest);

    return await requestRepo.find({
      where: {
        patientId,
        status: AccessRequestStatus.PENDING,
      },
      relations: ['requestingDoctor'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Approve access request (by patient)
   */
  static async approveRequest(requestId: string, patientId: string) {
    const requestRepo = AppDataSource.getRepository(PatientAccessRequest);
    const sharedAccessRepo = AppDataSource.getRepository(PatientSharedAccess);
    const auditRepo = AppDataSource.getRepository(PatientAccessAudit);

    const request = await requestRepo.findOne({
      where: { id: requestId, patientId },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== AccessRequestStatus.PENDING) {
      throw new Error('Request is not pending');
    }

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + request.requestedDurationHours);

    // Update request
    request.status = AccessRequestStatus.APPROVED;
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
      action: AuditAction.REQUEST_APPROVED,
      details: {
        requestId: request.id,
        expiresAt,
      },
    });

    await auditRepo.save({
      patientId: request.patientId,
      doctorId: request.requestingDoctorId,
      action: AuditAction.ACCESS_GRANTED,
      details: {
        sharedAccessId: sharedAccess.id,
        expiresAt,
      },
    });

    // Send email notification to doctor
    try {
      const userRepo = AppDataSource.getRepository(User);
      const doctor = await userRepo.findOne({ where: { id: request.requestingDoctorId } });
      const patient = await userRepo.findOne({ where: { id: request.patientId } });

      if (doctor && doctor.email && patient) {
        const doctorName = `${doctor.firstName} ${doctor.lastName}`;
        const patientName = `${patient.firstName} ${patient.lastName}`;

        await EmailService.sendAccessApprovedNotificationEmail(
          doctor.email,
          doctorName,
          patientName,
          expiresAt
        );
        console.log(`✅ Access approved email sent to doctor: ${doctor.email}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send access approved email:', emailError);
    }

    return { request, sharedAccess };
  }

  /**
   * Reject access request (by patient)
   */
  static async rejectRequest(requestId: string, patientId: string, reason?: string) {
    const requestRepo = AppDataSource.getRepository(PatientAccessRequest);
    const auditRepo = AppDataSource.getRepository(PatientAccessAudit);

    const request = await requestRepo.findOne({
      where: { id: requestId, patientId },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== AccessRequestStatus.PENDING) {
      throw new Error('Request is not pending');
    }

    // Update request
    request.status = AccessRequestStatus.REJECTED;
    request.rejectedAt = new Date();
    request.rejectionReason = reason;
    await requestRepo.save(request);

    // Log audit
    await auditRepo.save({
      patientId: request.patientId,
      doctorId: request.requestingDoctorId,
      action: AuditAction.REQUEST_REJECTED,
      details: {
        requestId: request.id,
        reason,
      },
    });

    // Send email notification to doctor
    try {
      const userRepo = AppDataSource.getRepository(User);
      const doctor = await userRepo.findOne({ where: { id: request.requestingDoctorId } });
      const patient = await userRepo.findOne({ where: { id: request.patientId } });

      if (doctor && doctor.email && patient) {
        const doctorName = `${doctor.firstName} ${doctor.lastName}`;
        const patientName = `${patient.firstName} ${patient.lastName}`;

        await EmailService.sendAccessRejectedNotificationEmail(
          doctor.email,
          doctorName,
          patientName,
          reason
        );
        console.log(`✅ Access rejected email sent to doctor: ${doctor.email}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send access rejected email:', emailError);
    }

    return request;
  }

  /**
   * Get shared patients for doctor
   */
  static async getSharedPatientsForDoctor(doctorId: string) {
    const sharedAccessRepo = AppDataSource.getRepository(PatientSharedAccess);

    return await sharedAccessRepo.find({
      where: {
        doctorId,
        isActive: true,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['patient', 'accessRequest'],
      order: { expiresAt: 'ASC' },
    });
  }

  /**
   * Log access to patient record
   */
  static async logAccess(
    doctorId: string,
    patientId: string,
    action: AuditAction,
    details?: Record<string, any>,
    ipAddress?: string
  ) {
    const auditRepo = AppDataSource.getRepository(PatientAccessAudit);

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
    const sharedAccessRepo = AppDataSource.getRepository(PatientSharedAccess);
    const auditRepo = AppDataSource.getRepository(PatientAccessAudit);

    const expiredAccess = await sharedAccessRepo.find({
      where: {
        isActive: true,
        expiresAt: MoreThan(new Date()),
      },
    });

    for (const access of expiredAccess) {
      access.isActive = false;
      await sharedAccessRepo.save(access);

      await auditRepo.save({
        patientId: access.patientId,
        doctorId: access.doctorId,
        action: AuditAction.ACCESS_EXPIRED,
        details: {
          sharedAccessId: access.id,
        },
      });
    }

    return expiredAccess.length;
  }
}
