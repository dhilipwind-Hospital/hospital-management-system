"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../../src/server");
describe('E2E Availability (real DB)', () => {
    const app = new server_1.Server(0).getApp();
    const email = `doc_av_${Date.now()}@example.com`;
    const password = 'doctor123';
    let doctorId = '';
    let accessToken = '';
    let slotId = '';
    it('seeds a doctor and logs in', async () => {
        var _a, _b;
        // seed a doctor
        const seed = await (0, supertest_1.default)(app).post('/api/dev/seed-doctor').send({ email, password, firstName: 'Doc', lastName: 'Avail' });
        expect(seed.status).toBe(200);
        // find the doctor id by public doctors list
        const doctors = await (0, supertest_1.default)(app).get('/api/public/doctors');
        expect(doctors.status).toBe(200);
        const found = (((_a = doctors.body) === null || _a === void 0 ? void 0 : _a.data) || []).find((d) => d.email === email);
        expect(found).toBeDefined();
        doctorId = found.id;
        // login
        const login = await (0, supertest_1.default)(app).post('/api/auth/login').send({ email, password });
        expect(login.status).toBe(200);
        accessToken = (_b = login.body) === null || _b === void 0 ? void 0 : _b.accessToken;
        expect(accessToken).toBeTruthy();
    });
    it('public GET: doctor availability (initially empty or seeded)', async () => {
        var _a;
        const res = await (0, supertest_1.default)(app).get(`/api/availability/doctors/${doctorId}`);
        expect(res.status).toBe(200);
        expect(Array.isArray((_a = res.body) === null || _a === void 0 ? void 0 : _a.data)).toBe(true);
    });
    it('doctor creates own availability slot', async () => {
        var _a, _b;
        const res = await (0, supertest_1.default)(app)
            .post('/api/availability')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ doctorId, dayOfWeek: 'monday', startTime: '10:00', endTime: '12:00' });
        expect(res.status).toBe(201);
        slotId = (_b = (_a = res.body) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.id;
        expect(slotId).toBeTruthy();
    });
    it('doctor updates own availability slot', async () => {
        var _a, _b;
        const res = await (0, supertest_1.default)(app)
            .put(`/api/availability/${slotId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ notes: 'E2E updated' });
        expect(res.status).toBe(200);
        expect((_b = (_a = res.body) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.notes).toBe('E2E updated');
    });
    it('doctor views my-schedule', async () => {
        var _a;
        const res = await (0, supertest_1.default)(app)
            .get('/api/availability/my-schedule')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray((_a = res.body) === null || _a === void 0 ? void 0 : _a.data)).toBe(true);
    });
    it('doctor deletes own availability slot', async () => {
        const res = await (0, supertest_1.default)(app)
            .delete(`/api/availability/${slotId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.status).toBe(204);
    });
});
