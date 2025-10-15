"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../server");
// In-memory tables
const services = [];
const departments = [];
const doctors = [];
const emergencyRequests = [];
const callbackRequests = [];
const serviceRepo = {
    createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: function () { return this; },
        where: function () { return this; },
        andWhere: function () { return this; },
        skip: function () { return this; },
        take: function () { return this; },
        getManyAndCount: async () => [services, services.length],
    })),
    findOne: jest.fn(async ({ where }) => services.find(s => s.id === (where === null || where === void 0 ? void 0 : where.id)) || null),
};
const deptRepo = {
    findOne: jest.fn(async ({ where }) => departments.find(d => d.id === (where === null || where === void 0 ? void 0 : where.id)) || null),
};
const emergencyRepo = {
    save: jest.fn(async (e) => { e.id = e.id || `er_${Math.random().toString(36).slice(2)}`; emergencyRequests.push(e); return e; }),
};
const callbackRepo = {
    save: jest.fn(async (c) => { c.id = c.id || `cb_${Math.random().toString(36).slice(2)}`; callbackRequests.push(c); return c; }),
};
const userRepo = {
    createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: function () { return this; },
        where: function () { return this; },
        select: function () { return this; },
        orderBy: function () { return this; },
        getMany: async () => doctors,
    })),
};
jest.mock('../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn((entity) => {
            const name = entity === null || entity === void 0 ? void 0 : entity.name;
            if (name === 'Service')
                return serviceRepo;
            if (name === 'Department')
                return deptRepo;
            if (name === 'User')
                return userRepo;
            if (name === 'EmergencyRequest')
                return emergencyRepo;
            if (name === 'CallbackRequest')
                return callbackRepo;
            return {};
        }),
    },
}));
beforeEach(() => {
    services.length = 0;
    departments.length = 0;
    doctors.length = 0;
    emergencyRequests.length = 0;
    callbackRequests.length = 0;
    jest.clearAllMocks();
    // seed sample
    departments.push({ id: 'dep1', name: 'Cardiology' });
    services.push({ id: 'svc1', name: 'ECG', description: 'Test', status: 'active', department: departments[0] });
    doctors.push({ id: 'doc1', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', department: { id: 'dep1', name: 'Cardiology' } });
});
describe('Public integration tests', () => {
    it('lists services (public)', async () => {
        var _a, _b, _c, _d;
        const app = new server_1.Server(0).getApp();
        const res = await (0, supertest_1.default)(app).get('/api/services');
        expect(res.status).toBe(200);
        expect(Array.isArray((_a = res.body) === null || _a === void 0 ? void 0 : _a.data)).toBe(true);
        expect((_b = res.body) === null || _b === void 0 ? void 0 : _b.data.length).toBe(1);
        expect((_d = (_c = res.body) === null || _c === void 0 ? void 0 : _c.data[0]) === null || _d === void 0 ? void 0 : _d.name).toBe('ECG');
    });
    it('creates emergency request (public)', async () => {
        var _a;
        const app = new server_1.Server(0).getApp();
        const res = await (0, supertest_1.default)(app).post('/api/public/emergency').send({ name: 'John', phone: '123', message: 'help' });
        expect(res.status).toBe(201);
        expect((_a = res.body) === null || _a === void 0 ? void 0 : _a.status).toBe('received');
        expect(emergencyRequests.length).toBe(1);
    });
    it('creates callback request (public)', async () => {
        var _a;
        const app = new server_1.Server(0).getApp();
        const res = await (0, supertest_1.default)(app).post('/api/public/request-callback').send({ name: 'John', phone: '123', department: 'Cardiology' });
        expect(res.status).toBe(201);
        expect((_a = res.body) === null || _a === void 0 ? void 0 : _a.status).toBe('received');
        expect(callbackRequests.length).toBe(1);
    });
    it('lists public doctors', async () => {
        var _a, _b, _c;
        const app = new server_1.Server(0).getApp();
        const res = await (0, supertest_1.default)(app).get('/api/public/doctors');
        expect(res.status).toBe(200);
        expect(Array.isArray((_a = res.body) === null || _a === void 0 ? void 0 : _a.data)).toBe(true);
        expect((_c = (_b = res.body) === null || _b === void 0 ? void 0 : _b.data[0]) === null || _c === void 0 ? void 0 : _c.firstName).toBe('Jane');
    });
});
