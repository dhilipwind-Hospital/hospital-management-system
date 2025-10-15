"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMultiLocationPatientId20250111 = void 0;
const typeorm_1 = require("typeorm");
/**
 * Migration: Add Multi-Location Patient ID Fields
 * Adds fields to support location-based patient ID generation
 * Format: CHN-2025-00001 (LocationCode-Year-SequenceNumber)
 */
class AddMultiLocationPatientId20250111 {
    async up(queryRunner) {
        // Add global_patient_id column
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'global_patient_id',
            type: 'varchar',
            length: '50',
            isNullable: true,
            isUnique: true,
            comment: 'Unique patient ID in format: CHN-2025-00001'
        }));
        // Add location_code column
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'location_code',
            type: 'varchar',
            length: '10',
            isNullable: true,
            comment: 'Location code (e.g., CHN, MUM, DEL)'
        }));
        // Add registered_location column
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'registered_location',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'City name where patient registered (e.g., Chennai, Mumbai)'
        }));
        // Add registered_year column
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'registered_year',
            type: 'int',
            isNullable: true,
            comment: 'Year of registration (e.g., 2025)'
        }));
        // Add patient_sequence_number column
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'patient_sequence_number',
            type: 'int',
            isNullable: true,
            comment: 'Sequential number per location per year'
        }));
        // Create index for faster lookups
        await queryRunner.query(`
      CREATE INDEX idx_users_location_year 
      ON users(location_code, registered_year, patient_sequence_number)
      WHERE role = 'patient'
    `);
        // Create index on global_patient_id for search
        await queryRunner.query(`
      CREATE INDEX idx_users_global_patient_id 
      ON users(global_patient_id)
      WHERE global_patient_id IS NOT NULL
    `);
    }
    async down(queryRunner) {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_global_patient_id`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_location_year`);
        // Drop columns
        await queryRunner.dropColumn('users', 'patient_sequence_number');
        await queryRunner.dropColumn('users', 'registered_year');
        await queryRunner.dropColumn('users', 'registered_location');
        await queryRunner.dropColumn('users', 'location_code');
        await queryRunner.dropColumn('users', 'global_patient_id');
    }
}
exports.AddMultiLocationPatientId20250111 = AddMultiLocationPatientId20250111;
