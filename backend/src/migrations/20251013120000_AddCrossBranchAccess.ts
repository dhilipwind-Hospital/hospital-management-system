import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddCrossBranchAccess20251013120000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create patient_access_requests table
    await queryRunner.createTable(
      new Table({
        name: 'patient_access_requests',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'patient_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'requesting_doctor_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'requested_duration_hours',
            type: 'integer',
            default: 24,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'pending'",
          },
          {
            name: 'approved_by_patient_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'rejected_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'rejection_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // 2. Create patient_shared_access table
    await queryRunner.createTable(
      new Table({
        name: 'patient_shared_access',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'patient_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'doctor_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'access_request_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'granted_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // 3. Create patient_access_audit table
    await queryRunner.createTable(
      new Table({
        name: 'patient_access_audit',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'patient_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'doctor_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'details',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Add foreign keys for patient_access_requests
    await queryRunner.createForeignKey(
      'patient_access_requests',
      new TableForeignKey({
        columnNames: ['patient_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'patient_access_requests',
      new TableForeignKey({
        columnNames: ['requesting_doctor_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    // Add foreign keys for patient_shared_access
    await queryRunner.createForeignKey(
      'patient_shared_access',
      new TableForeignKey({
        columnNames: ['patient_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'patient_shared_access',
      new TableForeignKey({
        columnNames: ['doctor_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'patient_shared_access',
      new TableForeignKey({
        columnNames: ['access_request_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'patient_access_requests',
        onDelete: 'CASCADE',
      })
    );

    // Add foreign keys for patient_access_audit
    await queryRunner.createForeignKey(
      'patient_access_audit',
      new TableForeignKey({
        columnNames: ['patient_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'patient_access_audit',
      new TableForeignKey({
        columnNames: ['doctor_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    // Create indexes for better query performance
    await queryRunner.query(
      `CREATE INDEX idx_access_requests_patient ON patient_access_requests(patient_id)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_access_requests_doctor ON patient_access_requests(requesting_doctor_id)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_access_requests_status ON patient_access_requests(status)`
    );
    
    await queryRunner.query(
      `CREATE INDEX idx_shared_access_patient ON patient_shared_access(patient_id)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_shared_access_doctor ON patient_shared_access(doctor_id)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_shared_access_active ON patient_shared_access(is_active, expires_at)`
    );
    
    await queryRunner.query(
      `CREATE INDEX idx_audit_patient ON patient_access_audit(patient_id)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_audit_doctor ON patient_access_audit(doctor_id)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_audit_action ON patient_access_audit(action)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('patient_access_audit');
    await queryRunner.dropTable('patient_shared_access');
    await queryRunner.dropTable('patient_access_requests');
  }
}
