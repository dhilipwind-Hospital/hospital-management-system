"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../../src/server");
describe('E2E Public Booking (real DB)', () => {
    const app = new server_1.Server(0).getApp();
    it('creates a pending appointment from public booking (departmentName flow)', async () => {
        var _a, _b;
        const res = await (0, supertest_1.default)(app).post('/api/public/appointment-requests').send({
            name: 'E2E Patient',
            phone: '9000000000',
            departmentName: 'Cardiology',
            preferredTime: new Date().toISOString(),
            notes: 'Chest pain'
        });
        expect(res.status).toBe(201);
        expect((_a = res.body) === null || _a === void 0 ? void 0 : _a.status).toBe('received');
        expect((_b = res.body) === null || _b === void 0 ? void 0 : _b.appointmentId).toBeTruthy();
    });
    it('returns 400 on missing required fields', async () => {
        const res = await (0, supertest_1.default)(app).post('/api/public/appointment-requests').send({ name: '', phone: '' });
        expect(res.status).toBe(400);
    });
});
