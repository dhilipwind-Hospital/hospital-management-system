/**
 * Patient ID Generation Service
 * Generates unique patient IDs in format: CHN-2025-00001
 */

import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { UserRole } from '../types/roles';
import { getLocationCode } from '../config/locations';

export class PatientIdService {
  
  /**
   * Generate unique patient ID for multi-location system
   * Format: CHN-2025-00001 (LocationCode-Year-SequenceNumber)
   * 
   * @param locationName - City name (e.g., "Chennai", "Mumbai")
   * @returns Patient ID data including globalPatientId, locationCode, etc.
   */
  static async generatePatientId(locationName: string): Promise<{
    globalPatientId: string;
    locationCode: string;
    registeredLocation: string;
    registeredYear: number;
    patientSequenceNumber: number;
  }> {
    const year = new Date().getFullYear();
    const locationCode = getLocationCode(locationName);
    
    // Get last patient number for this location and year
    const userRepository = AppDataSource.getRepository(User);
    
    const lastPatient = await userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.PATIENT })
      .andWhere('user.locationCode = :locationCode', { locationCode })
      .andWhere('user.registeredYear = :year', { year })
      .orderBy('user.patientSequenceNumber', 'DESC')
      .getOne();
    
    const nextNumber = (lastPatient?.patientSequenceNumber || 0) + 1;
    
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
  static parsePatientId(patientId: string): {
    locationCode: string;
    year: number;
    sequenceNumber: number;
  } | null {
    const pattern = /^([A-Z]{3})-(\d{4})-(\d{5})$/;
    const match = patientId.match(pattern);
    
    if (!match) return null;
    
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
  static isValidPatientId(patientId: string): boolean {
    return /^[A-Z]{3}-\d{4}-\d{5}$/.test(patientId);
  }
  
  /**
   * Generate patient ID for existing patient (migration)
   * @param userId - User ID
   * @param locationName - City name
   */
  static async generateForExistingPatient(userId: string, locationName: string = 'Chennai'): Promise<void> {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (!user || user.role !== UserRole.PATIENT) {
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
