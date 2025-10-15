import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { ConsultationNote } from '../models/ConsultationNote';
import { Appointment } from '../models/Appointment';
import { User } from '../models/User';

export class ConsultationController {
  // Create consultation note
  static createConsultation = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const {
        appointmentId,
        patientId,
        chiefComplaint,
        historyPresentIllness,
        pastMedicalHistory,
        currentMedications,
        physicalExamination,
        assessment,
        plan,
        doctorNotes,
        followUpDate,
        followUpInstructions
      } = req.body;

      if (!appointmentId || !patientId) {
        return res.status(400).json({ message: 'Appointment ID and Patient ID are required' });
      }

      const consultationRepo = AppDataSource.getRepository(ConsultationNote);
      const appointmentRepo = AppDataSource.getRepository(Appointment);
      const userRepo = AppDataSource.getRepository(User);

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
    } catch (error) {
      console.error('Error creating consultation:', error);
      return res.status(500).json({ message: 'Error creating consultation note' });
    }
  };

  // Get consultation by ID
  static getConsultation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      const consultationRepo = AppDataSource.getRepository(ConsultationNote);
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
    } catch (error) {
      console.error('Error fetching consultation:', error);
      return res.status(500).json({ message: 'Error fetching consultation' });
    }
  };

  // Update consultation note
  static updateConsultation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const updateData = req.body;

      const consultationRepo = AppDataSource.getRepository(ConsultationNote);
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
    } catch (error) {
      console.error('Error updating consultation:', error);
      return res.status(500).json({ message: 'Error updating consultation note' });
    }
  };

  // Get patient consultations
  static getPatientConsultations = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // Check authorization
      const isPatient = id === userId;
      const isDoctor = userRole === 'doctor';
      const isAdmin = ['admin', 'super_admin'].includes(userRole);

      if (!isPatient && !isDoctor && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const consultationRepo = AppDataSource.getRepository(ConsultationNote);
      const consultations = await consultationRepo.find({
        where: { patient: { id } },
        relations: ['appointment', 'doctor', 'signedBy'],
        order: { createdAt: 'DESC' }
      });

      return res.json({
        data: consultations,
        total: consultations.length
      });
    } catch (error) {
      console.error('Error fetching patient consultations:', error);
      return res.status(500).json({ message: 'Error fetching consultations' });
    }
  };

  // Sign consultation note
  static signConsultation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const consultationRepo = AppDataSource.getRepository(ConsultationNote);
      const userRepo = AppDataSource.getRepository(User);

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
    } catch (error) {
      console.error('Error signing consultation:', error);
      return res.status(500).json({ message: 'Error signing consultation note' });
    }
  };

  // Get consultation PDF (placeholder)
  static getConsultationPDF = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const consultationRepo = AppDataSource.getRepository(ConsultationNote);
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
    } catch (error) {
      console.error('Error generating PDF:', error);
      return res.status(500).json({ message: 'Error generating PDF' });
    }
  };
}
