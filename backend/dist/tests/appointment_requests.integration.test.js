"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../server");
// In-memory tables
const users = [];
const departments = [];
const services = [];
const appointments = [];
const userRepo = {
    findOne: jest.fn(async ({ where }) => {
        if (where === null || where === void 0 ? void 0 : where.email)
            return users.find(u => u.email === where.email) || null;
        if (where === null || where === void 0 ? void 0 : where.phone)
            return users.find(u => u.phone === where.phone) || null;
        if (where === null || where === void 0 ? void 0 : where.id)
            return users.find(u => u.id === where.id) || null;
        return null;
    }),
    save: jest.fn(async (u) => { if (!u.id)
        u.id = `u_${Math.random().toString(36).slice(2)}`; users.push(u); return u; }),
};
const deptRepo = {
    createQueryBuilder: jest.fn(() => ({
        where: function (_cond, params) {
            const n = String(params.n || '').toLowerCase();
            this._match = n;
            return this;
        },
        getOne: async function () {
            return departments.find(d => String(d.name).toLowerCase() === this._match) || null;
        }
    })),
    findOne: jest.fn(async ({ where }) => departments.find(d => d.id === (where === null || where === void 0 ? void 0 : where.id)) || null),
    save: jest.fn(async (d) => { if (!d.id)
        d.id = `dep_${Math.random().toString(36).slice(2)}`; departments.push(d); return d; }),
};
const serviceRepo = {
    findOne: jest.fn(async ({ where, relations }) => {
        var _a;
        if (where === null || where === void 0 ? void 0 : where.id)
            return services.find(s => s.id === where.id) || null;
        if ((_a = where === null || where === void 0 ? void 0 : where.department) === null || _a === void 0 ? void 0 : _a.id)
            return services.find(s => s.departmentId === where.department.id) || null;
        return null;
    }),
    save: jest.fn(async (s) => { var _a; if (!s.id)
        s.id = `svc_${Math.random().toString(36).slice(2)}`; services.push({ ...s, departmentId: s.departmentId || ((_a = s.department) === null || _a === void 0 ? void 0 : _a.id) }); return s; }),
};
const apptRepo = {
    save: jest.fn(async (a) => { if (!a.id)
        a.id = `appt_${Math.random().toString(36).slice(2)}`; appointments.push(a); return a; }),
    findOne: jest.fn(async ({ where, relations }) => appointments.find(a => a.id === (where === null || where === void 0 ? void 0 : where.id)) || null),
};
jest.mock('../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn((entity) => {
            const name = entity === null || entity === void 0 ? void 0 : entity.name;
            if (name === 'User')
                return userRepo;
            if (name === 'Department')
                return deptRepo;
            if (name === 'Service')
                return serviceRepo;
            if (name === 'Appointment')
                return apptRepo;
            return {};
        }),
    },
}));
beforeEach(() => {
    users.length = 0;
    departments.length = 0;
    services.length = 0;
    appointments.length = 0;
    jest.clearAllMocks();
});
describe('Public appointment requests', () => {
    it('creates a pending appointment from public booking (happy path)', async () => {
        var _a;
        const app = new server_1.Server(0).getApp();
        // Pre-seed a department to be found by name
        departments.push({ id: 'dep1', name: 'Cardiology', description: 'Cardio' });
        const res = await (0, supertest_1.default)(app).post('/api/public/appointment-requests').send({
            name: 'John Patient',
            phone: '9999999999',
            departmentName: 'Cardiology',
            preferredTime: new Date().toISOString(),
            notes: 'Chest pain'
        });
        expect(res.status).toBe(201);
        expect((_a = res.body) === null || _a === void 0 ? void 0 : _a.status).toBe('received');
        expect(appointments.length).toBe(1);
        expect(users.length).toBe(1); // patient created
        expect(services.length).toBeGreaterThanOrEqual(1); // default service created if missing
    });
    it('returns 400 when missing required fields', async () => {
        const app = new server_1.Server(0).getApp();
        const res = await (0, supertest_1.default)(app).post('/api/public/appointment-requests').send({ phone: '' });
        expect(res.status).toBe(400);
    });
});
