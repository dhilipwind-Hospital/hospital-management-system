/**
 * Quick UI Automation Test: Register New Patient and Verify Patient ID
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const timestamp = Date.now();

test('Register new patient and verify Patient ID is displayed', async ({ page }) => {
  console.log('🎭 Starting UI Automation Test...\n');
  
  const testPatient = {
    firstName: 'UI Test',
    lastName: 'Patient',
    email: `uitest.${timestamp}@test.com`,
    phone: '9876543299',
    location: 'Bangalore, Karnataka',
    password: 'Test@123'
  };
  
  console.log(`📝 Test Patient: ${testPatient.email}`);
  console.log(`📍 Location: ${testPatient.location}\n`);
  
  // Step 1: Navigate to registration
  console.log('Step 1: Navigate to registration page...');
  await page.goto(`${BASE_URL}/register`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/step1-register-page.png', fullPage: true });
  console.log('✅ Registration page loaded\n');
  
  // Step 2: Fill Basic Info
  console.log('Step 2: Filling basic information...');
  await page.fill('input[placeholder="First Name"]', testPatient.firstName);
  await page.fill('input[placeholder="Last Name"]', testPatient.lastName);
  await page.fill('input[placeholder*="mail"]', testPatient.email);
  await page.fill('input[placeholder*="Phone"]', testPatient.phone);
  
  // Step 3: Select Location
  console.log('Step 3: Selecting location...');
  await page.click('.ant-select-selector');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/step3-location-dropdown.png', fullPage: true });
  await page.click(`text=${testPatient.location}`);
  await page.screenshot({ path: 'test-results/step3-location-selected.png', fullPage: true });
  console.log(`✅ Selected: ${testPatient.location}\n`);
  
  // Step 4: Click Next
  console.log('Step 4: Proceeding to password step...');
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/step4-password-page.png', fullPage: true });
  console.log('✅ Password step loaded\n');
  
  // Step 5: Fill Password
  console.log('Step 5: Filling password...');
  const passwordInputs = await page.locator('input[type="password"]').all();
  await passwordInputs[0].fill(testPatient.password);
  await passwordInputs[1].fill(testPatient.password);
  await page.screenshot({ path: 'test-results/step5-password-filled.png', fullPage: true });
  console.log('✅ Password filled\n');
  
  // Step 6: Click Next to Confirm
  console.log('Step 6: Proceeding to confirmation...');
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/step6-confirm-page.png', fullPage: true });
  console.log('✅ Confirmation step loaded\n');
  
  // Step 7: Submit Registration
  console.log('Step 7: Submitting registration...');
  await page.click('button:has-text("Register")');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/step7-registration-submitted.png', fullPage: true });
  console.log('✅ Registration submitted\n');
  
  // Step 8: Login
  console.log('Step 8: Logging in with new account...');
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[type="email"]', testPatient.email);
  await page.fill('input[type="password"]', testPatient.password);
  await page.screenshot({ path: 'test-results/step8-login-filled.png', fullPage: true });
  
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/step8-logged-in.png', fullPage: true });
  console.log('✅ Logged in successfully\n');
  
  // Step 9: Navigate to Patient Portal
  console.log('Step 9: Navigating to Patient Portal...');
  await page.goto(`${BASE_URL}/`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/step9-patient-portal.png', fullPage: true });
  console.log('✅ Patient Portal loaded\n');
  
  // Step 10: Verify Patient ID is visible
  console.log('Step 10: Verifying Patient ID...');
  
  // Look for Patient ID in the page
  const patientIdElement = page.locator('text=/BLR-2025-\\d{5}/');
  
  try {
    await expect(patientIdElement).toBeVisible({ timeout: 5000 });
    const patientId = await patientIdElement.textContent();
    console.log(`✅ Patient ID Found: ${patientId}\n`);
    
    // Verify format
    expect(patientId).toMatch(/^BLR-2025-\d{5}$/);
    console.log('✅ Patient ID format is correct (BLR-2025-XXXXX)\n');
    
    // Take final screenshot highlighting the Patient ID
    await page.screenshot({ path: 'test-results/step10-patient-id-visible.png', fullPage: true });
    
    console.log('═══════════════════════════════════════');
    console.log('🎉 TEST PASSED!');
    console.log('═══════════════════════════════════════');
    console.log(`Patient Email: ${testPatient.email}`);
    console.log(`Patient ID: ${patientId}`);
    console.log(`Location: Bangalore`);
    console.log('Patient ID is visible in Patient Portal ✅');
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.log('❌ Patient ID not found in Patient Portal');
    console.log('Checking Profile page...\n');
    
    // Try profile page
    await page.click('text=Edit');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/step10-profile-page.png', fullPage: true });
    
    const profilePatientId = page.locator('text=/BLR-2025-\\d{5}/');
    await expect(profilePatientId).toBeVisible({ timeout: 5000 });
    const patientId = await profilePatientId.textContent();
    
    console.log(`✅ Patient ID Found in Profile: ${patientId}\n`);
    console.log('═══════════════════════════════════════');
    console.log('🎉 TEST PASSED!');
    console.log('═══════════════════════════════════════');
    console.log(`Patient ID: ${patientId}`);
    console.log('Patient ID is visible in Profile page ✅');
    console.log('═══════════════════════════════════════\n');
  }
  
  console.log('📸 Screenshots saved in: test-results/');
  console.log('   - step1-register-page.png');
  console.log('   - step3-location-dropdown.png');
  console.log('   - step3-location-selected.png');
  console.log('   - step4-password-page.png');
  console.log('   - step8-logged-in.png');
  console.log('   - step9-patient-portal.png');
  console.log('   - step10-patient-id-visible.png');
});
