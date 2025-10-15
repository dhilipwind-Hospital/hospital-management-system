"use strict";
/**
 * Patient ID Generation Service
 * Generates unique patient IDs in format: CHN-2025-00001
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientIdService = void 0;
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const roles_1 = require("../types/roles");
const locations_1 = require("../config/locations");
class PatientIdService {
    /**
     * Generate unique patient ID for multi-location system
     * Format: CHN-2025-00001 (LocationCode-Year-SequenceNumber)
     *
     * @param locationName - City name (e.g., "Chennai", "Mumbai")
     * @returns Patient ID data including globalPatientId, locationCode, etc.
     */
    static async generatePatientId(locationName) {
        const year = new Date().getFullYear();
        const locationCode = (0, locations_1.getLocationCode)(locationName);
        // Get last patient number for this location and year
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const lastPatient = await userRepository
            .createQueryBuilder('user')
            .where('user.role = :role', { role: roles_1.UserRole.PATIENT })
            .andWhere('user.locationCode = :locationCode', { locationCode })
            .andWhere('user.registeredYear = :year', { year })
            .orderBy('user.patientSequenceNumber', 'DESC')
            .getOne();
        const nextNumber = ((lastPatient === null || lastPatient === void 0 ? void 0 : lastPatient.patientSequenceNumber) || 0) + 1;
        // Format: CHN-2025-00001
        const globalPatientId = `${locationCode}-${year}-${String(nextNumber).padStart(5, '0')}`;
        return {
            globalPatientId,
            locationCode,
            registeredLocation: locationName,
            registeredYear: year,
            patientSequenceNumber: nextNumber
        };
    }
    /**
     * Parse patient ID to extract components
     * @param patientId - Patient ID (e.g., "CHN-2025-00001")
     * @returns Parsed components or null if invalid
     */
    static parsePatientId(patientId) {
        const pattern = /^([A-Z]{3})-(\d{4})-(\d{5})$/;
        const match = patientId.match(pattern);
        if (!match)
            return null;
        return {
            locationCode: match[1],
            year: parseInt(match[2]),
            sequenceNumber: parseInt(match[3])
        };
    }
    /**
     * Validate patient ID format
     * @param patientId - Patient ID to validate
     * @returns true if valid format
     */
    static isValidPatientId(patientId) {
        return /^[A-Z]{3}-\d{4}-\d{5}$/.test(patientId);
    }
    /**
     * Generate patient ID for existing patient (migration)
     * @param userId - User ID
     * @param locationName - City name
     */
    static async generateForExistingPatient(userId, locationName = 'Chennai') {
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user || user.role !== roles_1.UserRole.PATIENT) {
            throw new Error('User not found or not a patient');
        }
        if (user.globalPatientId) {
            // Already has patient ID
            return;
        }
        const patientIdData = await this.generatePatientId(locationName);
        user.globalPatientId = patientIdData.globalPatientId;
        user.locationCode = patientIdData.locationCode;
        user.registeredLocation = patientIdData.registeredLocation;
        user.registeredYear = patientIdData.registeredYear;
        user.patientSequenceNumber = patientIdData.patientSequenceNumber;
        await userRepository.save(user);
    }
}
exports.PatientIdService = PatientIdService;
