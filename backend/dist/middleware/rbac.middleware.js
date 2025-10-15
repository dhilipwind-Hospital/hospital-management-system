"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSelfOrAllowed = exports.isPatient = exports.isDoctor = exports.isAdmin = exports.canManageMedicalRecords = exports.canManageAppointments = exports.canManageUsers = exports.canViewUsers = exports.authorize = void 0;
const roles_1 = require("../types/roles");
const http_exception_1 = require("../exceptions/http.exception");
const authorize = (options) => {
    return async (req, res, next) => {
        try {
            // Ensure user is authenticated
            if (!req.user) {
                throw new http_exception_1.UnauthorizedException('Authentication required');
            }
            const { role, permissions = [] } = req.user;
            // Super admin bypasses all checks
            if (role === roles_1.UserRole.SUPER_ADMIN) {
                return next();
            }
            // Check for custom permission check
            if (options.customCheck) {
                const hasAccess = await Promise.resolve(options.customCheck(req.user, req));
                if (hasAccess)
                    return next();
                throw new http_exception_1.ForbiddenException('Insufficient permissions');
            }
            // Check role requirement
            if (options.requireRole) {
                const requiredRoles = Array.isArray(options.requireRole)
                    ? options.requireRole
                    : [options.requireRole];
                if (requiredRoles.includes(role)) {
                    return next();
                }
            }
            // Check if all required permissions are present
            if (options.requireAll && options.requireAll.length > 0) {
                const hasAllPermissions = options.requireAll.every(permission => (0, roles_1.hasPermission)(role, permission) || permissions.includes(permission));
                if (hasAllPermissions) {
                    return next();
                }
            }
            // Check if any of the required permissions are present
            if (options.requireOneOf && options.requireOneOf.length > 0) {
                const hasAnyPermission = options.requireOneOf.some(permission => (0, roles_1.hasPermission)(role, permission) || permissions.includes(permission));
                if (hasAnyPermission) {
                    return next();
                }
            }
            // If no conditions are met, deny access
            throw new http_exception_1.ForbiddenException('Insufficient permissions');
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorize = authorize;
// Predefined permission sets for common use cases
exports.canViewUsers = (0, exports.authorize)({
    requireOneOf: [
        roles_1.Permission.VIEW_USER,
        roles_1.Permission.VIEW_PATIENT
    ]
});
exports.canManageUsers = (0, exports.authorize)({
    requireOneOf: [
        roles_1.Permission.CREATE_USER,
        roles_1.Permission.UPDATE_USER,
        roles_1.Permission.DELETE_USER
    ]
});
exports.canManageAppointments = (0, exports.authorize)({
    requireOneOf: [
        roles_1.Permission.CREATE_APPOINTMENT,
        roles_1.Permission.UPDATE_APPOINTMENT,
        roles_1.Permission.DELETE_APPOINTMENT
    ]
});
exports.canManageMedicalRecords = (0, exports.authorize)({
    requireOneOf: [
        roles_1.Permission.CREATE_MEDICAL_RECORD,
        roles_1.Permission.UPDATE_MEDICAL_RECORD
    ]
});
exports.isAdmin = (0, exports.authorize)({
    requireRole: [roles_1.UserRole.ADMIN, roles_1.UserRole.SUPER_ADMIN]
});
exports.isDoctor = (0, exports.authorize)({
    requireRole: roles_1.UserRole.DOCTOR
});
exports.isPatient = (0, exports.authorize)({
    requireRole: roles_1.UserRole.PATIENT
});
// Middleware to check if the user is accessing their own resource
const isSelfOrAllowed = (paramName = 'id') => {
    return (0, exports.authorize)({
        customCheck: (user, req) => {
            // Allow if user is accessing their own resource
            if (user.id === req.params[paramName]) {
                return true;
            }
            // Or if they have permission to manage users
            return (0, roles_1.hasPermission)(user.role, roles_1.Permission.UPDATE_USER) ||
                (0, roles_1.hasPermission)(user.role, roles_1.Permission.VIEW_USER);
        }
    });
};
exports.isSelfOrAllowed = isSelfOrAllowed;
