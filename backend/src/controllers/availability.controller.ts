import { Request, Response } from 'express';
import { Between, In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { AvailabilitySlot, DayOfWeek } from '../models/AvailabilitySlot';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import { NotFoundException, BadRequestException } from '../exceptions/http.exception';

export class AvailabilityController {
  // Get current doctor's availability slots
  static getMyAvailability = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const repo = AppDataSource.getRepository(AvailabilitySlot);
      const slots = await repo.find({
        where: { doctor: { id: userId } },
        order: { dayOfWeek: 'ASC', startTime: 'ASC' }
      });

      return res.json({ data: slots });
    } catch (error) {
      console.error('Error fetching availability:', error);
      return res.status(500).json({ message: 'Error fetching availability' });
    }
  };

  // Get availability for a specific doctor (public/admin)
  static getDoctorAvailability = async (req: Request, res: Response) => {
    try {
      const { doctorId } = req.params;
      const { includeInactive } = req.query;

      const repo = AppDataSource.getRepository(AvailabilitySlot);
      const where: any = { doctor: { id: doctorId } };
      
      if (!includeInactive) {
        where.isActive = true;
      }

      const slots = await repo.find({
        where,
        order: { dayOfWeek: 'ASC', startTime: 'ASC' }
      });

      return res.json({ data: slots });
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      return res.status(500).json({ message: 'Error fetching doctor availability' });
    }
  };

  // Create new availability slot
  static createAvailability = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { dayOfWeek, startTime, endTime, specificDate, isActive, notes } = req.body;

      // Validation
      if (!dayOfWeek || !startTime || !endTime) {
        return res.status(400).json({ message: 'dayOfWeek, startTime, and endTime are required' });
      }

      // Validate day of week
      if (!Object.values(DayOfWeek).includes(dayOfWeek)) {
        return res.status(400).json({ message: 'Invalid dayOfWeek' });
      }

      // Validate time format (HH:MM:SS or HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({ message: 'Invalid time format. Use HH:MM or HH:MM:SS' });
      }

      // Check for overlapping slots
      const repo = AppDataSource.getRepository(AvailabilitySlot);
      const userRepo = AppDataSource.getRepository(User);
      
      const doctor = await userRepo.findOne({ where: { id: userId } });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      // Check for conflicts
      const existingSlots = await repo.find({
        where: { 
          doctor: { id: userId },
          dayOfWeek,
          isActive: true
        }
      });

      for (const slot of existingSlots) {
        if (this.timesOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
          return res.status(409).json({ 
            message: 'This time slot overlaps with an existing availability slot',
            conflictingSlot: slot
          });
        }
      }

      // Create new slot
      const newSlot = repo.create({
        doctor,
        dayOfWeek,
        startTime,
        endTime,
        specificDate: specificDate ? new Date(specificDate) : undefined,
        isActive: isActive !== undefined ? isActive : true,
        notes
      });

      const saved = await repo.save(newSlot);
      return res.status(201).json({ message: 'Availability slot created', data: saved });
    } catch (error) {
      console.error('Error creating availability:', error);
      return res.status(500).json({ message: 'Error creating availability slot' });
    }
  };

  // Update availability slot
  static updateAvailability = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const { dayOfWeek, startTime, endTime, specificDate, isActive, notes } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const repo = AppDataSource.getRepository(AvailabilitySlot);
      const slot = await repo.findOne({ 
        where: { id },
        relations: ['doctor']
      });

      if (!slot) {
        return res.status(404).json({ message: 'Availability slot not found' });
      }

      // Ensure doctor can only update their own slots
      if (slot.doctor.id !== userId) {
        return res.status(403).json({ message: 'You can only update your own availability slots' });
      }

      // Update fields
      if (dayOfWeek) {
        if (!Object.values(DayOfWeek).includes(dayOfWeek)) {
          return res.status(400).json({ message: 'Invalid dayOfWeek' });
        }
        slot.dayOfWeek = dayOfWeek;
      }

      if (startTime) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        if (!timeRegex.test(startTime)) {
          return res.status(400).json({ message: 'Invalid startTime format' });
        }
        slot.startTime = startTime;
      }

      if (endTime) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        if (!timeRegex.test(endTime)) {
          return res.status(400).json({ message: 'Invalid endTime format' });
        }
        slot.endTime = endTime;
      }

      if (specificDate !== undefined) {
        slot.specificDate = specificDate ? new Date(specificDate) : undefined;
      }

      if (isActive !== undefined) {
        slot.isActive = isActive;
      }

      if (notes !== undefined) {
        slot.notes = notes;
      }

      const updated = await repo.save(slot);
      return res.json({ message: 'Availability slot updated', data: updated });
    } catch (error) {
      console.error('Error updating availability:', error);
      return res.status(500).json({ message: 'Error updating availability slot' });
    }
  };

  // Delete availability slot
  static deleteAvailability = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const repo = AppDataSource.getRepository(AvailabilitySlot);
      const slot = await repo.findOne({ 
        where: { id },
        relations: ['doctor']
      });

      if (!slot) {
        return res.status(404).json({ message: 'Availability slot not found' });
      }

      // Ensure doctor can only delete their own slots
      if (slot.doctor.id !== userId) {
        return res.status(403).json({ message: 'You can only delete your own availability slots' });
      }

      await repo.remove(slot);
      return res.json({ message: 'Availability slot deleted' });
    } catch (error) {
      console.error('Error deleting availability:', error);
      return res.status(500).json({ message: 'Error deleting availability slot' });
    }
  };

  // Bulk create availability (for setting up weekly schedule)
  static bulkCreateAvailability = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { slots } = req.body;

      if (!Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({ message: 'slots array is required' });
      }

      const repo = AppDataSource.getRepository(AvailabilitySlot);
      const userRepo = AppDataSource.getRepository(User);
      
      const doctor = await userRepo.findOne({ where: { id: userId } });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      const createdSlots = [];
      const errors = [];

      for (let i = 0; i < slots.length; i++) {
        const slotData = slots[i];
        
        try {
          // Validate
          if (!slotData.dayOfWeek || !slotData.startTime || !slotData.endTime) {
            errors.push({ index: i, message: 'Missing required fields' });
            continue;
          }

          if (!Object.values(DayOfWeek).includes(slotData.dayOfWeek)) {
            errors.push({ index: i, message: 'Invalid dayOfWeek' });
            continue;
          }

          const newSlot = repo.create({
            doctor,
            dayOfWeek: slotData.dayOfWeek,
            startTime: slotData.startTime,
            endTime: slotData.endTime,
            specificDate: slotData.specificDate ? new Date(slotData.specificDate) : undefined,
            isActive: slotData.isActive !== undefined ? slotData.isActive : true,
            notes: slotData.notes
          });

          const saved = await repo.save(newSlot);
          createdSlots.push(saved);
        } catch (error: any) {
          errors.push({ index: i, message: error.message });
        }
      }

      return res.status(201).json({ 
        message: `Created ${createdSlots.length} availability slots`,
        data: createdSlots,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('Error bulk creating availability:', error);
      return res.status(500).json({ message: 'Error creating availability slots' });
    }
  };

  // Get available slots for booking (public endpoint)
  static getAvailableSlots = async (req: Request, res: Response) => {
    try {
      const { departmentId, doctorId, date, startDate, endDate } = req.query;

      if (!date && !startDate) {
        return res.status(400).json({ message: 'date or startDate is required' });
      }

      const slotRepo = AppDataSource.getRepository(AvailabilitySlot);
      const appointmentRepo = AppDataSource.getRepository(Appointment);

      // Parse dates
      const searchDate = date ? new Date(date as string) : new Date(startDate as string);
      const endSearchDate = endDate ? new Date(endDate as string) : searchDate;

      // Get day of week
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = daysOfWeek[searchDate.getDay()];

      // Build query for availability slots
      const query: any = {
        isActive: true,
        dayOfWeek: dayOfWeek as any
      };

      if (doctorId) {
        query.doctor = { id: doctorId as string };
      } else if (departmentId) {
        // Find doctors in department
        const userRepo = AppDataSource.getRepository(User);
        const doctors = await userRepo.find({
          where: {
            role: 'doctor' as any,
            departmentId: departmentId as string,
            isActive: true
          }
        });
        
        if (doctors.length === 0) {
          return res.json({ data: [] });
        }
      }

      // Get availability slots
      const slots = await slotRepo.find({
        where: query,
        relations: ['doctor', 'doctor.department']
      });

      // Get existing appointments for the date
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);

      const appointments = await appointmentRepo.find({
        where: {
          startTime: Between(startOfDay, endOfDay),
          status: In(['pending', 'confirmed'])
        },
        relations: ['doctor']
      });

      // Calculate available slots
      const availableSlots = [];

      for (const slot of slots) {
        // Check if doctor has appointments during this slot
        const doctorAppointments = appointments.filter(
          apt => apt.doctor?.id === slot.doctor.id
        );

        // Parse slot times
        const [startHour, startMin] = slot.startTime.split(':').map(Number);
        const [endHour, endMin] = slot.endTime.split(':').map(Number);

        const slotStart = new Date(searchDate);
        slotStart.setHours(startHour, startMin, 0, 0);

        const slotEnd = new Date(searchDate);
        slotEnd.setHours(endHour, endMin, 0, 0);

        // Generate 30-minute time slots
        const timeSlots = [];
        let currentTime = new Date(slotStart);

        while (currentTime < slotEnd) {
          const slotEndTime = new Date(currentTime);
          slotEndTime.setMinutes(slotEndTime.getMinutes() + 30);

          // Check if this time slot is available (no conflicting appointments)
          const isBooked = doctorAppointments.some(apt => {
            const aptStart = new Date(apt.startTime);
            const aptEnd = new Date(apt.endTime);
            return (currentTime < aptEnd && slotEndTime > aptStart);
          });

          if (!isBooked && slotEndTime <= slotEnd) {
            timeSlots.push({
              startTime: currentTime.toISOString(),
              endTime: slotEndTime.toISOString(),
              available: true
            });
          }

          currentTime = slotEndTime;
        }

        if (timeSlots.length > 0) {
          availableSlots.push({
            doctor: {
              id: slot.doctor.id,
              firstName: slot.doctor.firstName,
              lastName: slot.doctor.lastName,
              department: slot.doctor.department
            },
            availabilitySlot: {
              id: slot.id,
              dayOfWeek: slot.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime
            },
            availableTimeSlots: timeSlots
          });
        }
      }

      return res.json({ 
        data: availableSlots,
        date: searchDate.toISOString(),
        dayOfWeek
      });
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return res.status(500).json({ message: 'Error fetching available slots' });
    }
  };

  // Helper function to check time overlap
  private static timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const s1 = toMinutes(start1);
    const e1 = toMinutes(end1);
    const s2 = toMinutes(start2);
    const e2 = toMinutes(end2);

    return (s1 < e2 && e1 > s2);
  }
}
