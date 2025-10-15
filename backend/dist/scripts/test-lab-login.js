"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = 'http://localhost:5001/api';
async function testLabLogin() {
    var _a, _b, _c, _d, _e, _f;
    try {
        console.log('🔐 Testing lab tech login...');
        console.log('Email: labtech@hospital.com');
        console.log('Password: LabTech@123\n');
        const response = await axios_1.default.post(`${API_URL}/auth/login`, {
            email: 'labtech@hospital.com',
            password: 'LabTech@123'
        });
        console.log('✅ Login successful!');
        console.log('\nUser data:');
        console.log('- Email:', (_a = response.data.user) === null || _a === void 0 ? void 0 : _a.email);
        console.log('- Role:', (_b = response.data.user) === null || _b === void 0 ? void 0 : _b.role);
        console.log('- Name:', (_c = response.data.user) === null || _c === void 0 ? void 0 : _c.firstName, (_d = response.data.user) === null || _d === void 0 ? void 0 : _d.lastName);
        console.log('- Active:', (_e = response.data.user) === null || _e === void 0 ? void 0 : _e.isActive);
        console.log('\nToken received:', !!response.data.accessToken);
    }
    catch (error) {
        console.error('❌ Login failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Message:', ((_f = error.response.data) === null || _f === void 0 ? void 0 : _f.message) || error.response.data);
        }
        else {
            console.error('Error:', error.message);
        }
    }
}
testLabLogin();
