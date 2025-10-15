"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const access_middleware_1 = require("../middleware/access.middleware");
const database_1 = require("../config/database");
jest.mock('../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));
const qbMock = (result) => {
    const chain = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(result),
    };
    return chain;
};
const mockRepo = (overrides = {}) => ({
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    ...overrides,
});
const setRepos = (repos) => {
    database_1.AppDataSource.getRepository.mockImplementation((entity) => {
        var _a;
        const name = (entity === null || entity === void 0 ? void 0 : entity.name) || ((_a = entity === null || entity === void 0 ? void 0 : entity.constructor) === null || _a === void 0 ? void 0 : _a.name);
        if (name === 'User')
            return repos.user;
        if (name === 'Referral')
            return repos.referral;
        if (name === 'Appointment')
            return repos.appointment;
        return mockRepo();
    });
};
const userDoctor = { id: 'doc1', role: 'doctor', departmentId: 'D1' };
const userPatient = { id: 'pat1', role: 'patient', primaryDepartmentId: 'D1' };
describe('canDoctorAccessPatient', () => {
    beforeEach(() => jest.resetAllMocks());
    it('allows access when doctor and patient share primary department', async () => {
        const userRepo = mockRepo({
            findOne: jest
                .fn()
                .mockResolvedValueOnce(userDoctor)
                .mockResolvedValueOnce(userPatient),
        });
        setRepos({ user: userRepo, referral: mockRepo(), appointment: mockRepo({ createQueryBuilder: jest.fn(() => qbMock(undefined)) }) });
        const ok = await (0, access_middleware_1.canDoctorAccessPatient)('pat1', 'doc1');
        expect(ok).toBe(true);
    });
    it('allows access when a referral exists to doctor department', async () => {
        const userRepo = mockRepo({ findOne: jest.fn().mockResolvedValueOnce({ ...userDoctor, departmentId: 'D2' }).mockResolvedValueOnce({ ...userPatient, primaryDepartmentId: 'D3' }) });
        const referralRepo = mockRepo({ findOne: jest.fn().mockResolvedValue({ id: 'ref1' }) });
        setRepos({ user: userRepo, referral: referralRepo, appointment: mockRepo({ createQueryBuilder: jest.fn(() => qbMock(undefined)) }) });
        const ok = await (0, access_middleware_1.canDoctorAccessPatient)('pat1', 'doc1');
        expect(ok).toBe(true);
    });
    it('allows access when there is an appointment (treated-patient)', async () => {
        const userRepo = mockRepo({ findOne: jest.fn().mockResolvedValueOnce({ ...userDoctor, departmentId: 'D4' }).mockResolvedValueOnce({ ...userPatient, primaryDepartmentId: 'D3' }) });
        const apptRepo = mockRepo({ createQueryBuilder: jest.fn(() => qbMock({ id: 'a1' })) });
        setRepos({ user: userRepo, referral: mockRepo({ findOne: jest.fn().mockResolvedValue(undefined) }), appointment: apptRepo });
        const ok = await (0, access_middleware_1.canDoctorAccessPatient)('pat1', 'doc1');
        expect(ok).toBe(true);
    });
    it('denies access when no department/referral/appointment match', async () => {
        const userRepo = mockRepo({ findOne: jest.fn().mockResolvedValueOnce({ ...userDoctor, departmentId: 'D9' }).mockResolvedValueOnce({ ...userPatient, primaryDepartmentId: 'D3' }) });
        setRepos({ user: userRepo, referral: mockRepo({ findOne: jest.fn().mockResolvedValue(undefined) }), appointment: mockRepo({ createQueryBuilder: jest.fn(() => qbMock(undefined)) }) });
        const ok = await (0, access_middleware_1.canDoctorAccessPatient)('pat1', 'doc1');
        expect(ok).toBe(false);
    });
    it('denies access if user is not a doctor', async () => {
        const userRepo = mockRepo({ findOne: jest.fn().mockResolvedValueOnce({ id: 'doc1', role: 'patient' }).mockResolvedValueOnce(userPatient) });
        setRepos({ user: userRepo, referral: mockRepo(), appointment: mockRepo() });
        const ok = await (0, access_middleware_1.canDoctorAccessPatient)('pat1', 'doc1');
        expect(ok).toBe(false);
    });
});
describe('enforcePatientReportAccess', () => {
    beforeEach(() => jest.resetAllMocks());
    it('bypasses for admin', async () => {
        const middleware = (0, access_middleware_1.enforcePatientReportAccess)((req) => { var _a; return (_a = req.params) === null || _a === void 0 ? void 0 : _a.patientId; });
        const req = { user: { id: '1', role: 'admin' }, params: { patientId: 'pat1' } };
        const res = {};
        const next = jest.fn();
        await middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });
    it('allows when doctor shares primary department with patient', async () => {
        // Mock repos so canDoctorAccessPatient resolves true via primary dept rule
        const userRepo = mockRepo({
            findOne: jest
                .fn()
                .mockResolvedValueOnce({ id: 'doc1', role: 'doctor', departmentId: 'D1' }) // doctor
                .mockResolvedValueOnce({ id: 'pat1', role: 'patient', primaryDepartmentId: 'D1' }), // patient
        });
        const referralRepo = mockRepo({ findOne: jest.fn().mockResolvedValue(undefined) });
        const apptRepo = mockRepo({ createQueryBuilder: jest.fn(() => qbMock(undefined)) });
        setRepos({ user: userRepo, referral: referralRepo, appointment: apptRepo });
        const middleware = (0, access_middleware_1.enforcePatientReportAccess)((req) => { var _a; return (_a = req.params) === null || _a === void 0 ? void 0 : _a.patientId; });
        const req = { user: { id: 'doc1', role: 'doctor' }, params: { patientId: 'pat1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        await middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });
    it('denies with 403 when doctor lacks department relationship/referral/appointments', async () => {
        const userRepo = mockRepo({
            findOne: jest
                .fn()
                .mockResolvedValueOnce({ id: 'doc1', role: 'doctor', departmentId: 'D9' })
                .mockResolvedValueOnce({ id: 'pat1', role: 'patient', primaryDepartmentId: 'D3' }),
        });
        const referralRepo = mockRepo({ findOne: jest.fn().mockResolvedValue(undefined) });
        const apptRepo = mockRepo({ createQueryBuilder: jest.fn(() => qbMock(undefined)) });
        setRepos({ user: userRepo, referral: referralRepo, appointment: apptRepo });
        const middleware = (0, access_middleware_1.enforcePatientReportAccess)((req) => { var _a; return (_a = req.params) === null || _a === void 0 ? void 0 : _a.patientId; });
        const req = { user: { id: 'doc1', role: 'doctor' }, params: { patientId: 'pat1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        await middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Access denied') }));
    });
    it('returns 400 when patientId missing', async () => {
        const middleware = (0, access_middleware_1.enforcePatientReportAccess)(() => '');
        const req = { user: { id: 'doc1', role: 'doctor' }, params: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        await middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
