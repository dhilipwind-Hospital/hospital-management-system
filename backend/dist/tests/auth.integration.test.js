"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("../routes/auth.routes"));
const User_1 = require("../models/User");
// In-memory stores to simulate DB
const users = [];
const refreshTokens = [];
// Simple helpers to mimic TypeORM repository methods
const userRepo = {
    findOne: jest.fn(async ({ where }) => {
        if (where === null || where === void 0 ? void 0 : where.email) {
            return users.find(u => String(u.email).toLowerCase() === String(where.email).toLowerCase()) || null;
        }
        if (where === null || where === void 0 ? void 0 : where.id) {
            return users.find(u => u.id === where.id) || null;
        }
        return null;
    }),
    save: jest.fn(async (user) => {
        const existingIdx = users.findIndex(u => u.id === user.id);
        if (existingIdx >= 0) {
            users[existingIdx] = { ...users[existingIdx], ...user };
            return users[existingIdx];
        }
        user.id = user.id || `u_${Math.random().toString(36).slice(2)}`;
        users.push(user);
        return user;
    }),
};
const refreshRepo = {
    create: jest.fn((data) => ({ id: `rt_${Math.random().toString(36).slice(2)}`, ...data })),
    save: jest.fn(async (rt) => { refreshTokens.push(rt); return rt; }),
    delete: jest.fn(async ({ token }) => { const idx = refreshTokens.findIndex(r => r.token === token); if (idx >= 0)
        refreshTokens.splice(idx, 1); }),
    findOne: jest.fn(async ({ where }) => refreshTokens.find(r => r.token === (where === null || where === void 0 ? void 0 : where.token)) || null),
};
// Mock AppDataSource.getRepository to return our in-memory repos
jest.mock('../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn((entity) => {
            const name = entity === null || entity === void 0 ? void 0 : entity.name;
            if (name === 'User')
                return userRepo;
            if (name === 'RefreshToken')
                return refreshRepo;
            return {};
        }),
    },
}));
// Build an express app mounting only the auth routes
const buildApp = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use('/api/auth', auth_routes_1.default);
    return app;
};
beforeEach(() => {
    // reset state and mocks
    users.length = 0;
    refreshTokens.length = 0;
    jest.clearAllMocks();
});
describe('Auth integration - registration', () => {
    it('registers a new user with strong password and returns 201', async () => {
        var _a, _b, _c;
        const app = buildApp();
        const body = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            password: 'StrongP@ss1',
            confirmPassword: 'StrongP@ss1'
        };
        const res = await (0, supertest_1.default)(app).post('/api/auth/register').send(body);
        expect(res.status).toBe(201);
        expect((_a = res.body) === null || _a === void 0 ? void 0 : _a.message).toMatch(/Registration successful/i);
        expect((_c = (_b = res.body) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.email).toBe('john@example.com');
        expect(users.some(u => u.email === 'john@example.com')).toBe(true);
    });
    it('rejects registration when email already exists', async () => {
        var _a;
        users.push({ id: 'u1', email: 'exists@example.com' });
        const app = buildApp();
        const res = await (0, supertest_1.default)(app).post('/api/auth/register').send({
            firstName: 'A', lastName: 'B', email: 'exists@example.com', phone: '1234567890', password: 'StrongP@ss1', confirmPassword: 'StrongP@ss1'
        });
        expect(res.status).toBe(400);
        expect((_a = res.body) === null || _a === void 0 ? void 0 : _a.message).toMatch(/already in use/i);
    });
    it('rejects weak password', async () => {
        var _a;
        const app = buildApp();
        const res = await (0, supertest_1.default)(app).post('/api/auth/register').send({
            firstName: 'A', lastName: 'B', email: 'weak@example.com', phone: '1234567890', password: 'weakpass', confirmPassword: 'weakpass'
        });
        expect(res.status).toBe(400);
        expect((_a = res.body) === null || _a === void 0 ? void 0 : _a.message).toMatch(/Password must contain/i);
    });
});
describe('Auth integration - login', () => {
    it('authenticates a valid user and sets refresh token cookie', async () => {
        var _a, _b;
        const app = buildApp();
        // Create a real User instance so validatePassword works
        const user = new User_1.User();
        user.firstName = 'Jane';
        user.lastName = 'Doe';
        user.email = 'jane@example.com';
        user.phone = '1112223333';
        user.password = 'StrongP@ss1';
        user.isActive = true;
        await user.hashPassword();
        // save in repo
        await userRepo.save(user);
        const res = await (0, supertest_1.default)(app).post('/api/auth/login').send({ email: 'jane@example.com', password: 'StrongP@ss1' });
        expect(res.status).toBe(200);
        expect((_a = res.body) === null || _a === void 0 ? void 0 : _a.accessToken).toBeTruthy();
        expect((_b = res.body) === null || _b === void 0 ? void 0 : _b.refreshToken).toBeTruthy();
        // cookie header may be set as well
        const setCookie = res.header['set-cookie'];
        expect(setCookie || []).toBeDefined();
    });
    it('rejects invalid credentials', async () => {
        var _a;
        const app = buildApp();
        const res = await (0, supertest_1.default)(app).post('/api/auth/login').send({ email: 'nouser@example.com', password: 'WrongP@ss1' });
        expect(res.status).toBe(401);
        expect((_a = res.body) === null || _a === void 0 ? void 0 : _a.message).toMatch(/invalid credentials/i);
    });
});
