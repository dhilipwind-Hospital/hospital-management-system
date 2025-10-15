"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const roles_1 = require("../types/roles");
function makeReq(user) {
    return { user };
}
function makeNext() {
    const next = jest.fn((err) => { });
    return next;
}
describe('rbac.middleware authorize', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    it('denies when unauthenticated', async () => {
        const mw = (0, rbac_middleware_1.authorize)({ requireRole: roles_1.UserRole.DOCTOR });
        const req = makeReq(undefined);
        const next = makeNext();
        await mw(req, {}, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        expect(next.mock.calls[0][0].message).toMatch(/Authentication required/i);
    });
    it('allows SUPER_ADMIN bypass for any requirements', async () => {
        const mw = (0, rbac_middleware_1.authorize)({ requireAll: [roles_1.Permission.DELETE_USER, roles_1.Permission.MANAGE_INVENTORY] });
        const req = makeReq({ id: '1', role: roles_1.UserRole.SUPER_ADMIN, permissions: [] });
        const next = makeNext();
        await mw(req, {}, next);
        expect(next.mock.calls[0][0]).toBeUndefined();
    });
    it('requireRole: allows user with matching role', async () => {
        const mw = (0, rbac_middleware_1.authorize)({ requireRole: roles_1.UserRole.DOCTOR });
        const req = makeReq({ id: 'd1', role: roles_1.UserRole.DOCTOR, permissions: [] });
        const next = makeNext();
        await mw(req, {}, next);
        expect(next.mock.calls[0][0]).toBeUndefined();
    });
    it('requireRole: denies user with non-matching role', async () => {
        const mw = (0, rbac_middleware_1.authorize)({ requireRole: roles_1.UserRole.DOCTOR });
        const req = makeReq({ id: 'n1', role: roles_1.UserRole.NURSE, permissions: [] });
        const next = makeNext();
        await mw(req, {}, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        expect(next.mock.calls[0][0].message).toMatch(/Insufficient permissions/i);
    });
    it('requireOneOf: allows when rolePermissions grant it (doctor can CREATE_MEDICAL_RECORD)', async () => {
        const mw = (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.CREATE_MEDICAL_RECORD] });
        const req = makeReq({ id: 'd1', role: roles_1.UserRole.DOCTOR, permissions: [] });
        const next = makeNext();
        await mw(req, {}, next);
        expect(next.mock.calls[0][0]).toBeUndefined();
    });
    it('requireOneOf: denies when neither rolePermissions nor overrides grant it', async () => {
        const mw = (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.CREATE_USER] });
        const req = makeReq({ id: 'p1', role: roles_1.UserRole.PATIENT, permissions: [] });
        const next = makeNext();
        await mw(req, {}, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
    it('requireOneOf: allows when user has per-user override permissions', async () => {
        const mw = (0, rbac_middleware_1.authorize)({ requireOneOf: [roles_1.Permission.VIEW_USER] });
        const req = makeReq({ id: 'p1', role: roles_1.UserRole.PATIENT, permissions: [roles_1.Permission.VIEW_USER] });
        const next = makeNext();
        await mw(req, {}, next);
        expect(next.mock.calls[0][0]).toBeUndefined();
    });
    it('requireAll: allows when all permissions are granted by role', async () => {
        const mw = (0, rbac_middleware_1.authorize)({ requireAll: [roles_1.Permission.CREATE_USER, roles_1.Permission.UPDATE_USER] });
        const req = makeReq({ id: 'a1', role: roles_1.UserRole.ADMIN, permissions: [] });
        const next = makeNext();
        await mw(req, {}, next);
        expect(next.mock.calls[0][0]).toBeUndefined();
    });
    it('requireAll: denies when one of the permissions is missing for the role', async () => {
        const mw = (0, rbac_middleware_1.authorize)({ requireAll: [roles_1.Permission.CREATE_USER, roles_1.Permission.DELETE_USER] });
        const req = makeReq({ id: 'a1', role: roles_1.UserRole.ADMIN, permissions: [] });
        const next = makeNext();
        await mw(req, {}, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
    it('customCheck: allows when custom check returns true', async () => {
        const mw = (0, rbac_middleware_1.authorize)({ customCheck: () => true });
        const req = makeReq({ id: 'x1', role: roles_1.UserRole.PATIENT, permissions: [] });
        const next = makeNext();
        await mw(req, {}, next);
        expect(next.mock.calls[0][0]).toBeUndefined();
    });
    it('customCheck: denies when custom check returns false', async () => {
        const mw = (0, rbac_middleware_1.authorize)({ customCheck: () => false });
        const req = makeReq({ id: 'x1', role: roles_1.UserRole.PATIENT, permissions: [] });
        const next = makeNext();
        await mw(req, {}, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
});
// Basic smoke tests for convenience guards
describe('rbac convenience guards', () => {
    it('isAdmin allows admin', async () => {
        const req = makeReq({ id: '1', role: roles_1.UserRole.ADMIN, permissions: [] });
        const next = makeNext();
        await rbac_middleware_1.isAdmin(req, {}, next);
        expect(next.mock.calls[0][0]).toBeUndefined();
    });
    it('isDoctor denies non-doctor', async () => {
        const req = makeReq({ id: '1', role: roles_1.UserRole.NURSE, permissions: [] });
        const next = makeNext();
        await rbac_middleware_1.isDoctor(req, {}, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
    it('isPatient allows patient', async () => {
        const req = makeReq({ id: '1', role: roles_1.UserRole.PATIENT, permissions: [] });
        const next = makeNext();
        await rbac_middleware_1.isPatient(req, {}, next);
        expect(next.mock.calls[0][0]).toBeUndefined();
    });
});
