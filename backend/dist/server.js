"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_1 = require("./config/database");
const error_middleware_1 = require("./middleware/error.middleware");
const swagger_1 = require("./config/swagger");
const User_1 = require("./models/User");
const roles_1 = require("./types/roles");
const Appointment_1 = require("./models/Appointment");
const Service_1 = require("./models/Service");
const Department_1 = require("./models/Department");
const Report_1 = require("./models/Report");
const MedicalRecord_1 = require("./models/MedicalRecord");
const Bill_1 = require("./models/Bill");
const Referral_1 = require("./models/Referral");
const AvailabilitySlot_1 = require("./models/AvailabilitySlot");
const Plan_1 = require("./models/Plan");
const EmergencyRequest_1 = require("./models/EmergencyRequest");
const CallbackRequest_1 = require("./models/CallbackRequest");
const auth_middleware_1 = require("./middleware/auth.middleware");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
const department_routes_1 = __importDefault(require("./routes/department.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const patient_portal_routes_1 = __importDefault(require("./routes/patient-portal.routes"));
const referral_routes_1 = __importDefault(require("./routes/referral.routes"));
const availability_routes_1 = __importDefault(require("./routes/availability.routes"));
const insurance_routes_1 = __importDefault(require("./routes/insurance.routes"));
const pharmacy_1 = __importDefault(require("./routes/pharmacy"));
const emergency_routes_1 = __importDefault(require("./routes/emergency.routes"));
const callback_routes_1 = __importDefault(require("./routes/callback.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const consultation_routes_1 = __importDefault(require("./routes/consultation.routes"));
const diagnosis_routes_1 = __importDefault(require("./routes/diagnosis.routes"));
const vital_signs_routes_1 = __importDefault(require("./routes/vital-signs.routes"));
const allergy_routes_1 = __importDefault(require("./routes/allergy.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const supplier_routes_1 = __importDefault(require("./routes/supplier.routes"));
const purchase_order_routes_1 = __importDefault(require("./routes/purchase-order.routes"));
const messaging_routes_1 = __importDefault(require("./routes/messaging.routes"));
const reminder_routes_1 = __importDefault(require("./routes/reminder.routes"));
const health_article_routes_1 = __importDefault(require("./routes/health-article.routes"));
const patient_access_routes_1 = __importDefault(require("./routes/patient-access.routes"));
const feedback_routes_1 = __importDefault(require("./routes/feedback.routes"));
const medicalRecords_routes_1 = __importDefault(require("./routes/medicalRecords.routes"));
const inpatient_routes_1 = __importDefault(require("./routes/inpatient.routes"));
class Server {
    constructor(port) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
        this.initializeEmailService();
    }
    initializeEmailService() {
        try {
            const { EmailService } = require('./services/email.service');
            EmailService.initialize();
            console.log('✅ Email service initialized');
        }
        catch (error) {
            console.warn('⚠️  Email service initialization failed:', error);
        }
    }
    // Expose app for integration testing
    getApp() {
        return this.app;
    }
    initializeMiddlewares() {
        // Security headers
        this.app.use((0, helmet_1.default)());
        // Enable CORS
        this.app.use((0, cors_1.default)());
        // Parse JSON bodies
        this.app.use(express_1.default.json());
        // Parse cookies for auth flows (refresh/logout)
        this.app.use((0, cookie_parser_1.default)());
        // Ensure DB connection is initialized for integration flows where start() isn't called.
        // Skip in NODE_ENV==='test' to allow unit/integration tests that mock AppDataSource to run without real DB.
        if (process.env.NODE_ENV !== 'test') {
            this.app.use(async (_req, _res, next) => {
                try {
                    if (!database_1.AppDataSource.isInitialized) {
                        await (0, database_1.createDatabaseConnection)();
                    }
                    next();
                }
                catch (e) {
                    next(e);
                }
            });
            // Dev-only: seed patient portal data (medical records + bills) for a patient
            this.app.post('/api/dev/seed-patient-portal', async (req, res) => {
                if (process.env.NODE_ENV === 'production') {
                    return res.status(403).json({ message: 'Disabled in production' });
                }
                try {
                    const { patientEmail = 'portal.demo.patient@example.com', createIfMissing = true } = req.body || {};
                    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
                    const recRepo = database_1.AppDataSource.getRepository(MedicalRecord_1.MedicalRecord);
                    const billRepo = database_1.AppDataSource.getRepository(Bill_1.Bill);
                    let patient = await userRepo.findOne({ where: { email: patientEmail } });
                    if (!patient && createIfMissing) {
                        patient = new User_1.User();
                        patient.email = patientEmail;
                        patient.firstName = 'Portal';
                        patient.lastName = 'Demo';
                        patient.role = roles_1.UserRole.PATIENT;
                        patient.password = 'patient123';
                        patient.isActive = true;
                        if (typeof patient.hashPassword === 'function')
                            await patient.hashPassword();
                        patient = await userRepo.save(patient);
                    }
                    if (!patient)
                        return res.status(404).json({ message: 'Patient not found by email' });
                    // Ensure there is at least one doctor; create demo doctor if missing
                    let doctor = await userRepo.createQueryBuilder('u').where('u.role = :r', { r: roles_1.UserRole.DOCTOR }).getOne();
                    if (!doctor) {
                        const d = new User_1.User();
                        d.firstName = 'Demo';
                        d.lastName = 'Doctor';
                        d.email = 'doctor.demo@example.com';
                        d.role = roles_1.UserRole.DOCTOR;
                        d.isActive = true;
                        d.password = 'doctor123';
                        if (typeof d.hashPassword === 'function')
                            await d.hashPassword();
                        doctor = await userRepo.save(d);
                    }
                    // Seed a few medical records (skip duplicates by title), and backfill doctor if missing
                    const ensureRecord = async (title, type, plusDays = 0) => {
                        let rec = await recRepo.createQueryBuilder('r').where('r.patient_id = :pid AND r.title = :t', { pid: patient.id, t: title }).getOne();
                        if (!rec) {
                            rec = new MedicalRecord_1.MedicalRecord();
                            rec.patient = patient;
                            rec.type = type;
                            rec.title = title;
                            rec.recordDate = new Date(Date.now() + plusDays * 86400000);
                            rec.description = `${title} description`;
                        }
                        // attach a doctor if missing
                        if (!rec.doctor && doctor) {
                            rec.doctor = doctor;
                        }
                        await recRepo.save(rec);
                    };
                    await ensureRecord('Consultation - General', MedicalRecord_1.RecordType.CONSULTATION, -14);
                    await ensureRecord('Lab Report - CBC', MedicalRecord_1.RecordType.LAB_REPORT, -7);
                    await ensureRecord('Prescription - Antibiotics', MedicalRecord_1.RecordType.PRESCRIPTION, -6);
                    await ensureRecord('Discharge Summary - Day Care', MedicalRecord_1.RecordType.DISCHARGE_SUMMARY, -2);
                    // Seed a few bills (skip duplicates by billNumber)
                    const ensureBill = async (billNumber, amount, status, plusDays = 0) => {
                        const exists = await billRepo.findOne({ where: { billNumber } });
                        if (!exists) {
                            const b = new Bill_1.Bill();
                            b.patient = patient;
                            b.billNumber = billNumber;
                            b.amount = amount;
                            b.paidAmount = status === Bill_1.BillStatus.PAID ? amount : 0;
                            b.status = status;
                            b.billDate = new Date(Date.now() + plusDays * 86400000);
                            b.dueDate = new Date(Date.now() + (plusDays + 10) * 86400000);
                            await billRepo.save(b);
                        }
                    };
                    await ensureBill('INV-1001', 120.0, Bill_1.BillStatus.PAID, -30);
                    await ensureBill('INV-1002', 80.0, Bill_1.BillStatus.PENDING, -5);
                    await ensureBill('INV-1003', 200.0, Bill_1.BillStatus.OVERDUE, -20);
                    const recCount = await recRepo.count({ where: { patient: { id: patient.id } } });
                    const billCount = await billRepo.count({ where: { patient: { id: patient.id } } });
                    return res.json({ message: 'Seeded patient portal data', patient: { email: patient.email, id: patient.id }, counts: { medicalRecords: recCount, bills: billCount } });
                }
                catch (e) {
                    console.error('Seed patient portal error:', e);
                    return res.status(500).json({ message: 'Failed to seed patient portal data' });
                }
            });
            // Dev-only: reset a user's password by email (for quick local testing)
            this.app.post('/api/dev/reset-password', async (req, res) => {
                if (process.env.NODE_ENV === 'production') {
                    return res.status(403).json({ message: 'Disabled in production' });
                }
                try {
                    const { email, newPassword } = req.body || {};
                    if (!email || !newPassword)
                        return res.status(400).json({ message: 'email and newPassword are required' });
                    const repo = database_1.AppDataSource.getRepository(User_1.User);
                    const user = await repo.findOne({ where: { email: String(email).trim().toLowerCase() } });
                    if (!user)
                        return res.status(404).json({ message: 'User not found' });
                    if (String(newPassword).length < 8)
                        return res.status(400).json({ message: 'Password must be at least 8 characters' });
                    user.password = String(newPassword);
                    if (typeof user.hashPassword === 'function')
                        await user.hashPassword();
                    await repo.save(user);
                    return res.json({ message: 'Password reset', email: user.email });
                }
                catch (e) {
                    console.error('Dev reset-password error:', e);
                    return res.status(500).json({ message: 'Failed to reset password' });
                }
            });
        }
        // Serve uploaded files
        const uploadDir = path_1.default.resolve(process.cwd(), 'uploads');
        try {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        catch (_a) { }
        this.app.use('/uploads', express_1.default.static(uploadDir));
        // Logging
        if (process.env.NODE_ENV === 'development') {
            this.app.use((0, morgan_1.default)('dev'));
        }
    }
    initializeRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.status(200).json({ status: 'ok', timestamp: new Date() });
        });
        // Dev-only: seed demo insurance plans (with countries)
        this.app.post('/api/dev/seed-plans', async (req, res) => {
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({ message: 'Disabled in production' });
            }
            try {
                const repo = database_1.AppDataSource.getRepository(Plan_1.Plan);
                let created = 0;
                const ensure = async (name, insurer, coverageLevel, priceMonthly, waitingPeriod, benefits, country) => {
                    const exists = await repo.createQueryBuilder('p')
                        .where('LOWER(p.name) = :n', { n: name.toLowerCase() })
                        .andWhere('LOWER(p.insurer) = :i', { i: insurer.toLowerCase() })
                        .andWhere('p.country = :c', { c: country })
                        .getOne();
                    if (!exists) {
                        const p = repo.create({ name, insurer, coverageLevel, priceMonthly, waitingPeriod, benefits, status: 'active', country });
                        await repo.save(p);
                        created++;
                    }
                };
                await ensure('Essential Care', 'Vhi', 'Basic', 49.99, '26 weeks', ['GP x2', 'ER Cover', 'Day-care'], 'IE');
                await ensure('Silver Plus', 'Laya', 'Standard', 79.99, '16 weeks', ['GP x4', 'Physio x3', 'ER Cover', 'Day-care'], 'IE');
                await ensure('Prime Advantage', 'Irish Life', 'Premium', 119.99, '8 weeks', ['GP unlimited', 'Physio x6', 'Private Room', 'ER Cover'], 'IE');
                await ensure('Care Basic', 'BlueShield', 'Basic', 59.99, '12 weeks', ['PCP x2', 'ER Cover'], 'US');
                await ensure('Arogya Plus', 'StarHealth', 'Standard', 24.99, '30 days', ['OPD x3', 'Day-care', 'AYUSH'], 'IN');
                const count = await repo.count();
                return res.json({ message: created ? 'Seeded plans' : 'Plans already exist', created, count });
            }
            catch (e) {
                console.error('Seed plans error:', e);
                return res.status(500).json({ message: 'Failed to seed plans' });
            }
        });
        // Dev-only: seed baseline services for each department so public pages can display services
        this.app.post('/api/dev/seed-services-by-department', async (req, res) => {
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({ message: 'Disabled in production' });
            }
            try {
                const deptRepo = database_1.AppDataSource.getRepository(Department_1.Department);
                const svcRepo = database_1.AppDataSource.getRepository(Service_1.Service);
                const departments = await deptRepo.find();
                const created = [];
                const ensure = async (dept, names) => {
                    const made = [];
                    for (const name of names) {
                        const exists = await svcRepo.createQueryBuilder('s')
                            .leftJoin('s.department', 'd')
                            .where('LOWER(s.name) = :n', { n: name.toLowerCase() })
                            .andWhere('d.id = :id', { id: dept.id })
                            .getOne();
                        if (!exists) {
                            const s = new Service_1.Service();
                            s.name = name;
                            s.description = `${name} under ${dept.name}`;
                            s.status = 'active';
                            s.averageDuration = 30;
                            s.department = dept;
                            s.departmentId = dept.id;
                            await svcRepo.save(s);
                            made.push(name);
                        }
                    }
                    if (made.length)
                        created.push({ department: dept.name, services: made });
                };
                for (const d of departments) {
                    const n = (d.name || '').toLowerCase();
                    if (n.includes('cardio'))
                        await ensure(d, ['General Consultation', 'ECG', 'Echocardiography']);
                    else if (n.includes('ortho'))
                        await ensure(d, ['General Consultation', 'Physiotherapy', 'Arthroscopy']);
                    else if (n.includes('pedia'))
                        await ensure(d, ['Well-baby Clinic', 'Vaccinations', 'Growth Assessment']);
                    else if (n.includes('derma'))
                        await ensure(d, ['Acne Care', 'Dermatosurgery', 'Allergy Testing']);
                    else if (n.includes('ophthal') || n.includes('eye'))
                        await ensure(d, ['Eye Exam', 'Cataract Surgery', 'Glaucoma Clinic']);
                    else if (n.includes('neuro'))
                        await ensure(d, ['EEG', 'Stroke Clinic', 'Movement Disorders']);
                    else if (n.includes('ent'))
                        await ensure(d, ['Sinus Clinic', 'Audiology', 'Tonsillectomy']);
                    else if (n.includes('gastro'))
                        await ensure(d, ['Endoscopy', 'Colonoscopy', 'Liver Clinic']);
                    else if (n.includes('gyn'))
                        await ensure(d, ['Prenatal Care', 'Fertility Counseling', 'Menstrual Disorders']);
                    else if (n.includes('uro'))
                        await ensure(d, ['Prostate Clinic', 'Stone Management', 'Endoscopy']);
                    else if (n.includes('onco'))
                        await ensure(d, ['Chemotherapy', 'Radiation', 'Immunotherapy']);
                    else if (n.includes('radio'))
                        await ensure(d, ['X-Ray', 'MRI', 'CT Scan']);
                    else if (n.includes('pulmo'))
                        await ensure(d, ['PFT', 'Asthma Clinic', 'Sleep Study']);
                    else if (n.includes('nephro'))
                        await ensure(d, ['Dialysis', 'CKD Clinic', 'Transplant Evaluation']);
                    else
                        await ensure(d, ['General Consultation']);
                }
                return res.json({ message: 'Seeded services by department', created });
            }
            catch (e) {
                console.error('Seed services error:', e);
                return res.status(500).json({ message: 'Failed to seed services' });
            }
        });
        // Dev-only: seed availability slots for all doctors (avoids duplicates)
        this.app.post('/api/dev/seed-availability', async (req, res) => {
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({ message: 'Disabled in production' });
            }
            try {
                const userRepo = database_1.AppDataSource.getRepository(User_1.User);
                const slotRepo = database_1.AppDataSource.getRepository(AvailabilitySlot_1.AvailabilitySlot);
                const doctors = await userRepo.createQueryBuilder('u')
                    .where('u.role = :role', { role: roles_1.UserRole.DOCTOR })
                    .andWhere('u.isActive = true')
                    .getMany();
                // Template: Mon–Fri 09:00–12:00 & 14:00–17:00; Sat 10:00–13:00
                const weekdays = [AvailabilitySlot_1.DayOfWeek.MONDAY, AvailabilitySlot_1.DayOfWeek.TUESDAY, AvailabilitySlot_1.DayOfWeek.WEDNESDAY, AvailabilitySlot_1.DayOfWeek.THURSDAY, AvailabilitySlot_1.DayOfWeek.FRIDAY];
                const saturday = [AvailabilitySlot_1.DayOfWeek.SATURDAY];
                const weekdaySlots = [
                    { start: '09:00', end: '12:00' },
                    { start: '14:00', end: '17:00' },
                ];
                const saturdaySlots = [{ start: '10:00', end: '13:00' }];
                let created = 0;
                for (const d of doctors) {
                    for (const day of weekdays) {
                        for (const tpl of weekdaySlots) {
                            const exists = await slotRepo.createQueryBuilder('s')
                                .leftJoin('s.doctor', 'doc')
                                .where('doc.id = :id', { id: d.id })
                                .andWhere('s.dayOfWeek = :day', { day })
                                .andWhere('s.startTime = :start AND s.endTime = :end', { start: tpl.start, end: tpl.end })
                                .getOne();
                            if (!exists) {
                                const slot = new AvailabilitySlot_1.AvailabilitySlot();
                                slot.doctor = d;
                                slot.dayOfWeek = day;
                                slot.startTime = tpl.start;
                                slot.endTime = tpl.end;
                                slot.isActive = true;
                                await slotRepo.save(slot);
                                created++;
                            }
                        }
                    }
                    for (const day of saturday) {
                        for (const tpl of saturdaySlots) {
                            const exists = await slotRepo.createQueryBuilder('s')
                                .leftJoin('s.doctor', 'doc')
                                .where('doc.id = :id', { id: d.id })
                                .andWhere('s.dayOfWeek = :day', { day })
                                .andWhere('s.startTime = :start AND s.endTime = :end', { start: tpl.start, end: tpl.end })
                                .getOne();
                            if (!exists) {
                                const slot = new AvailabilitySlot_1.AvailabilitySlot();
                                slot.doctor = d;
                                slot.dayOfWeek = day;
                                slot.startTime = tpl.start;
                                slot.endTime = tpl.end;
                                slot.isActive = true;
                                await slotRepo.save(slot);
                                created++;
                            }
                        }
                    }
                }
                return res.json({ message: 'Availability seeded', created, doctors: doctors.length });
            }
            catch (e) {
                console.error('Seed availability error:', e);
                return res.status(500).json({ message: 'Failed to seed availability' });
            }
        });
        // Dev-only: seed dummy doctors for each department (Chief, Senior, Consultant, Practitioner)
        this.app.post('/api/dev/seed-doctors-by-department', async (req, res) => {
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({ message: 'Disabled in production' });
            }
            try {
                const userRepo = database_1.AppDataSource.getRepository(User_1.User);
                const deptRepo = database_1.AppDataSource.getRepository(Department_1.Department);
                let departments = await deptRepo.createQueryBuilder('d').getMany();
                const defaults = [
                    'General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Dermatology',
                    'Ophthalmology', 'Neurology', 'ENT', 'Gastroenterology', 'Gynecology', 'Urology', 'Oncology', 'Radiology', 'Psychiatry', 'Pulmonology', 'Nephrology'
                ];
                // Insert any missing default departments
                const existingNames = new Set((departments || []).map((x) => String(x.name).toLowerCase()));
                for (const name of defaults) {
                    if (!existingNames.has(name.toLowerCase())) {
                        const d = new Department_1.Department();
                        d.name = name;
                        d.description = name + ' department';
                        d.status = 'active';
                        const saved = await deptRepo.save(d);
                        departments.push(saved);
                    }
                }
                const password = 'doctor123';
                const seniorities = ['chief', 'senior', 'consultant', 'practitioner'];
                const toTitle = (s) => s.charAt(0).toUpperCase() + s.slice(1);
                const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const result = [];
                for (const d of departments) {
                    const dep = d;
                    const depSlug = slug(dep.name);
                    const doctorsForDept = [];
                    for (const s of seniorities) {
                        const email = `${depSlug}.${s}@example.com`;
                        const firstName = toTitle(depSlug.replace(/-/g, ' ').split(' ')[0] || 'Doctor');
                        const lastName = toTitle(s);
                        let u = await userRepo.findOne({ where: { email } });
                        if (!u) {
                            u = new User_1.User();
                            u.email = email;
                            u.firstName = firstName;
                            u.lastName = lastName;
                        }
                        u.role = roles_1.UserRole.DOCTOR;
                        u.isActive = true;
                        u.department = dep;
                        u.departmentId = dep.id;
                        u.preferences = Object.assign({}, u.preferences, { seniority: s });
                        u.password = password;
                        if (typeof u.hashPassword === 'function') {
                            await u.hashPassword();
                        }
                        await userRepo.save(u);
                        doctorsForDept.push({ firstName: u.firstName, lastName: u.lastName, email, password, seniority: s });
                    }
                    result.push({ department: { id: dep.id, name: dep.name }, doctors: doctorsForDept });
                }
                return res.json({ message: 'Seeded doctors by department', password, departments: result });
            }
            catch (e) {
                console.error('Seed doctors by department error:', e);
                return res.status(500).json({ message: 'Failed to seed doctors by department' });
            }
        });
        // Dev-only: seed Mumbai doctors with custom names
        this.app.post('/api/dev/seed-mumbai-doctors', async (req, res) => {
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({ message: 'Disabled in production' });
            }
            try {
                const userRepo = database_1.AppDataSource.getRepository(User_1.User);
                const deptRepo = database_1.AppDataSource.getRepository(Department_1.Department);
                // Mumbai doctors data with custom names
                const mumbaiDoctors = [
                    // Cardiology
                    { email: 'cardiology.mum.chief@example.com', firstName: 'Meera', lastName: 'Shah', department: 'Cardiology', seniority: 'chief' },
                    { email: 'cardiology.mum.senior@example.com', firstName: 'Rahul', lastName: 'Desai', department: 'Cardiology', seniority: 'senior' },
                    { email: 'cardiology.mum.consultant@example.com', firstName: 'Kavya', lastName: 'Iyer', department: 'Cardiology', seniority: 'consultant' },
                    { email: 'cardiology.mum.practitioner@example.com', firstName: 'Ajay', lastName: 'Kulkarni', department: 'Cardiology', seniority: 'practitioner' },
                    // General Medicine
                    { email: 'general-medicine.mum.chief@example.com', firstName: 'Anita', lastName: 'Menon', department: 'General Medicine', seniority: 'chief' },
                    { email: 'general-medicine.mum.senior@example.com', firstName: 'Vivek', lastName: 'Patil', department: 'General Medicine', seniority: 'senior' },
                    { email: 'general-medicine.mum.consultant@example.com', firstName: 'Riya', lastName: 'Malhotra', department: 'General Medicine', seniority: 'consultant' },
                    { email: 'general-medicine.mum.practitioner@example.com', firstName: 'Arjun', lastName: 'Bhat', department: 'General Medicine', seniority: 'practitioner' },
                    // Pediatrics
                    { email: 'pediatrics.mum.chief@example.com', firstName: 'Sneha', lastName: 'Kapoor', department: 'Pediatrics', seniority: 'chief' },
                    { email: 'pediatrics.mum.senior@example.com', firstName: 'Nikhil', lastName: 'Rao', department: 'Pediatrics', seniority: 'senior' },
                    { email: 'pediatrics.mum.consultant@example.com', firstName: 'Pooja', lastName: 'Singh', department: 'Pediatrics', seniority: 'consultant' },
                    { email: 'pediatrics.mum.practitioner@example.com', firstName: 'Manav', lastName: 'Kamat', department: 'Pediatrics', seniority: 'practitioner' },
                ];
                const password = 'Doctor@123';
                const created = [];
                for (const doctorData of mumbaiDoctors) {
                    // Find department
                    const dept = await deptRepo.findOne({ where: { name: doctorData.department } });
                    if (!dept) {
                        console.warn(`Department ${doctorData.department} not found, skipping ${doctorData.email}`);
                        continue;
                    }
                    // Check if user already exists
                    let u = await userRepo.findOne({ where: { email: doctorData.email } });
                    if (!u) {
                        u = new User_1.User();
                        u.email = doctorData.email;
                    }
                    u.firstName = doctorData.firstName;
                    u.lastName = doctorData.lastName;
                    u.role = roles_1.UserRole.DOCTOR;
                    u.isActive = true;
                    u.registeredLocation = 'Mumbai';
                    u.department = dept;
                    u.departmentId = dept.id;
                    u.preferences = Object.assign({}, u.preferences, { seniority: doctorData.seniority });
                    u.password = password;
                    if (typeof u.hashPassword === 'function') {
                        await u.hashPassword();
                    }
                    await userRepo.save(u);
                    created.push({
                        email: doctorData.email,
                        name: `${doctorData.firstName} ${doctorData.lastName}`,
                        department: doctorData.department,
                        seniority: doctorData.seniority
                    });
                }
                return res.json({
                    message: 'Mumbai doctors seeded successfully',
                    password,
                    location: 'Mumbai',
                    count: created.length,
                    doctors: created
                });
            }
            catch (e) {
                console.error('Seed Mumbai doctors error:', e);
                return res.status(500).json({ message: 'Failed to seed Mumbai doctors' });
            }
        });
        // Dev-only: seed a demo patient and create an appointment with a doctor (by email)
        this.app.post('/api/dev/seed-patient-for-doctor', async (req, res) => {
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({ message: 'Disabled in production' });
            }
            try {
                const { doctorEmail = 'doctor@example.com', patientEmail = 'patient.demo@example.com', firstName = 'Patient', lastName = 'Demo' } = req.body || {};
                const userRepo = database_1.AppDataSource.getRepository(User_1.User);
                const apptRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
                const serviceRepo = database_1.AppDataSource.getRepository(Service_1.Service);
                const deptRepo = database_1.AppDataSource.getRepository(Department_1.Department);
                const doctor = await userRepo.findOne({ where: { email: doctorEmail } });
                if (!doctor)
                    return res.status(404).json({ message: 'Doctor not found by email' });
                let patient = await userRepo.findOne({ where: { email: patientEmail } });
                if (!patient) {
                    patient = new User_1.User();
                    patient.firstName = firstName;
                    patient.lastName = lastName;
                    patient.email = patientEmail;
                    patient.phone = '0000000000';
                    patient.role = roles_1.UserRole.PATIENT;
                    patient.password = 'patient123';
                    if (typeof patient.hashPassword === 'function')
                        await patient.hashPassword();
                    patient.isActive = true;
                    patient = await userRepo.save(patient);
                }
                // Ensure we have at least one service under some department
                let service = await serviceRepo.createQueryBuilder('s').getOne();
                if (!service) {
                    let dept = await deptRepo.createQueryBuilder('d').getOne();
                    if (!dept) {
                        const nd = new Department_1.Department();
                        nd.name = 'General Medicine';
                        nd.description = 'General department for demo';
                        const savedDept = await deptRepo.save(nd);
                        dept = savedDept;
                    }
                    const s = new Service_1.Service();
                    s.name = 'General Consultation';
                    s.description = 'Demo service';
                    s.status = 'active';
                    s.averageDuration = 30;
                    s.department = dept;
                    s.departmentId = dept.id;
                    service = await serviceRepo.save(s);
                }
                // Create an appointment in the next hour
                const start = new Date(Date.now() + 60 * 60 * 1000);
                const end = new Date(Date.now() + 90 * 60 * 1000);
                const a = new Appointment_1.Appointment();
                a.patient = patient;
                a.doctor = doctor;
                a.service = service;
                a.startTime = start;
                a.endTime = end;
                a.status = Appointment_1.AppointmentStatus.CONFIRMED;
                await apptRepo.save(a);
                return res.json({ message: 'Seeded patient and appointment', doctor: { email: doctorEmail }, patient: { email: patientEmail, password: 'patient123' }, appointment: { id: a.id, startTime: start, endTime: end } });
            }
            catch (e) {
                console.error('Seed patient for doctor error:', e);
                return res.status(500).json({ message: 'Failed to seed patient for doctor' });
            }
        });
        // Dev-only: seed or update a doctor user with a known password for local testing
        this.app.post('/api/dev/seed-doctor', async (req, res) => {
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({ message: 'Disabled in production' });
            }
            try {
                if (process.env.NODE_ENV === 'test') {
                    console.log('[seed-doctor] body:', req.body);
                }
                const { email = 'doctor@example.com', password = 'doctor123', firstName = 'Doctor', lastName = 'User' } = req.body || {};
                if (!password)
                    return res.status(400).json({ message: 'password is required' });
                const repo = database_1.AppDataSource.getRepository(User_1.User);
                if (process.env.NODE_ENV === 'test') {
                    console.log('[seed-doctor] repo ready');
                }
                let user = await repo.findOne({ where: { email } });
                if (process.env.NODE_ENV === 'test') {
                    console.log('[seed-doctor] existing user?', !!user);
                }
                if (!user) {
                    user = new User_1.User();
                    user.email = email;
                    user.firstName = firstName;
                    user.lastName = lastName;
                }
                // Ensure required fields
                if (!user.phone)
                    user.phone = '0000000000';
                user.role = roles_1.UserRole.DOCTOR;
                user.isActive = true;
                user.password = password;
                if (typeof user.hashPassword === 'function') {
                    if (process.env.NODE_ENV === 'test') {
                        console.log('[seed-doctor] hashing password');
                    }
                    await user.hashPassword();
                }
                if (process.env.NODE_ENV === 'test') {
                    console.log('[seed-doctor] saving user');
                }
                await repo.save(user);
                if (process.env.NODE_ENV === 'test') {
                    console.log('[seed-doctor] saved with id:', user.id);
                }
                return res.json({ message: 'Doctor seeded', email, id: user.id });
            }
            catch (e) {
                console.error('Seed doctor error:', e);
                return res.status(500).json({
                    message: 'Failed to seed doctor',
                    ...(process.env.NODE_ENV === 'test' && { error: (e === null || e === void 0 ? void 0 : e.message) || String(e) })
                });
            }
        });
        // Dev-only: seed FR-001 demo data
        this.app.post('/api/dev/seed-fr001-demo', async (req, res) => {
            var _a, _b, _c, _d;
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({ message: 'Disabled in production' });
            }
            try {
                const grantReferral = String(req.query.referral || ((_a = req.body) === null || _a === void 0 ? void 0 : _a.referral) || '').toLowerCase() === '1' || String(((_b = req.body) === null || _b === void 0 ? void 0 : _b.grantReferral) || '') === '1';
                const uniquePatient = String(req.query.unique || ((_c = req.body) === null || _c === void 0 ? void 0 : _c.unique) || '').toLowerCase() === '1';
                const ensureRestricted = String(req.query.ensureRestricted || ((_d = req.body) === null || _d === void 0 ? void 0 : _d.ensureRestricted) || '').toLowerCase() === '1';
                const userRepo = database_1.AppDataSource.getRepository(User_1.User);
                const deptRepo = database_1.AppDataSource.getRepository(Department_1.Department);
                const reportRepo = database_1.AppDataSource.getRepository(Report_1.Report);
                const referralRepo = database_1.AppDataSource.getRepository(Referral_1.Referral);
                // Ensure departments
                const ensureDept = async (name) => {
                    let d = await deptRepo.createQueryBuilder('d').where('LOWER(d.name) = :n', { n: name.toLowerCase() }).getOne();
                    if (!d) {
                        const nd = new Department_1.Department();
                        nd.name = name;
                        nd.description = name + ' department';
                        nd.status = 'active';
                        d = await deptRepo.save(nd);
                    }
                    return d;
                };
                const cardio = await ensureDept('Cardiology');
                const genmed = await ensureDept('General Medicine');
                // Ensure doctor in Cardiology
                let doctor = await userRepo.findOne({ where: { email: 'cardiology.practitioner@example.com' } });
                if (!doctor) {
                    doctor = new User_1.User();
                    doctor.firstName = 'Cardio';
                    doctor.lastName = 'Practitioner';
                    doctor.email = 'cardiology.practitioner@example.com';
                }
                doctor.role = roles_1.UserRole.DOCTOR;
                doctor.department = cardio;
                doctor.departmentId = cardio.id;
                doctor.isActive = true;
                doctor.password = 'doctor123';
                if (typeof doctor.hashPassword === 'function')
                    await doctor.hashPassword();
                doctor = await userRepo.save(doctor);
                // Ensure patient in General Medicine
                const patientEmailSeed = uniquePatient ? `fr001.patient.${Date.now()}@example.com` : 'fr001.patient@example.com';
                let patient = uniquePatient ? undefined : await userRepo.findOne({ where: { email: 'fr001.patient@example.com' } });
                if (!patient) {
                    patient = new User_1.User();
                    patient.firstName = 'FR001';
                    patient.lastName = 'Patient';
                    patient.email = patientEmailSeed;
                    patient.phone = '9999999999';
                    patient.role = roles_1.UserRole.PATIENT;
                    patient.password = 'patient123';
                    if (typeof patient.hashPassword === 'function')
                        await patient.hashPassword();
                    patient.isActive = true;
                }
                patient.primaryDepartment = genmed;
                patient.primaryDepartmentId = genmed.id;
                patient = await userRepo.save(patient);
                // Ensure a sample report for the patient
                let existingReport = await reportRepo.createQueryBuilder('r').where('r.patientId = :pid', { pid: patient.id }).getOne();
                if (!existingReport) {
                    const r = new Report_1.Report();
                    r.patientId = patient.id;
                    r.type = 'note';
                    r.title = 'FR-001 Demo Report';
                    r.content = 'Sample content for FR-001 access control demo.';
                    await reportRepo.save(r);
                }
                // Ensure restricted: remove any existing referrals for this patient so cross-dept access is denied
                if (ensureRestricted) {
                    await referralRepo.createQueryBuilder()
                        .delete()
                        .from(Referral_1.Referral)
                        .where('patient_id = :pid', { pid: patient.id })
                        .execute();
                }
                // Optionally grant referral
                if (grantReferral) {
                    let ref = await referralRepo.findOne({ where: { patientId: patient.id, departmentId: cardio.id } });
                    if (!ref) {
                        const nr = new Referral_1.Referral();
                        nr.patientId = patient.id;
                        nr.departmentId = cardio.id;
                        await referralRepo.save(nr);
                    }
                }
                return res.json({
                    message: 'Seeded FR-001 demo data',
                    doctor: { email: doctor.email, password: 'doctor123', id: doctor.id, department: { id: cardio.id, name: cardio.name } },
                    patient: { email: patient.email, password: 'patient123', id: patient.id, primaryDepartment: { id: genmed.id, name: genmed.name } },
                    referralGranted: grantReferral
                });
            }
            catch (e) {
                console.error('Seed FR-001 demo error:', e);
                return res.status(500).json({ message: 'Failed to seed FR-001 demo' });
            }
        });
        this.app.post('/api/public/appointment-requests', async (req, res, next) => {
            try {
                const { name, phone, email, serviceId, departmentId, departmentName, doctorId, preferredTime, notes } = req.body || {};
                if (!name || !phone) {
                    return res.status(400).json({ message: 'name and phone are required' });
                }
                const userRepo = database_1.AppDataSource.getRepository(User_1.User);
                const apptRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
                const serviceRepo = database_1.AppDataSource.getRepository(Service_1.Service);
                const deptRepo = database_1.AppDataSource.getRepository(Department_1.Department);
                // Find or create patient by email or phone
                let patient = undefined;
                if (email) {
                    patient = await userRepo.findOne({ where: { email } });
                }
                if (!patient) {
                    patient = await userRepo.findOne({ where: { phone } });
                }
                if (!patient) {
                    const [firstName, ...rest] = String(name).trim().split(' ');
                    const lastName = rest.join(' ') || 'Patient';
                    const newUser = new User_1.User();
                    newUser.firstName = firstName || 'Patient';
                    newUser.lastName = lastName || 'User';
                    newUser.email = email || `guest_${Date.now()}@example.com`;
                    newUser.phone = phone;
                    newUser.password = Math.random().toString(36).slice(2) + 'A1!';
                    newUser.role = roles_1.UserRole.PATIENT;
                    newUser.isActive = true;
                    await newUser.hashPassword();
                    patient = await userRepo.save(newUser);
                }
                // Validate or infer service
                let service = undefined;
                if (serviceId) {
                    service = await serviceRepo.findOne({ where: { id: serviceId }, relations: ['department'] });
                }
                else if (departmentId || departmentName) {
                    // Resolve department by ID or by name (case-insensitive)
                    let dept = departmentId ? await deptRepo.findOne({ where: { id: departmentId } }) : undefined;
                    if (!dept && departmentName) {
                        dept = await deptRepo.createQueryBuilder('d')
                            .where('LOWER(d.name) = :n', { n: String(departmentName).toLowerCase() })
                            .getOne();
                    }
                    // If still not found and a name exists, create it
                    if (!dept && departmentName) {
                        const created = new Department_1.Department();
                        created.name = departmentName;
                        created.description = departmentName + ' department';
                        created.status = 'active';
                        dept = await deptRepo.save(created);
                    }
                    if (dept) {
                        // Pick the first service under this department
                        service = await serviceRepo.findOne({ where: { department: { id: dept.id } }, relations: ['department'] });
                        // If no service exists for this department, create a default one
                        if (!service) {
                            const defaultSvc = new Service_1.Service();
                            defaultSvc.name = 'General Consultation';
                            defaultSvc.description = 'Default service for department appointments';
                            defaultSvc.status = 'active';
                            defaultSvc.averageDuration = 30;
                            defaultSvc.department = dept;
                            defaultSvc.departmentId = dept.id;
                            const savedSvc = await serviceRepo.save(defaultSvc);
                            service = await serviceRepo.findOne({ where: { id: savedSvc.id }, relations: ['department'] });
                        }
                    }
                }
                // Compute start/end
                const start = preferredTime ? new Date(preferredTime) : new Date();
                const durationMinutes = (service === null || service === void 0 ? void 0 : service.averageDuration) || 30;
                const end = new Date(start.getTime() + durationMinutes * 60000);
                // Auto-assign doctor if not specified
                let assignedDoctor = null;
                if (doctorId) {
                    assignedDoctor = { id: doctorId };
                }
                else if (service === null || service === void 0 ? void 0 : service.department) {
                    // Auto-assign based on department and seniority
                    const doctorRepo = database_1.AppDataSource.getRepository(User_1.User);
                    const availableDoctors = await doctorRepo
                        .createQueryBuilder('user')
                        .where('user.role = :role', { role: 'doctor' })
                        .andWhere('user.departmentId = :deptId', { deptId: service.department.id })
                        .andWhere('user.isActive = :active', { active: true })
                        .getMany();
                    if (availableDoctors.length > 0) {
                        // Prioritize by seniority: chief > senior > consultant > practitioner
                        const seniorityOrder = ['chief', 'senior', 'consultant', 'practitioner'];
                        availableDoctors.sort((a, b) => {
                            var _a, _b;
                            const aSeniority = ((_a = a.preferences) === null || _a === void 0 ? void 0 : _a.seniority) || 'practitioner';
                            const bSeniority = ((_b = b.preferences) === null || _b === void 0 ? void 0 : _b.seniority) || 'practitioner';
                            const aIndex = seniorityOrder.indexOf(aSeniority);
                            const bIndex = seniorityOrder.indexOf(bSeniority);
                            return aIndex - bIndex;
                        });
                        assignedDoctor = availableDoctors[0];
                    }
                }
                // Create appointment (pending)
                const appointment = new Appointment_1.Appointment();
                appointment.patient = patient;
                if (service)
                    appointment.service = service;
                if (assignedDoctor)
                    appointment.doctor = assignedDoctor;
                appointment.startTime = start;
                appointment.endTime = end;
                appointment.status = Appointment_1.AppointmentStatus.PENDING;
                appointment.notes = notes;
                const saved = await apptRepo.save(appointment);
                const full = await apptRepo.findOne({ where: { id: saved.id }, relations: ['patient', 'doctor', 'service'] });
                return res.status(201).json({ status: 'received', appointmentId: saved.id, appointment: full });
            }
            catch (err) {
                next(err);
            }
        });
        // API routes
        this.app.use('/api/auth', auth_routes_1.default);
        this.app.use('/api/services', service_routes_1.default);
        this.app.use('/api/departments', department_routes_1.default);
        this.app.use('/api/appointments', appointment_routes_1.default);
        this.app.use('/api/users', user_routes_1.default);
        this.app.use('/api', report_routes_1.default);
        this.app.use('/api/patient-portal', patient_portal_routes_1.default);
        this.app.use('/api/availability', availability_routes_1.default);
        this.app.use('/api', referral_routes_1.default);
        this.app.use('/api', insurance_routes_1.default);
        this.app.use('/api/pharmacy', pharmacy_1.default);
        this.app.use('/api/patient-access', patient_access_routes_1.default);
        this.app.use('/api/emergency', emergency_routes_1.default);
        this.app.use('/api/callback', callback_routes_1.default);
        this.app.use('/api/notifications', notification_routes_1.default);
        this.app.use('/api/consultations', consultation_routes_1.default);
        this.app.use('/api/diagnoses', diagnosis_routes_1.default);
        this.app.use('/api/vital-signs', vital_signs_routes_1.default);
        this.app.use('/api/allergies', allergy_routes_1.default);
        this.app.use('/api/inventory', inventory_routes_1.default);
        this.app.use('/api/suppliers', supplier_routes_1.default);
        this.app.use('/api/purchase-orders', purchase_order_routes_1.default);
        this.app.use('/api/messages', messaging_routes_1.default);
        this.app.use('/api/reminders', reminder_routes_1.default);
        this.app.use('/api/health-articles', health_article_routes_1.default);
        this.app.use('/api/feedback', feedback_routes_1.default);
        this.app.use('/api/medical-records', medicalRecords_routes_1.default);
        this.app.use('/api/inpatient', inpatient_routes_1.default);
        // Laboratory Management routes
        const labRoutes = require('./routes/lab.routes').default;
        this.app.use('/api/lab', labRoutes);
        // Analytics routes
        const analyticsRoutes = require('./routes/analytics.routes').default;
        this.app.use('/api/analytics', analyticsRoutes);
        // Public routes (no auth)
        this.app.get('/api/public/doctors', async (_req, res, next) => {
            try {
                const repo = database_1.AppDataSource.getRepository(User_1.User);
                const qb = repo.createQueryBuilder('u')
                    .leftJoinAndSelect('u.department', 'department')
                    .where('u.role = :role', { role: roles_1.UserRole.DOCTOR })
                    .select(['u.id', 'u.firstName', 'u.lastName', 'u.email', 'u.phone', 'u.profileImage', 'u.preferences', 'department.id', 'department.name'])
                    .orderBy('u.firstName', 'ASC');
                const doctors = await qb.getMany();
                const payload = doctors.map((d) => {
                    var _a;
                    return ({
                        id: d.id,
                        firstName: d.firstName,
                        lastName: d.lastName,
                        email: d.email,
                        phone: d.phone,
                        profileImage: d.profileImage,
                        department: d.department ? { id: d.department.id, name: d.department.name } : null,
                        // Expose seniority directly for simpler frontend filtering
                        seniority: (((_a = d.preferences) === null || _a === void 0 ? void 0 : _a.seniority) ? String(d.preferences.seniority) : undefined)
                    });
                });
                res.json({ data: payload });
            }
            catch (err) {
                next(err);
            }
        });
        this.app.post('/api/public/emergency', async (req, res, next) => {
            try {
                const { name, phone, message, location } = req.body || {};
                if (!name || !phone) {
                    return res.status(400).json({ message: 'name and phone are required' });
                }
                const repo = database_1.AppDataSource.getRepository(EmergencyRequest_1.EmergencyRequest);
                const er = new EmergencyRequest_1.EmergencyRequest();
                er.name = name;
                er.phone = phone;
                er.message = message;
                er.location = location;
                const saved = await repo.save(er);
                res.status(201).json({ status: 'received', id: saved.id });
            }
            catch (err) {
                next(err);
            }
        });
        this.app.post('/api/public/request-callback', async (req, res, next) => {
            try {
                const { name, phone, department, preferredTime, message } = req.body || {};
                if (!name || !phone) {
                    return res.status(400).json({ message: 'name and phone are required' });
                }
                const repo = database_1.AppDataSource.getRepository(CallbackRequest_1.CallbackRequest);
                const cr = new CallbackRequest_1.CallbackRequest();
                cr.name = name;
                cr.phone = phone;
                cr.department = department;
                cr.preferredTime = preferredTime;
                cr.message = message;
                const saved = await repo.save(cr);
                res.status(201).json({ status: 'received', id: saved.id });
            }
            catch (err) {
                next(err);
            }
        });
        // Simple public chat endpoint (MVP) with file-based persistence
        const chatStorePath = path_1.default.resolve(process.cwd(), 'uploads', 'chat-sessions.json');
        const loadChatStore = () => {
            try {
                const raw = fs_1.default.readFileSync(chatStorePath, 'utf8');
                return JSON.parse(raw) || {};
            }
            catch (_a) {
                return {};
            }
        };
        const saveChatStore = (obj) => {
            try {
                fs_1.default.writeFileSync(chatStorePath, JSON.stringify(obj));
            }
            catch (_a) { }
        };
        this.app.post('/api/public/chat', async (req, res) => {
            try {
                const { message = '', sessionId } = req.body || {};
                const text = String(message || '').toLowerCase();
                const suggestions = [
                    { label: 'Book Appointment', url: '/appointments/book' },
                    { label: 'Find Doctors', url: '/doctors' },
                    { label: 'Services', url: '/services' },
                    { label: 'Request Callback', url: '/request-callback' },
                    { label: 'Emergency 24/7', url: '/emergency' },
                ];
                let reply = 'I can help with appointments, doctors, services, and emergencies. Ask me anything!';
                // Persist USER message
                if (sessionId) {
                    const store = loadChatStore();
                    store[sessionId] = store[sessionId] || [];
                    store[sessionId].push({ role: 'user', text: String(message || ''), ts: Date.now() });
                    saveChatStore(store);
                }
                // Emergency first
                if (/(emergency|help now|urgent|bleeding|unconscious)/.test(text)) {
                    reply = 'If this is an emergency, please call 1800-000-9999 immediately or visit /emergency.';
                    // Persist ASSISTANT reply
                    if (sessionId) {
                        const store = loadChatStore();
                        store[sessionId] = store[sessionId] || [];
                        store[sessionId].push({ role: 'assistant', text: reply, ts: Date.now() });
                        saveChatStore(store);
                    }
                    return res.json({ reply, suggestions, sessionId });
                }
                // Generic intents
                if (/(book|appointment|schedule)/.test(text)) {
                    reply = 'To book an appointment, go to /appointments/book. Tell me your symptoms if you want a department suggestion.';
                    return res.json({ reply, suggestions, sessionId });
                }
                if (/(doctor|specialist|physician)/.test(text)) {
                    reply = 'Find doctors and filter by department at /doctors. Share your symptoms to get a department suggestion.';
                    return res.json({ reply, suggestions, sessionId });
                }
                if (/(service|treatment|procedure)/.test(text)) {
                    reply = 'Browse all services at /services. You can search and filter by department or status.';
                    return res.json({ reply, suggestions, sessionId });
                }
                if (/(time|hours|open|opening|closing)/.test(text)) {
                    reply = 'We operate 24/7 for emergencies. OPD hours vary by department; please check /services or /doctors for availability.';
                    return res.json({ reply, suggestions, sessionId });
                }
                if (/(contact|phone|call|number)/.test(text)) {
                    reply = 'You can reach us at 1800-000-9999 or request a callback at /request-callback.';
                    if (sessionId) {
                        const store = loadChatStore();
                        store[sessionId] = store[sessionId] || [];
                        store[sessionId].push({ role: 'assistant', text: reply, ts: Date.now() });
                        saveChatStore(store);
                    }
                    return res.json({ reply, suggestions, sessionId });
                }
                // Symptom to department mapping
                const maps = [
                    { rx: /(chest pain|palpitation|breathless|ecg|bp high)/, dept: 'Cardiology' },
                    { rx: /(fracture|bone|joint|sprain|knee|shoulder|back pain)/, dept: 'Orthopedics' },
                    { rx: /(fever|cough|cold|flu|general check|headache)/, dept: 'General Medicine' },
                    { rx: /(pregnan|gyneco|gynaeco|menstru|period|women|obstetric)/, dept: 'Gynecology' },
                    { rx: /(kidney|urine|urology|stones)/, dept: 'Urology' },
                    { rx: /(cancer|tumor|oncology)/, dept: 'Oncology' },
                    { rx: /(mental|anxiety|depress|psychiat)/, dept: 'Psychiatry' },
                    { rx: /(skin|derma|rash|acne|eczema)/, dept: 'Dermatology' },
                    { rx: /(child|pediatric|kid)/, dept: 'Pediatrics' },
                    { rx: /(stroke|numb|weak side|slurred speech|seizure|epilepsy)/, dept: 'Neurology' },
                ];
                const found = maps.find(m => m.rx.test(text));
                if (found) {
                    reply = `Based on your symptoms, ${found.dept} may be appropriate. You can find doctors under this department at /doctors and book an appointment at /appointments/book.`;
                    if (sessionId) {
                        const store = loadChatStore();
                        store[sessionId] = store[sessionId] || [];
                        store[sessionId].push({ role: 'assistant', text: reply, ts: Date.now() });
                        saveChatStore(store);
                    }
                    return res.json({ reply, suggestions, department: found.dept, sessionId });
                }
                // Default
                if (sessionId) {
                    const store = loadChatStore();
                    store[sessionId] = store[sessionId] || [];
                    store[sessionId].push({ role: 'assistant', text: reply, ts: Date.now() });
                    saveChatStore(store);
                }
                return res.json({ reply, suggestions, sessionId });
            }
            catch (e) {
                return res.status(200).json({ reply: 'Sorry, something went wrong. Please try again.' });
            }
        });
        // Retrieve chat history for a session
        this.app.get('/api/public/chat/history', async (req, res) => {
            const sessionId = String(req.query.sessionId || '');
            if (!sessionId)
                return res.status(400).json({ message: 'sessionId is required' });
            const store = loadChatStore();
            const history = store[sessionId] || [];
            return res.json({ sessionId, history });
        });
        // Clear chat session
        this.app.delete('/api/public/chat/session', async (req, res) => {
            const sessionId = String(req.query.sessionId || '');
            if (!sessionId)
                return res.status(400).json({ message: 'sessionId is required' });
            const store = loadChatStore();
            delete store[sessionId];
            saveChatStore(store);
            return res.json({ status: 'cleared', sessionId });
        });
        // Admin listings
        this.app.get('/api/admin/emergency-requests', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin']), async (req, res, next) => {
            var _a, _b;
            try {
                const page = Math.max(1, parseInt(String(((_a = req.query.page) !== null && _a !== void 0 ? _a : '1')), 10) || 1);
                const limit = Math.min(100, Math.max(1, parseInt(String(((_b = req.query.limit) !== null && _b !== void 0 ? _b : '20')), 10) || 20));
                const repo = database_1.AppDataSource.getRepository(EmergencyRequest_1.EmergencyRequest);
                const [data, total] = await repo.findAndCount({ order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
                res.json({ data, meta: { page, limit, total } });
            }
            catch (err) {
                next(err);
            }
        });
        this.app.get('/api/admin/callback-requests', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin']), async (req, res, next) => {
            var _a, _b;
            try {
                const page = Math.max(1, parseInt(String(((_a = req.query.page) !== null && _a !== void 0 ? _a : '1')), 10) || 1);
                const limit = Math.min(100, Math.max(1, parseInt(String(((_b = req.query.limit) !== null && _b !== void 0 ? _b : '20')), 10) || 20));
                const repo = database_1.AppDataSource.getRepository(CallbackRequest_1.CallbackRequest);
                const [data, total] = await repo.findAndCount({ order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
                res.json({ data, meta: { page, limit, total } });
            }
            catch (err) {
                next(err);
            }
        });
        // Dev-only: seed or update an admin user with a known password for local bootstrap
        this.app.post('/api/dev/seed-admin', async (req, res) => {
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({ message: 'Disabled in production' });
            }
            try {
                const { email = 'admin@example.com', password = 'admin123', firstName = 'Admin', lastName = 'User' } = req.body || {};
                if (!password)
                    return res.status(400).json({ message: 'password is required' });
                const repo = database_1.AppDataSource.getRepository(User_1.User);
                let user = await repo.findOne({ where: { email } });
                if (!user) {
                    user = new User_1.User();
                    user.email = email;
                    user.firstName = firstName;
                    user.lastName = lastName;
                }
                user.role = roles_1.UserRole.ADMIN;
                user.isActive = true;
                user.password = password;
                if (typeof user.hashPassword === 'function') {
                    await user.hashPassword();
                }
                await repo.save(user);
                return res.json({ message: 'Admin seeded', email });
            }
            catch (e) {
                console.error('Seed admin error:', e);
                return res.status(500).json({ message: 'Failed to seed admin' });
            }
        });
        // Apply error middleware
        this.app.use(error_middleware_1.errorMiddleware);
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({ message: 'Not Found' });
        });
    }
    initializeErrorHandling() {
        // Error handling middleware
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            const status = err.status || 500;
            res.status(status).json({
                message: err.message || 'Internal Server Error',
                ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
            });
        });
    }
    async start() {
        try {
            // Initialize database connection
            await (0, database_1.createDatabaseConnection)();
            // Initialize email service
            try {
                const { EmailService } = require('./services/email.service');
                EmailService.initialize();
                console.log('✅ Email service initialized');
            }
            catch (error) {
                console.warn('⚠️  Email service initialization failed:', error);
            }
            // Initialize appointment reminder job
            try {
                const { initializeAppointmentReminderJob } = require('./jobs/appointment-reminder.job');
                initializeAppointmentReminderJob();
            }
            catch (error) {
                console.warn('⚠️  Appointment reminder job initialization failed:', error);
            }
            // Setup Swagger documentation
            if (process.env.NODE_ENV !== 'production') {
                (0, swagger_1.setupSwagger)(this.app);
            }
            this.app.listen(this.port, () => {
                console.log(`Server is running on port ${this.port}`);
                if (process.env.NODE_ENV !== 'production') {
                    console.log(`API Documentation available at http://localhost:${this.port}/api-docs`);
                }
                console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            });
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
}
exports.Server = Server;
// Start the server if this file is run directly
if (require.main === module) {
    const port = parseInt(process.env.PORT || '3000');
    const server = new Server(port);
    server.start();
}
