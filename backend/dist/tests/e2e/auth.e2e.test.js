"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../../src/server");
describe('E2E Auth (real DB)', () => {
    const app = new server_1.Server(0).getApp();
    const email = `e2e_user_${Date.now()}@example.com`;
    const password = 'StrongP@ss1';
    it('registers a new user', async () => {
        var _a, _b;
        const res = await (0, supertest_1.default)(app).post('/api/auth/register').send({
            firstName: 'E2E',
            lastName: 'User',
            email,
            phone: '1000000000',
            password,
            confirmPassword: password,
        });
        expect(res.status).toBe(201);
        expect((_b = (_a = res.body) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.email).toBe(email);
    });
    it('logins, refreshes token, and logs out', async () => {
        var _a, _b, _c;
        const login = await (0, supertest_1.default)(app).post('/api/auth/login').send({ email, password });
        expect(login.status).toBe(200);
        const accessToken = (_a = login.body) === null || _a === void 0 ? void 0 : _a.accessToken;
        const refreshToken = (_b = login.body) === null || _b === void 0 ? void 0 : _b.refreshToken;
        expect(accessToken).toBeTruthy();
        expect(refreshToken).toBeTruthy();
        // refresh
        const refresh = await (0, supertest_1.default)(app).post('/api/auth/refresh-token').send({ refreshToken });
        expect(refresh.status).toBe(200);
        expect((_c = refresh.body) === null || _c === void 0 ? void 0 : _c.accessToken).toBeTruthy();
        // logout
        const logout = await (0, supertest_1.default)(app).post('/api/auth/logout').send({ refreshToken });
        expect(logout.status).toBe(200);
    });
});
