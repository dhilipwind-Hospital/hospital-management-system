"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../models/User");
async function checkLabTech() {
    try {
        await database_1.AppDataSource.initialize();
        const repo = database_1.AppDataSource.getRepository(User_1.User);
        const user = await repo.findOne({ where: { email: 'labtech@hospital.com' } });
        if (user) {
            console.log('✅ User found:');
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Active:', user.isActive);
            console.log('Has password:', !!user.password);
            console.log('First Name:', user.firstName);
            console.log('Last Name:', user.lastName);
        }
        else {
            console.log('❌ User not found');
        }
        await database_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('Error:', error);
    }
}
checkLabTech();
