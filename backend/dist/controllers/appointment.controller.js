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
exports.AppointmentController = void 0;
const typeorm_1 = require("typeorm");
const AvailabilitySlot_1 = require("../models/AvailabilitySlot");
const database_1 = require("../config/database");
const Appointment_1 = require("../models/Appointment");
const User_1 = require("../models/User");
const roles_1 = require("../types/roles");
const Service_1 = require("../models/Service");
const http_exception_1 = require("../exceptions/http.exception");
const AppointmentHistory_1 = require("../models/AppointmentHistory");
// Utility: append appointment history entries
const addHistory = async (appointmentId, action, details, changedBy) => {
    try {
        const repo = database_1.AppDataSource.getRepository(AppointmentHistory_1.AppointmentHistory);
        const h = repo.create({ appointmentId, action, details, changedBy });
        await repo.save(h);
    }
    catch (_b) {
        // best-effort; ignore history failures
    }
};
class AppointmentController {
}
exports.AppointmentController = AppointmentController;
_a = AppointmentController;
// Doctor: list my appointments
AppointmentController.listDoctorAppointments = async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const { status, startDate, endDate, page = '1', limit = '10', search = '' } = req.query;
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
    const skip = (pageNum - 1) * limitNum;
    const repo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
    const qb = repo.createQueryBuilder('appointment')
        .leftJoinAndSelect('appointment.service', 'service')
        .leftJoinAndSelect('appointment.patient', 'patient')
        .leftJoinAndSelect('appointment.doctor', 'doctor')
        .where('doctor.id = :userId', { userId })
        .orderBy('appointment.startTime', 'DESC')
        .skip(skip)
        .take(limitNum);
    if (status)
        qb.andWhere('appointment.status = :status', { status });
    if (startDate && endDate) {
        qb.andWhere('appointment.startTime BETWEEN :startDate AND :endDate', {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        });
    }
    if (search) {
        qb.andWhere('(service.name ILIKE :search OR patient.firstName ILIKE :search OR patient.lastName ILIKE :search)', {
            search: `%${String(search)}%`
        });
    }
    try {
        const [items, total] = await qb.getManyAndCount();
        return res.json({
            data: items,
            meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
        });
    }
    catch (e) {
        console.error('Doctor list appointments error:', e);
        return res.status(500).json({ message: 'Error fetching appointments' });
    }
};
// Doctor: update notes for my appointment
AppointmentController.doctorUpdateNotes = async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const { id } = req.params;
    const { notes } = req.body || {};
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    try {
        const repo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const appt = await repo.createQueryBuilder('a')
            .leftJoinAndSelect('a.doctor', 'doctor')
            .where('a.id = :id', { id })
            .andWhere('doctor.id = :userId', { userId })
            .getOne();
        if (!appt)
            return res.status(404).json({ message: 'Appointment not found' });
        appt.notes = notes !== null && notes !== void 0 ? notes : '';
        await repo.save(appt);
        return res.json({ id: appt.id, notes: appt.notes });
    }
    catch (e) {
        console.error('Doctor update notes error:', e);
        return res.status(500).json({ message: 'Failed to update notes' });
    }
};
// Doctor: create an appointment for a patient (follow-up)
AppointmentController.doctorCreateAppointment = async (req, res) => {
    var _b, _c, _d;
    const doctorId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const { patientId, serviceId, startTime, endTime, notes, reason } = req.body || {};
    if (!doctorId)
        return res.status(401).json({ message: 'Authentication required' });
    if (!patientId || !serviceId || !startTime) {
        return res.status(400).json({ message: 'patientId, serviceId and startTime are required' });
    }
    try {
        const apptRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const svcRepo = database_1.AppDataSource.getRepository(Service_1.Service);
        const patient = await userRepo.findOne({ where: { id: patientId } });
        if (!patient)
            return res.status(404).json({ message: 'Patient not found' });
        const service = await svcRepo.findOne({ where: { id: serviceId } });
        if (!service)
            return res.status(404).json({ message: 'Service not found' });
        const doctor = await userRepo.findOne({ where: { id: doctorId } });
        if (!doctor)
            return res.status(404).json({ message: 'Doctor not found' });
        // Enforce: follow-ups must be within the doctor's own department
        if ((service.departmentId || ((_c = service === null || service === void 0 ? void 0 : service.department) === null || _c === void 0 ? void 0 : _c.id)) !== doctor.departmentId) {
            return res.status(403).json({
                message: 'Follow-ups must be booked within your department. To schedule in another department, create a referral and have that department book the appointment.'
            });
        }
        const start = new Date(startTime);
        const durationMin = (_d = service === null || service === void 0 ? void 0 : service.averageDuration) !== null && _d !== void 0 ? _d : 30;
        const end = endTime ? new Date(endTime) : new Date(start.getTime() + durationMin * 60000);
        // Overlap checks (doctor and patient) for PENDING/CONFIRMED
        const statuses = [Appointment_1.AppointmentStatus.PENDING, Appointment_1.AppointmentStatus.CONFIRMED];
        const doctorConflict = await apptRepo.createQueryBuilder('a')
            .leftJoin('a.doctor', 'doctor')
            .where('doctor.id = :doctorId', { doctorId })
            .andWhere('a.status IN (:...statuses)', { statuses })
            .andWhere('a.startTime < :end AND a.endTime > :start', { start, end })
            .getOne();
        if (doctorConflict) {
            return res.status(409).json({ message: 'Doctor is not available at the selected time', conflictingAppointment: doctorConflict.id });
        }
        const patientConflict = await apptRepo.createQueryBuilder('a')
            .leftJoin('a.patient', 'patient')
            .where('patient.id = :patientId', { patientId })
            .andWhere('a.status IN (:...statuses)', { statuses })
            .andWhere('a.startTime < :end AND a.endTime > :start', { start, end })
            .getOne();
        if (patientConflict) {
            return res.status(409).json({ message: 'Patient already has an appointment at the selected time', conflictingAppointment: patientConflict.id });
        }
        const appointment = new Appointment_1.Appointment();
        appointment.patient = patient;
        appointment.doctor = doctor;
        appointment.service = service;
        appointment.startTime = start;
        appointment.endTime = end;
        appointment.status = Appointment_1.AppointmentStatus.PENDING;
        appointment.notes = notes;
        appointment.reason = reason;
        const saved = await apptRepo.save(appointment);
        const withRels = await apptRepo.findOne({ where: { id: saved.id }, relations: ['patient', 'doctor', 'service'] });
        await addHistory(saved.id, 'follow_up_created', `Doctor ${doctorId} created follow-up for patient ${patientId}`, String(doctorId));
        return res.status(201).json(withRels);
    }
    catch (e) {
        console.error('Doctor create appointment error:', e);
        return res.status(500).json({ message: 'Failed to create appointment' });
    }
};
// Admin: get appointment by ID (no patient ownership restriction)
AppointmentController.adminGetAppointment = async (req, res) => {
    const { id } = req.params;
    const appointmentRepository = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
    try {
        const appt = await appointmentRepository.findOne({ where: { id }, relations: ['service', 'doctor', 'patient'] });
        if (!appt)
            return res.status(404).json({ message: 'Appointment not found' });
        return res.json(appt);
    }
    catch (e) {
        console.error('Admin get appointment error:', e);
        return res.status(500).json({ message: 'Error fetching appointment' });
    }
};
// Admin: cancel appointment by ID
AppointmentController.adminCancelAppointment = async (req, res) => {
    const { id } = req.params;
    const appointmentRepository = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
    try {
        const appt = await appointmentRepository.findOne({ where: { id } });
        if (!appt)
            return res.status(404).json({ message: 'Appointment not found' });
        appt.status = Appointment_1.AppointmentStatus.CANCELLED;
        await appointmentRepository.save(appt);
        return res.json({ message: 'Appointment cancelled successfully' });
    }
    catch (e) {
        console.error('Admin cancel appointment error:', e);
        return res.status(500).json({ message: 'Error cancelling appointment' });
    }
};
// Admin: confirm appointment by ID
AppointmentController.adminConfirmAppointment = async (req, res) => {
    const { id } = req.params;
    const apptRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
    try {
        const appt = await apptRepo.findOne({ where: { id }, relations: ['service', 'doctor', 'patient'] });
        if (!appt)
            return res.status(404).json({ message: 'Appointment not found' });
        if (!appt.doctor)
            return res.status(400).json({ message: 'Cannot confirm without an assigned doctor' });
        if (!appt.service)
            return res.status(400).json({ message: 'Appointment has no service assigned' });
        if (appt.status === Appointment_1.AppointmentStatus.CANCELLED) {
            return res.status(400).json({ message: 'Cannot confirm a cancelled appointment' });
        }
        // Overlap checks (excluding this appointment)
        const statuses = [Appointment_1.AppointmentStatus.PENDING, Appointment_1.AppointmentStatus.CONFIRMED];
        const conflictForDoctor = await apptRepo.createQueryBuilder('a')
            .leftJoin('a.doctor', 'doctor')
            .where('doctor.id = :doctorId', { doctorId: appt.doctor.id })
            .andWhere('a.id != :id', { id })
            .andWhere('a.status IN (:...statuses)', { statuses })
            .andWhere('a.startTime < :end AND a.endTime > :start', { start: appt.startTime, end: appt.endTime })
            .getOne();
        if (conflictForDoctor) {
            return res.status(409).json({ message: 'Doctor is not available at the selected time', conflictingAppointment: conflictForDoctor.id });
        }
        const conflictForPatient = await apptRepo.createQueryBuilder('a')
            .leftJoin('a.patient', 'patient')
            .where('patient.id = :patientId', { patientId: appt.patient.id })
            .andWhere('a.id != :id', { id })
            .andWhere('a.status IN (:...statuses)', { statuses })
            .andWhere('a.startTime < :end AND a.endTime > :start', { start: appt.startTime, end: appt.endTime })
            .getOne();
        if (conflictForPatient) {
            return res.status(409).json({ message: 'Patient already has an appointment at the selected time', conflictingAppointment: conflictForPatient.id });
        }
        appt.status = Appointment_1.AppointmentStatus.CONFIRMED;
        await apptRepo.save(appt);
        const withRels = await apptRepo.findOne({ where: { id: appt.id }, relations: ['patient', 'doctor', 'service'] });
        await addHistory(appt.id, 'confirmed', `Appointment confirmed by admin`, undefined);
        return res.json(withRels);
    }
    catch (e) {
        console.error('Admin confirm appointment error:', e);
        return res.status(500).json({ message: 'Error confirming appointment' });
    }
};
// Admin: list all appointments with filters
AppointmentController.listAllAppointments = async (req, res) => {
    const { status, startDate, endDate, page = '1', limit = '10', search = '', departmentId, serviceId, doctorId, patientId, } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
    const skip = (pageNum - 1) * limitNum;
    const appointmentRepository = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
    const qb = appointmentRepository
        .createQueryBuilder('appointment')
        .leftJoinAndSelect('appointment.service', 'service')
        .leftJoinAndSelect('service.department', 'department')
        .leftJoinAndSelect('appointment.doctor', 'doctor')
        .leftJoinAndSelect('appointment.patient', 'patient')
        .orderBy('appointment.startTime', 'DESC')
        .skip(skip)
        .take(limitNum);
    if (status)
        qb.andWhere('appointment.status = :status', { status });
    if (startDate && endDate) {
        qb.andWhere('appointment.startTime BETWEEN :startDate AND :endDate', {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        });
    }
    if (serviceId)
        qb.andWhere('service.id = :serviceId', { serviceId });
    if (doctorId)
        qb.andWhere('doctor.id = :doctorId', { doctorId });
    if (patientId)
        qb.andWhere('patient.id = :patientId', { patientId });
    if (departmentId)
        qb.andWhere('department.id = :departmentId', { departmentId });
    if (search) {
        qb.andWhere('(service.name ILIKE :search OR service.description ILIKE :search OR doctor.firstName ILIKE :search OR doctor.lastName ILIKE :search OR patient.firstName ILIKE :search OR patient.lastName ILIKE :search)', { search: `%${String(search)}%` });
    }
    try {
        const [items, total] = await qb.getManyAndCount();
        return res.json({
            data: items,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (e) {
        console.error('Error fetching all appointments (admin):', e);
        return res.status(500).json({ message: 'Error fetching appointments' });
    }
};
// Book a new appointment
AppointmentController.bookAppointment = async (req, res) => {
    var _b, _c, _d, _e, _f;
    const createAppointmentDto = req.body;
    const { serviceId, doctorId, startTime, endTime, notes, reason, preferences } = createAppointmentDto;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id; // Assuming user is authenticated
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    const appointmentRepository = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
    const userRepository = database_1.AppDataSource.getRepository(User_1.User);
    const serviceRepository = database_1.AppDataSource.getRepository(Service_1.Service);
    const slotRepository = database_1.AppDataSource.getRepository(AvailabilitySlot_1.AvailabilitySlot);
    try {
        // Validate service exists (get department for auto-assign)
        const service = await serviceRepository.findOne({ where: { id: serviceId }, relations: ['department'] });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        // Validate or auto-assign doctor
        let doctor;
        if (doctorId) {
            doctor = await userRepository.findOne({ where: { id: doctorId, role: roles_1.UserRole.DOCTOR } });
            if (!doctor)
                return res.status(404).json({ message: 'Doctor not found' });
            // Department consistency enforcement for manual selection
            const serviceDeptId = (_c = service === null || service === void 0 ? void 0 : service.department) === null || _c === void 0 ? void 0 : _c.id;
            const doctorDeptId = doctor === null || doctor === void 0 ? void 0 : doctor.departmentId;
            if (serviceDeptId && doctorDeptId && String(serviceDeptId) !== String(doctorDeptId)) {
                return res.status(400).json({ message: 'Selected doctor must belong to the same department as the chosen service' });
            }
        }
        else {
            // Auto-assign path: find candidates in the service's department, apply preferences
            const deptId = (_d = service === null || service === void 0 ? void 0 : service.department) === null || _d === void 0 ? void 0 : _d.id;
            const allDoctors = await userRepository.createQueryBuilder('u')
                .leftJoinAndSelect('u.department', 'department')
                .where('u.role = :role', { role: roles_1.UserRole.DOCTOR })
                .andWhere('u.isActive = true')
                .getMany();
            // filter by department first; if none match, fall back to all doctors
            let candidates = (deptId ? allDoctors.filter(d => d.departmentId === deptId) : allDoctors);
            if (candidates.length === 0)
                candidates = allDoctors;
            // seniority preference (stored under preferences.seniority)
            const prefSeniority = (_e = preferences === null || preferences === void 0 ? void 0 : preferences.doctorPreference) === null || _e === void 0 ? void 0 : _e.seniority;
            const urgency = (preferences === null || preferences === void 0 ? void 0 : preferences.urgency) || 'routine';
            const seniorRanks = ['chief', 'senior'];
            const getSeniority = (d) => { var _b; return String(((_b = d === null || d === void 0 ? void 0 : d.preferences) === null || _b === void 0 ? void 0 : _b.seniority) || '').toLowerCase(); };
            const applySeniority = (list, want) => {
                if (!want || want.length === 0)
                    return list;
                const filtered = list.filter(d => want.includes(getSeniority(d)));
                return filtered.length ? filtered : list; // fallback to original if none
            };
            if (prefSeniority && prefSeniority !== 'any') {
                candidates = applySeniority(candidates, [prefSeniority]);
            }
            else if (urgency === 'urgent') {
                candidates = applySeniority(candidates, seniorRanks);
            }
            // Prefer doctors with availability covering the requested time
            const requestDate = new Date(startTime);
            const hh = String(requestDate.getHours()).padStart(2, '0');
            const mm = String(requestDate.getMinutes()).padStart(2, '0');
            const timeHM = `${hh}:${mm}`;
            const dowMap = [AvailabilitySlot_1.DayOfWeek.SUNDAY, AvailabilitySlot_1.DayOfWeek.MONDAY, AvailabilitySlot_1.DayOfWeek.TUESDAY, AvailabilitySlot_1.DayOfWeek.WEDNESDAY, AvailabilitySlot_1.DayOfWeek.THURSDAY, AvailabilitySlot_1.DayOfWeek.FRIDAY, AvailabilitySlot_1.DayOfWeek.SATURDAY];
            const reqDay = dowMap[requestDate.getDay()];
            const availableCandidates = [];
            for (const d of candidates) {
                const slot = await slotRepository.createQueryBuilder('s')
                    .leftJoin('s.doctor', 'doc')
                    .where('doc.id = :id', { id: d.id })
                    .andWhere('s.dayOfWeek = :dow', { dow: reqDay })
                    .andWhere('s.isActive = true')
                    .andWhere('s.startTime <= :t AND s.endTime >= :t', { t: timeHM })
                    .getOne();
                if (slot)
                    availableCandidates.push(d);
            }
            if (availableCandidates.length)
                candidates = availableCandidates;
            // Check conflicts and pick least loaded
            const start = new Date(startTime);
            const end = new Date(endTime);
            const statuses = [Appointment_1.AppointmentStatus.PENDING, Appointment_1.AppointmentStatus.CONFIRMED];
            const scored = [];
            for (const d of candidates) {
                const count = await appointmentRepository.createQueryBuilder('a')
                    .leftJoin('a.doctor', 'doctor')
                    .where('doctor.id = :doctorId', { doctorId: d.id })
                    .andWhere('a.status IN (:...statuses)', { statuses })
                    .andWhere('a.startTime < :end AND a.endTime > :start', { start, end })
                    .getCount();
                scored.push({ d, conflicts: count });
            }
            // pick conflict-free with least conflicts; if all conflict, leave undefined (pending)
            const free = scored.filter(s => s.conflicts === 0).sort((a, b) => {
                // tie-breaker by seniority ranking then createdAt
                const rankOrder = (x) => {
                    const s = getSeniority(x);
                    return s === 'chief' ? 1 : s === 'senior' ? 2 : s === 'consultant' ? 3 : 4;
                };
                return rankOrder(a.d) - rankOrder(b.d);
            });
            if (free.length)
                doctor = free[0].d;
            // If still none, compute suggested nearest availability across candidates
            var suggestion;
            if (!doctor && candidates.length) {
                const allSlots = await slotRepository.createQueryBuilder('s')
                    .leftJoinAndSelect('s.doctor', 'doc')
                    .where('doc.id IN (:...ids)', { ids: candidates.map((c) => c.id) })
                    .andWhere('s.isActive = true')
                    .getMany();
                // compute next occurrence within next 14 days
                const ref = new Date(startTime);
                const options = [];
                const slotToNextDate = (refDate, slot) => {
                    const dayIndex = [AvailabilitySlot_1.DayOfWeek.SUNDAY, AvailabilitySlot_1.DayOfWeek.MONDAY, AvailabilitySlot_1.DayOfWeek.TUESDAY, AvailabilitySlot_1.DayOfWeek.WEDNESDAY, AvailabilitySlot_1.DayOfWeek.THURSDAY, AvailabilitySlot_1.DayOfWeek.FRIDAY, AvailabilitySlot_1.DayOfWeek.SATURDAY].indexOf(slot.dayOfWeek);
                    const refDOW = refDate.getDay();
                    let addDays = (dayIndex - refDOW + 7) % 7;
                    let base = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
                    base.setDate(base.getDate() + addDays);
                    const [sh, sm] = String(slot.startTime).split(':').map(n => parseInt(n, 10));
                    const [eh, em] = String(slot.endTime).split(':').map(n => parseInt(n, 10));
                    const sdt = new Date(base);
                    sdt.setHours(sh, sm || 0, 0, 0);
                    const edt = new Date(base);
                    edt.setHours(eh, em || 0, 0, 0);
                    if (sdt < refDate) {
                        // move to next week
                        sdt.setDate(sdt.getDate() + 7);
                        edt.setDate(edt.getDate() + 7);
                    }
                    return { start: sdt, end: edt };
                };
                for (const s of allSlots) {
                    const { start: sdt, end: edt } = slotToNextDate(ref, s);
                    // check conflicts for that doctor
                    const overlaps = await appointmentRepository.createQueryBuilder('a')
                        .leftJoin('a.doctor', 'doc')
                        .where('doc.id = :id', { id: s.doctor.id })
                        .andWhere('a.status IN (:...statuses)', { statuses })
                        .andWhere('a.startTime < :end AND a.endTime > :start', { start: sdt, end: edt })
                        .getCount();
                    if (overlaps === 0) {
                        const cand = candidates.find((c) => c.id === s.doctor.id);
                        if (cand)
                            options.push({ d: cand, start: sdt, end: edt });
                    }
                }
                options.sort((a, b) => a.start.getTime() - b.start.getTime());
                if (options.length) {
                    suggestion = { doctorId: options[0].d.id, startTime: options[0].start.toISOString(), endTime: options[0].end.toISOString() };
                }
            }
        }
        // Get patient
        const patient = await userRepository.findOne({ where: { id: userId } });
        if (!patient) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check for time slot availability
        const existingAppointment = await appointmentRepository.findOne({
            where: [
                // Check for doctor's availability if doctor is specified or auto-assigned
                doctor ? {
                    doctor: { id: doctor.id },
                    startTime: (0, typeorm_1.LessThanOrEqual)(new Date(endTime)),
                    endTime: (0, typeorm_1.MoreThanOrEqual)(new Date(startTime)),
                    status: (0, typeorm_1.In)([Appointment_1.AppointmentStatus.PENDING, Appointment_1.AppointmentStatus.CONFIRMED]),
                } : undefined,
                // Also check for patient's availability
                {
                    patient: { id: userId },
                    startTime: (0, typeorm_1.LessThanOrEqual)(new Date(endTime)),
                    endTime: (0, typeorm_1.MoreThanOrEqual)(new Date(startTime)),
                    status: (0, typeorm_1.In)([Appointment_1.AppointmentStatus.PENDING, Appointment_1.AppointmentStatus.CONFIRMED]),
                },
            ].filter(Boolean),
        });
        if (existingAppointment) {
            return res.status(409).json({
                message: 'Time slot is not available',
                conflictingAppointment: existingAppointment.id,
            });
        }
        // Create new appointment
        const appointment = new Appointment_1.Appointment();
        appointment.patient = patient;
        appointment.service = service;
        appointment.doctor = doctor;
        appointment.startTime = new Date(startTime);
        appointment.endTime = new Date(endTime);
        appointment.status = doctor && !existingAppointment ? Appointment_1.AppointmentStatus.CONFIRMED : Appointment_1.AppointmentStatus.PENDING;
        appointment.notes = notes;
        appointment.reason = reason;
        await appointmentRepository.save(appointment);
        // Send appointment confirmation email
        try {
            const patient = await userRepository.findOne({ where: { id: userId } });
            if (patient && doctor) {
                const { EmailService } = await Promise.resolve().then(() => __importStar(require('../services/email.service')));
                EmailService.sendAppointmentConfirmationEmail(patient.email, `${patient.firstName} ${patient.lastName}`, `${doctor.firstName} ${doctor.lastName}`, new Date(startTime).toLocaleString(), ((_f = service.department) === null || _f === void 0 ? void 0 : _f.name) || 'General').catch(err => console.error('Failed to send appointment confirmation email:', err));
            }
        }
        catch (emailError) {
            console.error('Email service error:', emailError);
        }
        // Return the created appointment with related data
        const savedAppointment = await appointmentRepository.findOne({
            where: { id: appointment.id },
            relations: ['patient', 'doctor', 'service'],
        });
        const response = savedAppointment;
        // If pending and we computed a suggestion, attach it to help frontend offer alternate time
        if ((response === null || response === void 0 ? void 0 : response.status) === Appointment_1.AppointmentStatus.PENDING && typeof suggestion !== 'undefined') {
            response.suggestion = suggestion;
        }
        await addHistory(appointment.id, 'created', `Booked service ${service.id} from ${new Date(startTime).toISOString()} to ${new Date(endTime).toISOString()}`, String(userId));
        return res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating appointment:', error);
        return res.status(500).json({ message: 'Error creating appointment' });
    }
};
// List user's appointments with pagination
AppointmentController.listUserAppointments = async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const { status, startDate, endDate, page = '1', limit = '10', search = '' } = req.query;
    if (!userId) {
        throw new http_exception_1.BadRequestException('User ID is required');
    }
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
    const skip = (pageNum - 1) * limitNum;
    const appointmentRepository = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
    const queryBuilder = appointmentRepository
        .createQueryBuilder('appointment')
        .leftJoinAndSelect('appointment.service', 'service')
        .leftJoinAndSelect('appointment.doctor', 'doctor')
        .where('appointment.patient_id = :userId', { userId })
        .orderBy('appointment.startTime', 'DESC')
        .skip(skip)
        .take(limitNum);
    // Apply filters
    if (status) {
        queryBuilder.andWhere('appointment.status = :status', { status });
    }
    if (startDate && endDate) {
        queryBuilder.andWhere('appointment.startTime BETWEEN :startDate AND :endDate', { startDate: new Date(startDate), endDate: new Date(endDate) });
    }
    if (search) {
        queryBuilder.andWhere('(service.name ILIKE :search OR service.description ILIKE :search OR doctor.firstName ILIKE :search OR doctor.lastName ILIKE :search)', { search: `%${search}%` });
    }
    try {
        const [appointments, total] = await queryBuilder.getManyAndCount();
        const totalPages = Math.ceil(total / limitNum);
        return res.json({
            data: appointments,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages
            }
        });
    }
    catch (error) {
        console.error('Error fetching appointments:', error);
        throw new Error('Error fetching appointments');
    }
};
// Get appointment details
AppointmentController.getAppointment = async (req, res) => {
    var _b, _c, _d, _e;
    const { id } = req.params;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const userRole = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    const appointmentRepository = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
    try {
        // Fetch appointment with relations
        const appointment = await appointmentRepository.findOne({
            where: { id },
            relations: ['service', 'doctor', 'patient'],
        });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        // Check authorization: patient can see their own, doctor can see their assigned, admin can see all
        const isPatient = ((_d = appointment.patient) === null || _d === void 0 ? void 0 : _d.id) === userId;
        const isDoctor = ((_e = appointment.doctor) === null || _e === void 0 ? void 0 : _e.id) === userId;
        const isAdmin = userRole === 'admin' || userRole === 'super_admin';
        if (!isPatient && !isDoctor && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this appointment' });
        }
        return res.json(appointment);
    }
    catch (error) {
        console.error('Error fetching appointment:', error);
        return res.status(500).json({ message: 'Error fetching appointment' });
    }
};
// Update an appointment (patient-owned)
AppointmentController.updateAppointment = async (req, res) => {
    var _b, _c, _d;
    const { id } = req.params;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId)
        return res.status(401).json({ message: 'Authentication required' });
    const { startTime, endTime, notes, reason, doctorId } = req.body || {};
    const apptRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    try {
        const appt = await apptRepo.findOne({ where: { id }, relations: ['patient', 'doctor', 'service'] });
        if (!appt || ((_c = appt.patient) === null || _c === void 0 ? void 0 : _c.id) !== userId)
            return res.status(404).json({ message: 'Appointment not found' });
        // Optional: change doctor if provided
        if (doctorId) {
            const doc = await userRepo.findOne({ where: { id: doctorId } });
            if (!doc)
                return res.status(404).json({ message: 'Doctor not found' });
            appt.doctor = doc;
        }
        // Update times if provided and check conflicts
        const oldStart = appt.startTime;
        const oldEnd = appt.endTime;
        const oldNotes = appt.notes || '';
        const newStart = startTime ? new Date(startTime) : appt.startTime;
        const newEnd = endTime ? new Date(endTime) : appt.endTime;
        const statuses = [Appointment_1.AppointmentStatus.PENDING, Appointment_1.AppointmentStatus.CONFIRMED];
        // Doctor conflicts
        if ((_d = appt.doctor) === null || _d === void 0 ? void 0 : _d.id) {
            const dConflict = await apptRepo.createQueryBuilder('a')
                .leftJoin('a.doctor', 'doctor')
                .where('doctor.id = :doctorId', { doctorId: appt.doctor.id })
                .andWhere('a.id != :id', { id })
                .andWhere('a.status IN (:...statuses)', { statuses })
                .andWhere('a.startTime < :end AND a.endTime > :start', { start: newStart, end: newEnd })
                .getOne();
            if (dConflict)
                return res.status(409).json({ message: 'Doctor is not available at the selected time', conflictingAppointment: dConflict.id });
        }
        // Patient conflicts
        const pConflict = await apptRepo.createQueryBuilder('a')
            .leftJoin('a.patient', 'patient')
            .where('patient.id = :patientId', { patientId: userId })
            .andWhere('a.id != :id', { id })
            .andWhere('a.status IN (:...statuses)', { statuses })
            .andWhere('a.startTime < :end AND a.endTime > :start', { start: newStart, end: newEnd })
            .getOne();
        if (pConflict)
            return res.status(409).json({ message: 'Time slot is not available', conflictingAppointment: pConflict.id });
        appt.startTime = newStart;
        appt.endTime = newEnd;
        if (typeof notes !== 'undefined')
            appt.notes = notes;
        if (typeof reason !== 'undefined')
            appt.reason = reason;
        await apptRepo.save(appt);
        const withRels = await apptRepo.findOne({ where: { id }, relations: ['patient', 'doctor', 'service'] });
        // History
        if (oldStart.getTime() !== newStart.getTime() || oldEnd.getTime() !== newEnd.getTime()) {
            await addHistory(id, 'rescheduled', `From ${oldStart.toISOString()}-${oldEnd.toISOString()} to ${newStart.toISOString()}-${newEnd.toISOString()}`, String(userId));
        }
        if ((appt.notes || '') !== oldNotes) {
            await addHistory(id, 'notes_updated', `Notes updated`, String(userId));
        }
        return res.json(withRels);
    }
    catch (e) {
        console.error('Update appointment error:', e);
        return res.status(500).json({ message: 'Error updating appointment' });
    }
};
// Cancel an appointment (patient-owned)
AppointmentController.cancelAppointment = async (req, res) => {
    var _b, _c;
    const { id } = req.params;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId)
        return res.status(401).json({ message: 'Authentication required' });
    const apptRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
    try {
        const appt = await apptRepo.findOne({ where: { id }, relations: ['patient'] });
        if (!appt || ((_c = appt.patient) === null || _c === void 0 ? void 0 : _c.id) !== userId)
            return res.status(404).json({ message: 'Appointment not found' });
        appt.status = Appointment_1.AppointmentStatus.CANCELLED;
        await apptRepo.save(appt);
        await addHistory(id, 'cancelled', 'Cancelled by patient', String(userId));
        return res.status(204).send();
    }
    catch (e) {
        console.error('Cancel appointment error:', e);
        return res.status(500).json({ message: 'Error cancelling appointment' });
    }
};
// Cancel with reason (stores into notes and logs history)
AppointmentController.cancelAppointmentWithReason = async (req, res) => {
    var _b, _c;
    const { id } = req.params;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const { reason } = req.body || {};
    if (!userId)
        return res.status(401).json({ message: 'Authentication required' });
    const apptRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
    try {
        const appt = await apptRepo.findOne({ where: { id }, relations: ['patient'] });
        if (!appt || ((_c = appt.patient) === null || _c === void 0 ? void 0 : _c.id) !== userId)
            return res.status(404).json({ message: 'Appointment not found' });
        appt.status = Appointment_1.AppointmentStatus.CANCELLED;
        appt.cancellationReason = reason;
        appt.cancelledAt = new Date();
        appt.cancelledBy = { id: userId };
        const stamp = new Date().toISOString();
        const prefix = appt.notes ? appt.notes + '\n' : '';
        appt.notes = `${prefix}Cancel reason (${stamp}): ${String(reason || '').trim() || 'N/A'}`;
        await apptRepo.save(appt);
        await addHistory(id, 'cancelled', `Reason: ${String(reason || '').trim() || 'N/A'}`, String(userId));
        return res.status(204).send();
    }
    catch (e) {
        console.error('Cancel appointment (with reason) error:', e);
        return res.status(500).json({ message: 'Error cancelling appointment' });
    }
};
// Reschedule appointment
AppointmentController.rescheduleAppointment = async (req, res) => {
    var _b, _c, _d;
    try {
        const { id } = req.params;
        const { startTime, endTime, reason } = req.body;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!startTime || !endTime) {
            return res.status(400).json({ message: 'startTime and endTime are required' });
        }
        const repo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const appointment = await repo.findOne({
            where: { id },
            relations: ['patient', 'doctor', 'service']
        });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        // Check permission
        const userRole = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
        const isPatient = appointment.patient.id === userId;
        const isDoctor = ((_d = appointment.doctor) === null || _d === void 0 ? void 0 : _d.id) === userId;
        const isAdmin = ['admin', 'super_admin'].includes(userRole);
        if (!isPatient && !isDoctor && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to reschedule this appointment' });
        }
        // Create new appointment with new time
        const newAppointment = repo.create({
            patient: appointment.patient,
            doctor: appointment.doctor,
            service: appointment.service,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            status: Appointment_1.AppointmentStatus.PENDING,
            notes: appointment.notes,
            reason: appointment.reason,
            rescheduledFrom: appointment.id
        });
        await repo.save(newAppointment);
        // Mark old appointment as cancelled
        appointment.status = Appointment_1.AppointmentStatus.CANCELLED;
        appointment.cancellationReason = `Rescheduled: ${reason || 'Patient request'}`;
        appointment.cancelledAt = new Date();
        appointment.rescheduledTo = newAppointment.id;
        await repo.save(appointment);
        await addHistory(appointment.id, 'rescheduled', `Rescheduled to ${startTime}`, userId);
        await addHistory(newAppointment.id, 'created', 'Created from reschedule', userId);
        return res.json({
            message: 'Appointment rescheduled successfully',
            data: newAppointment
        });
    }
    catch (error) {
        console.error('Error rescheduling appointment:', error);
        return res.status(500).json({ message: 'Error rescheduling appointment' });
    }
};
// Mark as completed (doctor only)
AppointmentController.completeAppointment = async (req, res) => {
    var _b, _c;
    try {
        const { id } = req.params;
        const { consultationNotes } = req.body;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const repo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const appointment = await repo.findOne({
            where: { id },
            relations: ['doctor']
        });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        // Only doctor can mark as completed
        if (((_c = appointment.doctor) === null || _c === void 0 ? void 0 : _c.id) !== userId) {
            return res.status(403).json({ message: 'Only the assigned doctor can complete this appointment' });
        }
        appointment.status = Appointment_1.AppointmentStatus.COMPLETED;
        appointment.completedAt = new Date();
        if (consultationNotes) {
            appointment.consultationNotes = consultationNotes;
        }
        await repo.save(appointment);
        await addHistory(id, 'notes_updated', 'Appointment completed', userId);
        return res.json({
            message: 'Appointment marked as completed',
            data: appointment
        });
    }
    catch (error) {
        console.error('Error completing appointment:', error);
        return res.status(500).json({ message: 'Error completing appointment' });
    }
};
// Mark as no-show (doctor only)
AppointmentController.markNoShow = async (req, res) => {
    var _b, _c;
    try {
        const { id } = req.params;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const repo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const appointment = await repo.findOne({
            where: { id },
            relations: ['doctor']
        });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        // Only doctor can mark as no-show
        if (((_c = appointment.doctor) === null || _c === void 0 ? void 0 : _c.id) !== userId) {
            return res.status(403).json({ message: 'Only the assigned doctor can mark no-show' });
        }
        appointment.status = Appointment_1.AppointmentStatus.NOSHOW;
        await repo.save(appointment);
        await addHistory(id, 'notes_updated', 'Marked as no-show', userId);
        return res.json({
            message: 'Appointment marked as no-show',
            data: appointment
        });
    }
    catch (error) {
        console.error('Error marking no-show:', error);
        return res.status(500).json({ message: 'Error marking no-show' });
    }
};
// Add consultation notes (doctor only)
AppointmentController.addConsultationNotes = async (req, res) => {
    var _b, _c;
    try {
        const { id } = req.params;
        const { notes } = req.body;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!notes) {
            return res.status(400).json({ message: 'Notes are required' });
        }
        const repo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const appointment = await repo.findOne({
            where: { id },
            relations: ['doctor']
        });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        // Only doctor can add consultation notes
        if (((_c = appointment.doctor) === null || _c === void 0 ? void 0 : _c.id) !== userId) {
            return res.status(403).json({ message: 'Only the assigned doctor can add consultation notes' });
        }
        const timestamp = new Date().toISOString();
        const newNote = `[${timestamp}] ${notes}`;
        appointment.consultationNotes = appointment.consultationNotes
            ? `${appointment.consultationNotes}\n${newNote}`
            : newNote;
        await repo.save(appointment);
        await addHistory(id, 'notes_updated', 'Consultation notes added', userId);
        return res.json({
            message: 'Consultation notes added successfully',
            data: appointment
        });
    }
    catch (error) {
        console.error('Error adding consultation notes:', error);
        return res.status(500).json({ message: 'Error adding consultation notes' });
    }
};
// List appointment history (patient-owned)
AppointmentController.listHistory = async (req, res) => {
    var _b, _c, _d, _e;
    const { id } = req.params;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const role = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
    if (!userId)
        return res.status(401).json({ message: 'Authentication required' });
    try {
        // Ensure access: patient owner, assigned doctor, or admin
        const appt = await database_1.AppDataSource.getRepository(Appointment_1.Appointment)
            .findOne({ where: { id }, relations: ['patient', 'doctor'] });
        if (!appt)
            return res.status(404).json({ message: 'Appointment not found' });
        const isPatientOwner = ((_d = appt.patient) === null || _d === void 0 ? void 0 : _d.id) === userId;
        const isAssignedDoctor = ((_e = appt.doctor) === null || _e === void 0 ? void 0 : _e.id) === userId;
        const isAdmin = role === roles_1.UserRole.ADMIN || role === roles_1.UserRole.SUPER_ADMIN;
        if (!isPatientOwner && !isAssignedDoctor && !isAdmin) {
            // Hide existence to unauthorized users to avoid information leakage
            return res.status(404).json({ message: 'Appointment not found' });
        }
        const items = await database_1.AppDataSource.getRepository(AppointmentHistory_1.AppointmentHistory)
            .createQueryBuilder('h')
            .where('h.appointment_id = :id', { id })
            .orderBy('h.created_at', 'ASC')
            .getMany();
        return res.json({ data: items });
    }
    catch (e) {
        console.error('List appointment history error:', e);
        return res.status(500).json({ message: 'Error fetching history' });
    }
};
// Admin: Backfill departments by assigning a default service to appointments missing one
AppointmentController.adminBackfillDepartments = async (req, res) => {
    const { departmentId, departmentName } = req.body || {};
    const apptRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
    const svcRepo = database_1.AppDataSource.getRepository(Service_1.Service);
    // Lazy import to avoid circular imports in some setups
    const deptRepo = database_1.AppDataSource.getRepository(require('../models/Department').Department);
    try {
        // Resolve department
        let dept = departmentId ? await deptRepo.findOne({ where: { id: departmentId } }) : undefined;
        if (!dept && departmentName) {
            dept = await deptRepo.createQueryBuilder('d')
                .where('LOWER(d.name) = :n', { n: String(departmentName).toLowerCase() })
                .getOne();
        }
        if (!dept) {
            return res.status(400).json({ message: 'departmentId or a valid departmentName is required' });
        }
        // Ensure default service exists under this department
        let service = await svcRepo.findOne({ where: { department: { id: dept.id }, name: 'General Consultation' }, relations: ['department'] });
        if (!service) {
            const s = new Service_1.Service();
            s.name = 'General Consultation';
            s.description = 'Default service for department appointments';
            s.status = 'active';
            s.averageDuration = 30;
            s.department = dept;
            s.departmentId = dept.id;
            const saved = await svcRepo.save(s);
            service = await svcRepo.findOne({ where: { id: saved.id }, relations: ['department'] });
        }
        // Find appointments missing service
        const list = await apptRepo.createQueryBuilder('a')
            .leftJoinAndSelect('a.service', 'service')
            .where('a.serviceId IS NULL')
            .getMany();
        for (const a of list) {
            a.service = service;
        }
        if (list.length) {
            await apptRepo.save(list);
        }
        return res.json({ updated: list.length, department: { id: dept.id, name: dept.name }, service: { id: service.id, name: service.name } });
    }
    catch (e) {
        console.error('Admin backfill departments error:', e);
        return res.status(500).json({ message: 'Error backfilling appointments' });
    }
};
