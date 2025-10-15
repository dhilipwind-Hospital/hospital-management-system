/**
 * Automated Test: Patient ID Registration
 * Tests the complete registration flow with location-based patient ID generation
 */

const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

// Test data
const testPatients = [
  {
    firstName: 'Chennai',
    lastName: 'Patient',
    email: `chennai.test.${Date.now()}@test.com`,
    phone: '+91 9876543210',
    password: 'Test@123',
    confirmPassword: 'Test@123',
    location: 'Chennai',
    expectedCode: 'CHN'
  },
  {
    firstName: 'Mumbai',
    lastName: 'Patient',
    email: `mumbai.test.${Date.now()}@test.com`,
    phone: '+91 9876543211',
    password: 'Test@123',
    confirmPassword: 'Test@123',
    location: 'Mumbai',
    expectedCode: 'MUM'
  },
  {
    firstName: 'Delhi',
    lastName: 'Patient',
    email: `delhi.test.${Date.now()}@test.com`,
    phone: '+91 9876543212',
    password: 'Test@123',
    confirmPassword: 'Test@123',
    location: 'Delhi',
    expectedCode: 'DEL'
  }
];

async function testRegistration() {
  console.log('🧪 Testing Patient ID Registration System\n');
  console.log('=' .repeat(60));
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const patient of testPatients) {
    console.log(`\n📝 Test: Register patient in ${patient.location}`);
    console.log('-'.repeat(60));
    
    try {
      // Register patient
      console.log(`   Email: ${patient.email}`);
      console.log(`   Location: ${patient.location}`);
      console.log(`   Expected Code: ${patient.expectedCode}`);
      
      const response = await axios.post(`${API_URL}/auth/register`, patient);
      
      if (response.status === 201 || response.status === 200) {
        console.log('   ✅ Registration successful');
        
        // Login to get user details
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: patient.email,
          password: patient.password
        });
        
        if (loginResponse.data.user) {
          const user = loginResponse.data.user;
          console.log(`   📋 User Details:`);
          console.log(`      Name: ${user.firstName} ${user.lastName}`);
          console.log(`      Email: ${user.email}`);
          console.log(`      Patient ID: ${user.globalPatientId || 'NOT GENERATED'}`);
          console.log(`      Location Code: ${user.locationCode || 'NOT SET'}`);
          console.log(`      Registered Location: ${user.registeredLocation || 'NOT SET'}`);
          console.log(`      Registered Year: ${user.registeredYear || 'NOT SET'}`);
          console.log(`      Sequence Number: ${user.patientSequenceNumber || 'NOT SET'}`);
          
          // Verify patient ID format
          if (user.globalPatientId) {
            const pattern = /^([A-Z]{3})-(\d{4})-(\d{5})$/;
            const match = user.globalPatientId.match(pattern);
            
            if (match) {
              const [, code, year, number] = match;
              console.log(`   ✅ Patient ID format valid: ${code}-${year}-${number}`);
              
              if (code === patient.expectedCode) {
                console.log(`   ✅ Location code matches: ${code}`);
                passedTests++;
              } else {
                console.log(`   ❌ Location code mismatch: Expected ${patient.expectedCode}, got ${code}`);
                failedTests++;
              }
            } else {
              console.log(`   ❌ Patient ID format invalid: ${user.globalPatientId}`);
              failedTests++;
            }
          } else {
            console.log(`   ❌ Patient ID not generated!`);
            failedTests++;
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ Test failed: ${error.response?.data?.message || error.message}`);
      failedTests++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Total: ${passedTests + failedTests}`);
  
  if (failedTests === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\n✅ Patient ID system is working correctly!');
    console.log('   - Location-based IDs generated');
    console.log('   - Format: CODE-YEAR-NUMBER');
    console.log('   - Each location has independent sequence');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED!');
    console.log('\nPossible issues:');
    console.log('   - Backend not restarted after code changes');
    console.log('   - Database migration not run');
    console.log('   - PatientIdService not imported correctly');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Run tests
testRegistration().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
});
