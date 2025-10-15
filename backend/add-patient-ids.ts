/**
 * Add Patient IDs to Existing Patients
 * Run this to generate Patient IDs for patients registered before the feature
 */

import { createDatabaseConnection } from './src/config/database';
import { User } from './src/models/User';
import { UserRole } from './src/types/roles';
import { PatientIdService } from './src/services/patientId.service';

async function addPatientIds() {
  console.log('🔄 Adding Patient IDs to existing patients...\n');
  
  try {
    const dataSource = await createDatabaseConnection();
    console.log('✅ Database connected\n');
    
    const userRepository = dataSource.getRepository(User);
    
    // Find all patients without patient ID
    const patientsWithoutId = await userRepository.find({
      where: {
        role: UserRole.PATIENT,
        globalPatientId: null as any
      }
    });
    
    console.log(`📊 Found ${patientsWithoutId.length} patients without Patient ID\n`);
    
    if (patientsWithoutId.length === 0) {
      console.log('✅ All patients already have Patient IDs!');
      await dataSource.destroy();
      process.exit(0);
    }
    
    console.log('Generating Patient IDs...\n');
    
    let updated = 0;
    
    for (const patient of patientsWithoutId) {
      try {
        // Default to Chennai if no location specified
        const location = 'Chennai';
        
        const patientIdData = await PatientIdService.generatePatientId(location);
        
        patient.globalPatientId = patientIdData.globalPatientId;
        patient.locationCode = patientIdData.locationCode;
        patient.registeredLocation = patientIdData.registeredLocation;
        patient.registeredYear = patientIdData.registeredYear;
        patient.patientSequenceNumber = patientIdData.patientSequenceNumber;
        
        await userRepository.save(patient);
        
        console.log(`✅ ${patient.firstName} ${patient.lastName} (${patient.email})`);
        console.log(`   Patient ID: ${patient.globalPatientId}`);
        console.log(`   Location: ${patient.registeredLocation}\n`);
        
        updated++;
      } catch (error) {
        console.error(`❌ Failed to generate ID for ${patient.email}:`, error);
      }
    }
    
    await dataSource.destroy();
    
    console.log('═══════════════════════════════════════');
    console.log('✅ MIGRATION COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log(`Total Patients: ${patientsWithoutId.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Failed: ${patientsWithoutId.length - updated}`);
    console.log('═══════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

addPatientIds();
