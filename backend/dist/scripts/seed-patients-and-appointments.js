"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const Appointment_1 = require("../models/Appointment");
const Service_1 = require("../models/Service");
const roles_1 = require("../types/roles");
(async () => {
    try {
        console.log('Initializing database connection...');
        const ds = await database_1.AppDataSource.initialize();
        console.log('Database connection established.');
        const userRepo = ds.getRepository(User_1.User);
        const appointmentRepo = ds.getRepository(Appointment_1.Appointment);
        const serviceRepo = ds.getRepository(Service_1.Service);
        // Create patients
        const patients = [
            {
                email: 'raja.patient@example.com',
                firstName: 'raja',
                lastName: 'patient',
                phone: '+91-9876543001',
                age: 35,
                gender: 'Male'
            },
            {
                email: 'arun.bharati@example.com',
                firstName: 'arun',
                lastName: 'bharati',
                phone: '+91-9876543002',
                age: 28,
                gender: 'Male'
            },
            {
                email: 'priya.sharma@example.com',
                firstName: 'Priya',
                lastName: 'Sharma',
                phone: '+91-9876543003',
                age: 32,
                gender: 'Female'
            },
            {
                email: 'ravi.kumar@example.com',
                firstName: 'Ravi',
                lastName: 'Kumar',
                phone: '+91-9876543004',
                age: 45,
                gender: 'Male'
            }
        ];
        console.log('Creating patients...');
        const createdPatients = [];
        for (const patientData of patients) {
            let patient = await userRepo.findOne({ where: { email: patientData.email } });
            if (!patient) {
                patient = new User_1.User();
                patient.email = patientData.email;
                patient.firstName = patientData.firstName;
                patient.lastName = patientData.lastName;
                patient.phone = patientData.phone;
                patient.password = 'Patient@123';
                patient.role = roles_1.UserRole.PATIENT;
                patient.isActive = true;
                patient.gender = patientData.gender;
                patient.dateOfBirth = new Date(1990 - patientData.age + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
                await patient.hashPassword();
                await userRepo.save(patient);
                console.log(`Created patient: ${patient.firstName} ${patient.lastName}`);
            }
            createdPatients.push(patient);
        }
        // Get doctors
        const cardiologyDoctor = await userRepo.findOne({ where: { email: 'cardiology.consultant@example.com' } });
        const orthopedicsDoctor = await userRepo.findOne({ where: { email: 'orthopedics.chief@example.com' } });
        const generalMedicineDoctor = await userRepo.findOne({ where: { email: 'general-medicine.senior@example.com' } });
        // Get departments first
        const departments = await ds.getRepository('Department').find();
        const defaultDepartment = departments[0] || { id: '1' }; // Use first department or fallback
        // Get or create services
        let ecgService = await serviceRepo.findOne({ where: { name: 'ECG' } });
        if (!ecgService) {
            ecgService = new Service_1.Service();
            ecgService.name = 'ECG';
            ecgService.description = 'Electrocardiogram test';
            ecgService.averageDuration = 30;
            ecgService.status = 'active';
            ecgService.departmentId = defaultDepartment.id;
            await serviceRepo.save(ecgService);
        }
        let physiotherapyService = await serviceRepo.findOne({ where: { name: 'Physiotherapy' } });
        if (!physiotherapyService) {
            physiotherapyService = new Service_1.Service();
            physiotherapyService.name = 'Physiotherapy';
            physiotherapyService.description = 'Physical therapy session';
            physiotherapyService.averageDuration = 60;
            physiotherapyService.status = 'active';
            physiotherapyService.departmentId = defaultDepartment.id;
            await serviceRepo.save(physiotherapyService);
        }
        let consultationService = await serviceRepo.findOne({ where: { name: 'General Consultation' } });
        if (!consultationService) {
            consultationService = new Service_1.Service();
            consultationService.name = 'General Consultation';
            consultationService.description = 'General medical consultation';
            consultationService.averageDuration = 30;
            consultationService.status = 'active';
            consultationService.departmentId = defaultDepartment.id;
            await serviceRepo.save(consultationService);
        }
        // Create appointments
        const appointments = [
            {
                patient: createdPatients[0],
                doctor: cardiologyDoctor,
                service: ecgService,
                startTime: new Date('2025-10-03T10:00:00'),
                endTime: new Date('2025-10-03T10:30:00'),
                status: 'confirmed'
            },
            {
                patient: createdPatients[1],
                doctor: cardiologyDoctor,
                service: ecgService,
                startTime: new Date('2025-09-26T06:00:00'),
                endTime: new Date('2025-09-26T06:30:00'),
                status: 'confirmed'
            },
            {
                patient: createdPatients[0],
                doctor: orthopedicsDoctor,
                service: physiotherapyService,
                startTime: new Date('2025-10-02T14:00:00'),
                endTime: new Date('2025-10-02T15:00:00'),
                status: 'confirmed'
            },
            {
                patient: createdPatients[2],
                doctor: generalMedicineDoctor,
                service: consultationService,
                startTime: new Date('2025-10-04T11:00:00'),
                endTime: new Date('2025-10-04T11:30:00'),
                status: 'confirmed'
            }
        ];
        console.log('Creating appointments...');
        for (const appointmentData of appointments) {
            if (appointmentData.doctor && appointmentData.patient) {
                const existingAppointment = await appointmentRepo.findOne({
                    where: {
                        patient: { id: appointmentData.patient.id },
                        doctor: { id: appointmentData.doctor.id },
                        startTime: appointmentData.startTime
                    }
                });
                if (!existingAppointment) {
                    const appointment = new Appointment_1.Appointment();
                    appointment.patient = appointmentData.patient;
                    appointment.doctor = appointmentData.doctor;
                    appointment.service = appointmentData.service;
                    appointment.startTime = appointmentData.startTime;
                    appointment.endTime = appointmentData.endTime;
                    appointment.status = appointmentData.status;
                    await appointmentRepo.save(appointment);
                    console.log(`Created appointment: ${appointmentData.patient.firstName} ${appointmentData.patient.lastName} with Dr. ${appointmentData.doctor.firstName} ${appointmentData.doctor.lastName}`);
                }
            }
        }
        await ds.destroy();
        console.log('Database connection closed.');
        console.log('✅ Patients and appointments seeded successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding patients and appointments:', error);
        try {
            await database_1.AppDataSource.destroy();
        }
        catch (_a) { }
        process.exit(1);
    }
})();
