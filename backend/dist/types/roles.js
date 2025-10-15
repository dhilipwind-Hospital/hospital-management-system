"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPermissionsForRole = exports.hasPermission = exports.rolePermissions = exports.Permission = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["DOCTOR"] = "doctor";
    UserRole["NURSE"] = "nurse";
    UserRole["PATIENT"] = "patient";
    UserRole["RECEPTIONIST"] = "receptionist";
    UserRole["PHARMACIST"] = "pharmacist";
    UserRole["LAB_TECHNICIAN"] = "lab_technician";
    UserRole["ACCOUNTANT"] = "accountant";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
var Permission;
(function (Permission) {
    // User permissions
    Permission["VIEW_USER"] = "view_user";
    Permission["CREATE_USER"] = "create_user";
    Permission["UPDATE_USER"] = "update_user";
    Permission["DELETE_USER"] = "delete_user";
    // Patient permissions
    Permission["VIEW_PATIENT"] = "view_patient";
    Permission["CREATE_PATIENT"] = "create_patient";
    Permission["UPDATE_PATIENT"] = "update_patient";
    Permission["DELETE_PATIENT"] = "delete_patient";
    // Appointment permissions
    Permission["VIEW_APPOINTMENT"] = "view_appointment";
    Permission["CREATE_APPOINTMENT"] = "create_appointment";
    Permission["UPDATE_APPOINTMENT"] = "update_appointment";
    Permission["DELETE_APPOINTMENT"] = "delete_appointment";
    // Medical record permissions
    Permission["VIEW_MEDICAL_RECORD"] = "view_medical_record";
    Permission["CREATE_MEDICAL_RECORD"] = "create_medical_record";
    Permission["UPDATE_MEDICAL_RECORD"] = "update_medical_record";
    // Billing permissions
    Permission["VIEW_BILL"] = "view_bill";
    Permission["CREATE_BILL"] = "create_bill";
    Permission["UPDATE_BILL"] = "update_bill";
    // Inventory permissions
    Permission["VIEW_INVENTORY"] = "view_inventory";
    Permission["MANAGE_INVENTORY"] = "manage_inventory";
    // Settings permissions
    Permission["MANAGE_SETTINGS"] = "manage_settings";
    // Report permissions
    Permission["VIEW_REPORTS"] = "view_reports";
    Permission["GENERATE_REPORTS"] = "generate_reports";
})(Permission = exports.Permission || (exports.Permission = {}));
exports.rolePermissions = {
    [UserRole.SUPER_ADMIN]: Object.values(Permission),
    [UserRole.ADMIN]: [
        Permission.VIEW_USER,
        Permission.CREATE_USER,
        Permission.UPDATE_USER,
        Permission.DELETE_USER,
        Permission.MANAGE_SETTINGS,
        Permission.VIEW_PATIENT,
        Permission.CREATE_PATIENT,
        Permission.UPDATE_PATIENT,
        Permission.VIEW_APPOINTMENT,
        Permission.CREATE_APPOINTMENT,
        Permission.UPDATE_APPOINTMENT,
        Permission.VIEW_MEDICAL_RECORD,
        Permission.VIEW_BILL,
        Permission.CREATE_BILL,
        Permission.VIEW_INVENTORY,
        Permission.VIEW_REPORTS,
        Permission.GENERATE_REPORTS
    ],
    [UserRole.DOCTOR]: [
        Permission.VIEW_PATIENT,
        Permission.VIEW_APPOINTMENT,
        Permission.CREATE_APPOINTMENT,
        Permission.UPDATE_APPOINTMENT,
        Permission.VIEW_MEDICAL_RECORD,
        Permission.CREATE_MEDICAL_RECORD,
        Permission.UPDATE_MEDICAL_RECORD
    ],
    [UserRole.NURSE]: [
        Permission.VIEW_PATIENT,
        Permission.VIEW_APPOINTMENT,
        Permission.VIEW_MEDICAL_RECORD,
        Permission.UPDATE_MEDICAL_RECORD
    ],
    [UserRole.PATIENT]: [
        Permission.VIEW_APPOINTMENT,
        Permission.CREATE_APPOINTMENT,
        Permission.VIEW_MEDICAL_RECORD,
        Permission.VIEW_BILL
    ],
    [UserRole.RECEPTIONIST]: [
        Permission.VIEW_PATIENT,
        Permission.CREATE_PATIENT,
        Permission.UPDATE_PATIENT,
        Permission.VIEW_APPOINTMENT,
        Permission.CREATE_APPOINTMENT,
        Permission.UPDATE_APPOINTMENT
    ],
    [UserRole.PHARMACIST]: [
        Permission.VIEW_PATIENT,
        Permission.VIEW_MEDICAL_RECORD,
        Permission.VIEW_INVENTORY,
        Permission.MANAGE_INVENTORY
    ],
    [UserRole.LAB_TECHNICIAN]: [
        Permission.VIEW_PATIENT,
        Permission.VIEW_MEDICAL_RECORD,
        Permission.UPDATE_MEDICAL_RECORD,
        Permission.VIEW_INVENTORY
    ],
    [UserRole.ACCOUNTANT]: [
        Permission.VIEW_BILL,
        Permission.CREATE_BILL,
        Permission.UPDATE_BILL,
        Permission.VIEW_REPORTS,
        Permission.GENERATE_REPORTS
    ]
};
// Helper function to check if a role has a specific permission
const hasPermission = (role, permission) => {
    var _a;
    return ((_a = exports.rolePermissions[role]) === null || _a === void 0 ? void 0 : _a.includes(permission)) || false;
};
exports.hasPermission = hasPermission;
// Helper to get all permissions for a role
const getPermissionsForRole = (role) => {
    return exports.rolePermissions[role] || [];
};
exports.getPermissionsForRole = getPermissionsForRole;
