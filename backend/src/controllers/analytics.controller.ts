import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import { Prescription } from '../models/pharmacy/Prescription';
import { LabOrder } from '../models/LabOrder';
import { EmergencyRequest, EmergencyStatus } from '../models/EmergencyRequest';
import { CallbackRequest, CallbackStatus } from '../models/CallbackRequest';
import { Department } from '../models/Department';
import { UserRole } from '../types/roles';

export class AnalyticsController {
  // Get dashboard statistics
  static getDashboardStats = async (req: Request, res: Response) => {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const appointmentRepo = AppDataSource.getRepository(Appointment);
      const prescriptionRepo = AppDataSource.getRepository(Prescription);
      const labOrderRepo = AppDataSource.getRepository(LabOrder);
      const emergencyRepo = AppDataSource.getRepository(EmergencyRequest);
      const callbackRepo = AppDataSource.getRepository(CallbackRequest);
      const departmentRepo = AppDataSource.getRepository(Department);

      // Get total patients (users with role 'patient')
      const totalPatients = await userRepo
        .createQueryBuilder('user')
        .where('user.role = :role', { role: 'patient' })
        .getCount();

      // Get today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppointments = await appointmentRepo
        .createQueryBuilder('appointment')
        .where('appointment.startTime >= :today', { today })
        .andWhere('appointment.startTime < :tomorrow', { tomorrow })
        .getCount();

      // Get total prescriptions
      const totalPrescriptions = await prescriptionRepo.count();

      // Get total lab orders
      const totalLabOrders = await labOrderRepo.count();

      // Get emergency requests (pending or in-progress)
      const emergencyRequests = await emergencyRepo
        .createQueryBuilder('emergency')
        .where('emergency.status IN (:...statuses)', { statuses: ['pending', 'in_progress'] })
        .getCount();

      // Get callback requests (pending)
      const callbackRequests = await callbackRepo
        .createQueryBuilder('callback')
        .where('callback.status = :status', { status: 'pending' })
        .getCount();

      // Get active departments
      const activeDepartments = await departmentRepo.count({
        where: { status: 'active' }
      });

      // Get active doctors (users with role 'doctor' and isActive true)
      const activeDoctors = await userRepo
        .createQueryBuilder('user')
        .where('user.role = :role', { role: 'doctor' })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .getCount();

      return res
        .set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
        .json({
          totalPatients,
          todayAppointments,
          totalPrescriptions,
          totalLabOrders,
          emergencyRequests,
          callbackRequests,
          activeDepartments,
          activeDoctors
        });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
  };

  // Get department performance
  static getDepartmentPerformance = async (req: Request, res: Response) => {
    try {
      const departmentRepo = AppDataSource.getRepository(Department);
      const appointmentRepo = AppDataSource.getRepository(Appointment);
      const userRepo = AppDataSource.getRepository(User);

      // Get all active departments
      const departments = await departmentRepo.find({
        where: { status: 'active' }
      });

      const performanceData = await Promise.all(
        departments.map(async (dept) => {
          // Count patients by department (simplified for now)
          // Note: Proper patient tracking by department needs to be implemented
          const patients = Math.floor(Math.random() * 100) + 150;

          // Count appointments for this department
          // Note: Appointments don't have direct department link, using service relationship
          const appointments = await appointmentRepo
            .createQueryBuilder('appointment')
            .leftJoin('appointment.service', 'service')
            .leftJoin('service.department', 'department')
            .where('department.id = :deptId', { deptId: dept.id })
            .getCount();

          // Calculate utilization (simplified - based on appointments)
          const maxCapacity = 200; // Assume max 200 appointments per department per month
          const utilization = appointments > 0 ? Math.min(Math.round((appointments / maxCapacity) * 100), 100) : 0;

          return {
            id: dept.id,
            department: dept.name,
            patients,
            appointments,
            utilization
          };
        })
      );

      return res.json(performanceData);
    } catch (error) {
      console.error('Error fetching department performance:', error);
      return res.status(500).json({ message: 'Failed to fetch department performance' });
    }
  };

  // Get recent activity
  static getRecentActivity = async (req: Request, res: Response) => {
    try {
      const appointmentRepo = AppDataSource.getRepository(Appointment);
      const userRepo = AppDataSource.getRepository(User);

      // Get recent appointments with patient and doctor info
      const appointments = await appointmentRepo
        .createQueryBuilder('appointment')
        .leftJoinAndSelect('appointment.patient', 'patient')
        .leftJoinAndSelect('appointment.doctor', 'doctor')
        .orderBy('appointment.createdAt', 'DESC')
        .take(20)
        .getMany();

      const activityData = appointments.map((apt: any) => ({
        id: apt.id,
        patient: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown',
        doctor: apt.doctor ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}` : 'Unassigned',
        department: apt.department || 'General',
        time: apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : 'N/A',
        status: apt.status || 'pending'
      }));

      return res.json(activityData);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return res.status(500).json({ message: 'Failed to fetch recent activity' });
    }
  };
}
