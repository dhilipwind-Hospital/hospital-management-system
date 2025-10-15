"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const Department_1 = require("../models/Department");
const roles_1 = require("../types/roles");
(async () => {
    const ds = await database_1.AppDataSource.initialize();
    const userRepo = ds.getRepository(User_1.User);
    const deptRepo = ds.getRepository(Department_1.Department);
    const email = process.env.SEED_DOCTOR_EMAIL || 'doc@example.com';
    const password = process.env.SEED_DOCTOR_PASSWORD || 'Doctor@123';
    // Ensure a department exists
    let department = await deptRepo.findOne({ where: { name: 'General Medicine' } });
    if (!department) {
        const newDept = new Department_1.Department();
        newDept.name = 'General Medicine';
        newDept.description = 'General medical services';
        department = await deptRepo.save(newDept);
        console.log('Created General Medicine department');
    }
    const existing = await userRepo.findOne({ where: { email } });
    let doctor;
    if (!existing) {
        const payload = {
            firstName: 'Doctor',
            lastName: 'User',
            email,
            phone: '9999999998',
            password,
            role: roles_1.UserRole.DOCTOR,
            isActive: true,
            departmentId: department.id,
        };
        doctor = userRepo.create(payload);
        await doctor.hashPassword();
        await userRepo.save(doctor);
        console.log(`Created doctor user: ${email}`);
    }
    else {
        doctor = existing;
        doctor.role = roles_1.UserRole.DOCTOR;
        doctor.password = password;
        doctor.departmentId = department.id;
        doctor.isActive = true;
        await doctor.hashPassword();
        await userRepo.save(doctor);
        console.log(`Updated doctor user: ${email}`);
    }
    await ds.destroy();
})().catch(async (e) => {
    console.error('Doctor seeding failed:', e);
    try {
        await database_1.AppDataSource.destroy();
    }
    catch (_a) { }
    process.exit(1);
});
