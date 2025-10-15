"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../server");
// Mock auth to switch roles per test
jest.mock('../middleware/auth.middleware', () => ({
    authenticate: (req, _res, next) => { req.user = req.user || { id: 'doc-uuid-1111-4aaa-8bbb-cccccccccccc', role: 'doctor', isActive: true }; next(); },
    authorize: (_roles) => (_req, _res, next) => next(),
}));
// In-memory tables
const availabilitySlots = [];
const users = [];
const availRepo = {
    find: jest.fn(async ({ where, order }) => {
        var _a;
        const doctorId = (_a = where === null || where === void 0 ? void 0 : where.doctor) === null || _a === void 0 ? void 0 : _a.id;
        const active = where === null || where === void 0 ? void 0 : where.isActive;
        let list = availabilitySlots.filter(s => { var _a; return (!doctorId || ((_a = s.doctor) === null || _a === void 0 ? void 0 : _a.id) === doctorId) && (typeof active === 'undefined' || s.isActive === active); });
        if ((order === null || order === void 0 ? void 0 : order.startTime) === 'ASC')
            list = list.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
        return list;
    }),
    findOne: jest.fn(async ({ where }) => availabilitySlots.find(s => s.id === (where === null || where === void 0 ? void 0 : where.id)) || null),
    create: jest.fn((slot) => ({ id: slot.id || `slot_${Math.random().toString(36).slice(2)}`, isActive: true, ...slot })),
    save: jest.fn(async (slot) => { const idx = availabilitySlots.findIndex(s => s.id === slot.id); if (idx >= 0)
        availabilitySlots[idx] = { ...availabilitySlots[idx], ...slot };
    else
        availabilitySlots.push(slot); return slot; }),
    remove: jest.fn(async (slot) => { const idx = availabilitySlots.findIndex(s => s.id === slot.id); if (idx >= 0)
        availabilitySlots.splice(idx, 1); }),
};
const userRepo = {
    findOne: jest.fn(async ({ where }) => users.find(u => u.id === (where === null || where === void 0 ? void 0 : where.id) && (!(where === null || where === void 0 ? void 0 : where.role) || u.role === where.role)) || null),
};
jest.mock('../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn((entity) => {
            const name = entity === null || entity === void 0 ? void 0 : entity.name;
            if (name === 'AvailabilitySlot')
                return availRepo;
            if (name === 'User')
                return userRepo;
            return {};
        }),
    },
}));
beforeEach(() => {
    availabilitySlots.length = 0;
    users.length = 0;
    jest.clearAllMocks();
    // seed a doctor
    users.push({ id: 'doc-uuid-1111-4aaa-8bbb-cccccccccccc', role: 'doctor' });
    // seed a public slot for GET
    availabilitySlots.push({ id: 's1', doctor: { id: 'doc-uuid-1111-4aaa-8bbb-cccccccccccc' }, isActive: true, dayOfWeek: 'monday', startTime: '09:00', endTime: '12:00' });
});
describe('Availability integration', () => {
    it('public: lists doctor slots by UUID', async () => {
        var _a, _b;
        const app = new server_1.Server(0).getApp();
        const res = await (0, supertest_1.default)(app).get('/api/availability/doctors/doc-uuid-1111-4aaa-8bbb-cccccccccccc');
        expect(res.status).toBe(200);
        expect(Array.isArray((_a = res.body) === null || _a === void 0 ? void 0 : _a.data)).toBe(true);
        expect((_b = res.body) === null || _b === void 0 ? void 0 : _b.data.length).toBeGreaterThan(0);
    });
    it('doctor: can create own availability slot', async () => {
        var _a, _b, _c;
        const app = new server_1.Server(0).getApp();
        const body = { doctorId: 'doc-uuid-1111-4aaa-8bbb-cccccccccccc', dayOfWeek: 'tuesday', startTime: '10:00', endTime: '12:00' };
        // authenticate mock sets req.user with same id by default
        const res = await (0, supertest_1.default)(app).post('/api/availability').set('Authorization', 'Bearer t').send(body);
        expect(res.status).toBe(201);
        expect((_c = (_b = (_a = res.body) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.doctor) === null || _c === void 0 ? void 0 : _c.id).toBe(body.doctorId);
    });
    it('doctor: cannot create slot for another doctor (403)', async () => {
        const app = new server_1.Server(0).getApp();
        // another doctor id
        users.push({ id: 'doc-uuid-2222-4aaa-8bbb-cccccccccccc', role: 'doctor' });
        const body = { doctorId: 'doc-uuid-2222-4aaa-8bbb-cccccccccccc', dayOfWeek: 'wednesday', startTime: '13:00', endTime: '15:00' };
        const res = await (0, supertest_1.default)(app).post('/api/availability').set('Authorization', 'Bearer t').send(body);
        expect(res.status).toBe(403);
    });
    it('doctor: can view my-schedule', async () => {
        var _a;
        const app = new server_1.Server(0).getApp();
        const res = await (0, supertest_1.default)(app).get('/api/availability/my-schedule').set('Authorization', 'Bearer t');
        expect(res.status).toBe(200);
        expect(Array.isArray((_a = res.body) === null || _a === void 0 ? void 0 : _a.data)).toBe(true);
    });
});
