"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Prescription_1 = __importDefault(require("./Prescription"));
const Medicine_1 = __importDefault(require("./Medicine"));
class PrescriptionItem extends sequelize_1.Model {
}
PrescriptionItem.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    prescriptionId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'prescriptions',
            key: 'id',
        },
    },
    medicineId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'medicines',
            key: 'id',
        },
    },
    dosage: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    frequency: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    duration: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    instructions: {
        type: sequelize_1.DataTypes.TEXT,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'dispensed', 'out_of_stock', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    tableName: 'prescription_items',
    modelName: 'PrescriptionItem',
});
// Define associations
PrescriptionItem.belongsTo(Prescription_1.default, { foreignKey: 'prescriptionId' });
PrescriptionItem.belongsTo(Medicine_1.default, { foreignKey: 'medicineId', as: 'medicine' });
exports.default = PrescriptionItem;
