"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = 'http://localhost:5001/api';
async function createLabTechViaRegister() {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        console.log('👨‍🔬 Creating lab technician via registration...\n');
        // First try to register
        try {
            const registerResponse = await axios_1.default.post(`${API_URL}/auth/register`, {
                email: 'labtech@hospital.com',
                password: 'LabTech@123',
                confirmPassword: 'LabTech@123',
                firstName: 'Lab',
                lastName: 'Technician',
                phone: '+1234567890'
            });
            console.log('✅ User registered successfully!');
            console.log('User ID:', (_a = registerResponse.data.user) === null || _a === void 0 ? void 0 : _a.id);
            // Now update the role to lab_technician
            console.log('\n🔄 Updating role to lab_technician...');
            const loginResponse = await axios_1.default.post(`${API_URL}/auth/login`, {
                email: 'admin@hospital.com',
                password: 'Admin@2025'
            });
            const adminToken = loginResponse.data.accessToken;
            const userId = registerResponse.data.user.id;
            await axios_1.default.put(`${API_URL}/users/${userId}`, {
                role: 'lab_technician'
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('✅ Role updated to lab_technician!');
        }
        catch (error) {
            if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 400 && ((_e = (_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.includes('already exists'))) {
                console.log('ℹ️  User already exists, updating role...');
                // Login as admin and find the user
                const loginResponse = await axios_1.default.post(`${API_URL}/auth/login`, {
                    email: 'admin@hospital.com',
                    password: 'Admin@2025'
                });
                const adminToken = loginResponse.data.accessToken;
                // Get users and find lab tech
                const usersResponse = await axios_1.default.get(`${API_URL}/users`, {
                    headers: { Authorization: `Bearer ${adminToken}` },
                    params: { email: 'labtech@hospital.com' }
                });
                const users = usersResponse.data.data || [];
                const labTech = users.find((u) => u.email === 'labtech@hospital.com');
                if (labTech) {
                    await axios_1.default.put(`${API_URL}/users/${labTech.id}`, {
                        role: 'lab_technician',
                        isActive: true
                    }, {
                        headers: { Authorization: `Bearer ${adminToken}` }
                    });
                    console.log('✅ Role updated to lab_technician!');
                }
            }
            else {
                throw error;
            }
        }
        console.log('\n📋 Lab Technician Account:');
        console.log('   Email:    labtech@hospital.com');
        console.log('   Password: LabTech@123');
        console.log('   Role:     Lab Technician');
        console.log('\n🎉 Setup complete!');
        // Test login
        console.log('\n🔐 Testing login...');
        const testLogin = await axios_1.default.post(`${API_URL}/auth/login`, {
            email: 'labtech@hospital.com',
            password: 'LabTech@123'
        });
        console.log('✅ Login test successful!');
        console.log('Role:', (_f = testLogin.data.user) === null || _f === void 0 ? void 0 : _f.role);
    }
    catch (error) {
        console.error('❌ Error:', ((_g = error.response) === null || _g === void 0 ? void 0 : _g.data) || error.message);
    }
}
createLabTechViaRegister();
