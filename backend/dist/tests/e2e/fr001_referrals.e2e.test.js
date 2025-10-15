"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../../src/server");
describe('E2E FR-001 + Referrals (real DB)', () => {
    const app = new server_1.Server(0).getApp();
    const doctorEmail = 'cardiology.practitioner@example.com';
    const doctorPassword = 'doctor123';
    const patientEmail = 'fr001.patient@example.com';
    let accessToken = '';
    let patientId = '';
    it('seeds FR-001 demo without referral (doctor: Cardiology, patient: General Medicine)', async () => {
        var _a, _b;
        const res = await (0, supertest_1.default)(app).post('/api/dev/seed-fr001-demo?referral=0');
        expect(res.status).toBe(200);
        patientId = (_b = (_a = res.body) === null || _a === void 0 ? void 0 : _a.patient) === null || _b === void 0 ? void 0 : _b.id;
        expect(patientId).toBeTruthy();
    });
    it('doctor logs in', async () => {
        var _a;
        const login = await (0, supertest_1.default)(app).post('/api/auth/login').send({ email: doctorEmail, password: doctorPassword });
        expect(login.status).toBe(200);
        accessToken = (_a = login.body) === null || _a === void 0 ? void 0 : _a.accessToken;
        expect(accessToken).toBeTruthy();
    });
    it('reports list is denied (403) before referral', async () => {
        const res = await (0, supertest_1.default)(app)
            .get(`/api/patients/${patientId}/reports`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.status).toBe(403);
    });
    it('seed an appointment between doctor and patient, then create referral, then access is allowed', async () => {
        var _a, _b;
        // Create an appointment so doctor is considered treated-patient and allowed to create referral
        const seedAppt = await (0, supertest_1.default)(app).post('/api/dev/seed-patient-for-doctor').send({ doctorEmail, patientEmail });
        expect(seedAppt.status).toBe(200);
        // Get doctor department id via /users/me
        const me = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${accessToken}`);
        expect(me.status).toBe(200);
        const departmentId = (_b = (_a = me.body) === null || _a === void 0 ? void 0 : _a.department) === null || _b === void 0 ? void 0 : _b.id;
        expect(departmentId).toBeTruthy();
        // Create referral as doctor for the patient
        const createRef = await (0, supertest_1.default)(app)
            .post(`/api/patients/${patientId}/referrals/doctor`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ departmentId });
        expect(createRef.status === 200 || createRef.status === 201).toBeTruthy();
        // Now access patient reports should be allowed
        const allowed = await (0, supertest_1.default)(app)
            .get(`/api/patients/${patientId}/reports`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(allowed.status).toBe(200);
        expect(Array.isArray(allowed.body)).toBe(true);
    });
});
