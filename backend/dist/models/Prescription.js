"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
const Patient_1 = __importDefault(require("./Patient"));
const PrescriptionItem_1 = __importDefault(require("./PrescriptionItem"));
class Prescription extends sequelize_1.Model {
}
Prescription.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    patientId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'patients',
            key: 'id',
        },
    },
    doctorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    diagnosis: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
    },
    prescriptionDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'dispensed', 'partially_dispensed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    tableName: 'prescriptions',
    modelName: 'Prescription',
});
// Define associations
Prescription.belongsTo(User_1.default, { foreignKey: 'doctorId', as: 'doctor' });
Prescription.belongsTo(Patient_1.default, { foreignKey: 'patientId', as: 'patient' });
Prescription.hasMany(PrescriptionItem_1.default, { foreignKey: 'prescriptionId', as: 'items' });
exports.default = Prescription;
