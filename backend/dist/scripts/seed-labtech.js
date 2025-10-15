"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = 'http://localhost:5001/api';
async function seedLabTech() {
    var _a, _b, _c, _d, _e;
    try {
        console.log('🔐 Logging in as admin...');
        const loginResponse = await axios_1.default.post(`${API_URL}/auth/login`, {
            email: 'admin@hospital.com',
            password: 'Admin@2025'
        });
        const token = loginResponse.data.accessToken;
        console.log('✅ Logged in successfully\n');
        console.log('👨‍🔬 Creating lab technician account...');
        const labTechData = {
            email: 'labtech@hospital.com',
            password: 'password',
            firstName: 'Lab',
            lastName: 'Technician',
            role: 'lab_technician',
            phone: '+1234567890',
            isActive: true,
            permissions: []
        };
        try {
            const response = await axios_1.default.post(`${API_URL}/users`, labTechData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Lab technician created successfully!');
            console.log('\n📋 Lab Technician Account:');
            console.log('   Email:    labtech@hospital.com');
            console.log('   Password: password');
            console.log('   Role:     Lab Technician');
        }
        catch (error) {
            if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 400 && ((_d = (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.includes('already exists'))) {
                console.log('ℹ️  Lab technician account already exists - updating password...');
                // Try to update the password via admin
                try {
                    // First, get the user ID
                    const usersResponse = await axios_1.default.get(`${API_URL}/users?email=labtech@hospital.com`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const labTechUser = usersResponse.data.find((u) => u.email === 'labtech@hospital.com');
                    if (labTechUser) {
                        await axios_1.default.patch(`${API_URL}/users/${labTechUser.id}`, { password: 'password' }, { headers: { Authorization: `Bearer ${token}` } });
                        console.log('✅ Password updated successfully!');
                    }
                }
                catch (updateError) {
                    console.log('⚠️  Could not update password automatically');
                }
                console.log('\n📋 Lab Technician Account:');
                console.log('   Email:    labtech@hospital.com');
                console.log('   Password: password');
                console.log('   Role:     Lab Technician');
            }
            else {
                throw error;
            }
        }
        console.log('\n🎉 Setup complete!');
    }
    catch (error) {
        console.error('❌ Error:', ((_e = error.response) === null || _e === void 0 ? void 0 : _e.data) || error.message);
    }
}
seedLabTech();
