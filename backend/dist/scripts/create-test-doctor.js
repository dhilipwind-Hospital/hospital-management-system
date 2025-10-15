"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const roles_1 = require("../types/roles");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
async function createTestDoctor() {
    try {
        // Initialize database connection
        await database_1.AppDataSource.initialize();
        console.log('Connected to PostgreSQL');
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        // Check if user already exists
        const existingUser = await userRepo.findOne({
            where: { email: 'ortho.chief@example.com' }
        });
        if (existingUser) {
            console.log('Test doctor already exists. Updating password...');
            // Update password
            const hashedPassword = await bcryptjs_1.default.hash('Ortho@2025', 10);
            existingUser.password = hashedPassword;
            existingUser.role = roles_1.UserRole.DOCTOR;
            existingUser.firstName = 'Rahul';
            existingUser.lastName = 'Mehta';
            await userRepo.save(existingUser);
            console.log('Test doctor password updated successfully.');
        }
        else {
            // Create new test doctor
            const hashedPassword = await bcryptjs_1.default.hash('Ortho@2025', 10);
            const testDoctor = userRepo.create({
                email: 'ortho.chief@example.com',
                password: hashedPassword,
                firstName: 'Rahul',
                lastName: 'Mehta',
                phone: '1234567890',
                role: roles_1.UserRole.DOCTOR
            });
            await userRepo.save(testDoctor);
            console.log('Test doctor created successfully.');
        }
        console.log('Login credentials:');
        console.log('Email: ortho.chief@example.com');
        console.log('Password: Ortho@2025');
    }
    catch (error) {
        console.error('Error creating test doctor:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
createTestDoctor();
