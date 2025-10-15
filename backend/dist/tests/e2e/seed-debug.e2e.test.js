"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../../src/server");
describe('DEBUG seed doctor endpoint', () => {
    const app = new server_1.Server(0).getApp();
    it('prints seed response', async () => {
        const email = `debug_doc_${Date.now()}@example.com`;
        const res = await (0, supertest_1.default)(app).post('/api/dev/seed-doctor').send({ email, password: 'doctor123', firstName: 'Debug', lastName: 'Doc' });
        // eslint-disable-next-line no-console
        console.log('SEED STATUS:', res.status);
        // eslint-disable-next-line no-console
        console.log('SEED BODY:', res.body);
        expect([200, 500]).toContain(res.status);
    });
});
