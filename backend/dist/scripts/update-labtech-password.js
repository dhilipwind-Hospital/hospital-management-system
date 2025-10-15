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
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const bcrypt = __importStar(require("bcryptjs"));
async function updateLabTechPassword() {
    try {
        console.log('🔄 Initializing database connection...');
        await database_1.AppDataSource.initialize();
        console.log('✅ Database connected\n');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        console.log('🔍 Finding lab technician account...');
        const labTech = await userRepository.findOne({
            where: { email: 'labtech@hospital.com' }
        });
        if (!labTech) {
            console.log('❌ Lab technician account not found!');
            console.log('Creating new account...\n');
            const hashedPassword = await bcrypt.hash('password', 10);
            const newLabTech = userRepository.create({
                email: 'labtech@hospital.com',
                password: hashedPassword,
                firstName: 'Lab',
                lastName: 'Technician',
                role: 'lab_technician',
                phone: '+1234567890',
                isActive: true
            });
            await userRepository.save(newLabTech);
            console.log('✅ Lab technician account created successfully!');
        }
        else {
            console.log('✅ Lab technician found\n');
            console.log('🔐 Updating password...');
            const hashedPassword = await bcrypt.hash('password', 10);
            labTech.password = hashedPassword;
            await userRepository.save(labTech);
            console.log('✅ Password updated successfully!');
        }
        console.log('\n📋 Lab Technician Account Details:');
        console.log('   Email:    labtech@hospital.com');
        console.log('   Password: password');
        console.log('   Role:     Lab Technician');
        console.log('\n🎉 Setup complete!');
        await database_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
updateLabTechPassword();
