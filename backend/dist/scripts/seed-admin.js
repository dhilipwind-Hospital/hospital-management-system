"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const roles_1 = require("../types/roles");
(async () => {
    const ds = await database_1.AppDataSource.initialize();
    const repo = ds.getRepository(User_1.User);
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
    const existing = await repo.findOne({ where: { email } });
    let admin;
    if (!existing) {
        const payload = {
            firstName: 'Admin',
            lastName: 'User',
            email,
            phone: '9999999999',
            password,
            role: roles_1.UserRole.ADMIN,
            isActive: true,
        };
        admin = repo.create(payload);
        await admin.hashPassword();
        await repo.save(admin);
        console.log(`Created admin user: ${email}`);
    }
    else {
        admin = existing;
        admin.role = roles_1.UserRole.ADMIN;
        admin.password = password;
        await admin.hashPassword();
        await repo.save(admin);
        console.log(`Updated admin user: ${email}`);
    }
    await ds.destroy();
})().catch(async (e) => {
    console.error('Admin seeding failed:', e);
    try {
        await database_1.AppDataSource.destroy();
    }
    catch (_a) { }
    process.exit(1);
});
