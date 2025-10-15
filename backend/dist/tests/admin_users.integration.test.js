"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_routes_1 = __importDefault(require("../routes/user.routes"));
// Mock auth to inject admin
jest.mock('../middleware/auth.middleware', () => ({
    authenticate: (_req, _res, next) => { _req.user = { id: 'admin1', role: 'admin', isActive: true }; next(); },
    authorize: (_roles) => (_req, _res, next) => next(),
}));
const users = [];
const userRepo = {
    createQueryBuilder: jest.fn(() => ({
        orderBy: function () { return this; },
        skip: function () { return this; },
        take: function () { return this; },
        andWhere: function () { return this; },
        andHaving: function () { return this; },
        getManyAndCount: async () => [users, users.length],
    })),
};
jest.mock('../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn((entity) => {
            const name = entity === null || entity === void 0 ? void 0 : entity.name;
            if (name === 'User')
                return userRepo;
            return {};
        }),
    },
}));
const buildApp = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use('/api/users', user_routes_1.default);
    return app;
};
beforeEach(() => {
    users.length = 0;
    jest.clearAllMocks();
    users.push({ id: 'u1', firstName: 'Alice', lastName: 'A', email: 'a@example.com', phone: '1', isActive: true });
    users.push({ id: 'u2', firstName: 'Bob', lastName: 'B', email: 'b@example.com', phone: '2', isActive: true });
});
describe('Admin users integration', () => {
    it('lists users as admin', async () => {
        var _a, _b, _c;
        const app = buildApp();
        const res = await (0, supertest_1.default)(app).get('/api/users');
        expect(res.status).toBe(200);
        expect(Array.isArray((_a = res.body) === null || _a === void 0 ? void 0 : _a.data)).toBe(true);
        expect((_c = (_b = res.body) === null || _b === void 0 ? void 0 : _b.pagination) === null || _c === void 0 ? void 0 : _c.total).toBe(2);
    });
});
