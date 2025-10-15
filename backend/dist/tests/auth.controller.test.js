"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_controller_1 = require("../controllers/auth.controller");
const database_1 = require("../config/database");
jest.mock('../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));
const createRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
};
describe('AuthController.register', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    it('returns 400 when passwords do not match', async () => {
        const req = { body: { firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '1234567890', password: 'Abcd1234!', confirmPassword: 'Mismatch1!' } };
        const res = createRes();
        await auth_controller_1.AuthController.register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('do not match') }));
    });
    it('returns 400 when password is weak', async () => {
        const req = { body: { firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '1234567890', password: 'weakpass', confirmPassword: 'weakpass' } };
        const res = createRes();
        await auth_controller_1.AuthController.register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Password must contain') }));
    });
    it('returns 400 when email already in use', async () => {
        database_1.AppDataSource.getRepository.mockReturnValue({
            findOne: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com' }),
        });
        const req = { body: { firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '1234567890', password: 'Abcd1234!', confirmPassword: 'Abcd1234!' } };
        const res = createRes();
        await auth_controller_1.AuthController.register(req, res);
        expect(database_1.AppDataSource.getRepository).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('already in use') }));
    });
});
