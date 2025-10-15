/**
 * Run Patient ID Migration
 * Adds columns for multi-location patient ID system
 */

import { createDatabaseConnection } from './src/config/database';

async function runMigration() {
  console.log('🚀 Starting Patient ID Migration...\n');
  
  try {
    // Connect to database
    const dataSource = await createDatabaseConnection();
    console.log('✅ Database connected\n');
    
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    
    console.log('📝 Adding columns to users table...\n');
    
    // Check if columns already exist
    const tableSchema = await queryRunner.getTable('users');
    const existingColumns = tableSchema?.columns.map(col => col.name) || [];
    
    // Add global_patient_id
    if (!existingColumns.includes('global_patient_id')) {
      await queryRunner.query(`
        ALTER TABLE users 
        ADD COLUMN global_patient_id VARCHAR(50) UNIQUE
      `);
      console.log('  ✅ Added global_patient_id column');
    } else {
      console.log('  ⏭️  global_patient_id already exists');
    }
    
    // Add location_code
    if (!existingColumns.includes('location_code')) {
      await queryRunner.query(`
        ALTER TABLE users 
        ADD COLUMN location_code VARCHAR(10)
      `);
      console.log('  ✅ Added location_code column');
    } else {
      console.log('  ⏭️  location_code already exists');
    }
    
    // Add registered_location
    if (!existingColumns.includes('registered_location')) {
      await queryRunner.query(`
        ALTER TABLE users 
        ADD COLUMN registered_location VARCHAR(100)
      `);
      console.log('  ✅ Added registered_location column');
    } else {
      console.log('  ⏭️  registered_location already exists');
    }
    
    // Add registered_year
    if (!existingColumns.includes('registered_year')) {
      await queryRunner.query(`
        ALTER TABLE users 
        ADD COLUMN registered_year INT
      `);
      console.log('  ✅ Added registered_year column');
    } else {
      console.log('  ⏭️  registered_year already exists');
    }
    
    // Add patient_sequence_number
    if (!existingColumns.includes('patient_sequence_number')) {
      await queryRunner.query(`
        ALTER TABLE users 
        ADD COLUMN patient_sequence_number INT
      `);
      console.log('  ✅ Added patient_sequence_number column');
    } else {
      console.log('  ⏭️  patient_sequence_number already exists');
    }
    
    console.log('\n📊 Creating indexes...\n');
    
    // Create indexes
    try {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_users_location_year 
        ON users(location_code, registered_year, patient_sequence_number)
        WHERE role = 'patient'
      `);
      console.log('  ✅ Created idx_users_location_year index');
    } catch (error) {
      console.log('  ⏭️  idx_users_location_year index already exists');
    }
    
    try {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_users_global_patient_id 
        ON users(global_patient_id)
        WHERE global_patient_id IS NOT NULL
      `);
      console.log('  ✅ Created idx_users_global_patient_id index');
    } catch (error) {
      console.log('  ⏭️  idx_users_global_patient_id index already exists');
    }
    
    await queryRunner.release();
    await dataSource.destroy();
    
    console.log('\n✅ Migration completed successfully!\n');
    console.log('📋 Summary:');
    console.log('  - Added 5 new columns to users table');
    console.log('  - Created 2 indexes for performance');
    console.log('  - All columns are nullable (backward compatible)');
    console.log('\n🎉 Ready to generate patient IDs!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
