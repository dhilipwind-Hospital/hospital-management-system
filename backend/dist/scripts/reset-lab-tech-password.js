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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const bcrypt = __importStar(require("bcryptjs"));
const API_URL = 'http://localhost:5001/api';
async function resetLabTechPassword() {
    var _a, _b, _c, _d;
    try {
        console.log('🔑 Resetting lab tech password...\n');
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
        console.log('📋 Found user:', labTech.email);
        // Hash the password
        const hashedPassword = await bcrypt.hash('LabTech@123', 10);
        console.log('🔐 Password hashed');
        // Update password
        console.log('\n🔄 Updating password...');
        await axios_1.default.put(`${API_URL}/users/${labTech.id}`, {
            password: hashedPassword,
            role: 'lab_technician',
            isActive: true
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Password updated successfully!');
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
resetLabTechPassword();
