"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = 'http://localhost:5001/api';
async function fixLabTechRole() {
    var _a, _b, _c, _d;
    try {
        console.log('🔧 Fixing lab tech role...\n');
        // Login as admin
        const loginResponse = await axios_1.default.post(`${API_URL}/auth/login`, {
            email: 'admin@hospital.com',
            password: 'Admin@2025'
        });
        const adminToken = loginResponse.data.accessToken;
        console.log('✅ Logged in as admin\n');
        // Get all users
        const usersResponse = await axios_1.default.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${adminToken}` },
            params: { limit: 100 }
        });
        const users = usersResponse.data.data || [];
        const labTech = users.find((u) => u.email === 'labtech@hospital.com');
        if (!labTech) {
            console.log('❌ Lab tech user not found');
            return;
        }
        console.log('📋 Found user:');
        console.log('- ID:', labTech.id);
        console.log('- Email:', labTech.email);
        console.log('- Current Role:', labTech.role);
        console.log('- Active:', labTech.isActive);
        // Update role
        console.log('\n🔄 Updating role to lab_technician...');
        await axios_1.default.put(`${API_URL}/users/${labTech.id}`, {
            role: 'lab_technician',
            isActive: true
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Role updated successfully!');
        // Test login
        console.log('\n🔐 Testing login...');
        const testLogin = await axios_1.default.post(`${API_URL}/auth/login`, {
            email: 'labtech@hospital.com',
            password: 'LabTech@123'
        });
        console.log('✅ Login successful!');
        console.log('- Role:', (_a = testLogin.data.user) === null || _a === void 0 ? void 0 : _a.role);
        console.log('- Name:', (_b = testLogin.data.user) === null || _b === void 0 ? void 0 : _b.firstName, (_c = testLogin.data.user) === null || _c === void 0 ? void 0 : _c.lastName);
        console.log('\n🎉 Lab tech account is ready!');
        console.log('\n📋 Login credentials:');
        console.log('   Email:    labtech@hospital.com');
        console.log('   Password: LabTech@123');
    }
    catch (error) {
        console.error('❌ Error:', ((_d = error.response) === null || _d === void 0 ? void 0 : _d.data) || error.message);
    }
}
fixLabTechRole();
