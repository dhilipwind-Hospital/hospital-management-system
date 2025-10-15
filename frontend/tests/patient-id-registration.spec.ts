/**
 * Playwright UI Automation Test: Patient ID Registration
 * Tests the complete registration flow with location-based patient ID generation
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:5001/api';

// Generate unique test data
const timestamp = Date.now();

const testData = {
  chennai: {
    fullName: 'Chennai Test Patient',
    email: `chennai.ui.test.${timestamp}@test.com`,
    phone: '+91 9876543210',
    location: 'Chennai, Tamil Nadu',
    password: 'Test@123',
    expectedPatientId: /^CHN-2025-\d{5}$/,
    expectedLocationCode: 'CHN'
  },
  mumbai: {
    fullName: 'Mumbai Test Patient',
    email: `mumbai.ui.test.${timestamp}@test.com`,
    phone: '+91 9876543211',
    location: 'Mumbai, Maharashtra',
    password: 'Test@123',
    expectedPatientId: /^MUM-2025-\d{5}$/,
    expectedLocationCode: 'MUM'
  },
  delhi: {
    fullName: 'Delhi Test Patient',
    email: `delhi.ui.test.${timestamp}@test.com`,
    phone: '+91 9876543212',
    location: 'Delhi',
    password: 'Test@123',
    expectedPatientId: /^DEL-2025-\d{5}$/,
    expectedLocationCode: 'DEL'
  }
};

test.describe('Patient ID Registration System', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to login/register page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
  });

  test('should display location dropdown in registration form', async ({ page }) => {
    console.log('🔍 Test: Verify location dropdown exists');
    
    // Click Register tab
    await page.click('text=Register');
    await page.waitForTimeout(500);
    
    // Check if location field exists
    const locationLabel = page.locator('text=Hospital Location');
    await expect(locationLabel).toBeVisible({ timeout: 10000 });
    
    // Check if location dropdown exists
    const locationDropdown = page.locator('[name="location"]');
    await expect(locationDropdown).toBeVisible();
    
    console.log('✅ Location dropdown is visible');
  });

  test('should register Chennai patient with patient ID', async ({ page }) => {
    console.log('🧪 Test: Register Chennai patient');
    
    const patient = testData.chennai;
    
    // Click Register tab
    await page.click('text=Register');
    await page.waitForTimeout(500);
    
    // Fill registration form
    console.log('📝 Filling registration form...');
    await page.fill('[name="fullName"]', patient.fullName);
    await page.fill('[name="email"]', patient.email);
    await page.fill('[name="phone"]', patient.phone);
    
    // Select location
    console.log(`📍 Selecting location: ${patient.location}`);
    await page.click('[name="location"]');
    await page.waitForTimeout(300);
    await page.click(`text=${patient.location}`);
    
    // Fill passwords
    await page.fill('[name="password"]', patient.password);
    await page.fill('[name="confirmPassword"]', patient.password);
    
    // Accept terms
    await page.check('[name="agreeToTerms"]');
    
    // Take screenshot before submit
    await page.screenshot({ path: 'test-results/registration-form-chennai.png', fullPage: true });
    
    // Submit form
    console.log('✅ Submitting registration...');
    await page.click('button:has-text("Register")');
    
    // Wait for success message or redirect
    await page.waitForTimeout(2000);
    
    // Take screenshot after submit
    await page.screenshot({ path: 'test-results/registration-success-chennai.png', fullPage: true });
    
    // Verify registration success
    const successMessage = page.locator('text=/Registration successful|Please login/i');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Registration successful');
    
    // Now login to verify patient ID
    console.log('🔐 Logging in to verify patient ID...');
    
    // Switch to login tab
    await page.click('text=Login');
    await page.waitForTimeout(500);
    
    // Login
    await page.fill('input[type="email"]', patient.email);
    await page.fill('input[type="password"]', patient.password);
    await page.click('button:has-text("Login")');
    
    // Wait for redirect
    await page.waitForTimeout(3000);
    
    // Get user data from API
    const cookies = await page.context().cookies();
    const token = cookies.find(c => c.name === 'token')?.value || 
                  await page.evaluate(() => localStorage.getItem('token'));
    
    if (token) {
      // Fetch user details via API
      const response = await page.request.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const userData = await response.json();
      console.log('📋 User data:', JSON.stringify(userData, null, 2));
      
      // Verify patient ID
      expect(userData.globalPatientId).toMatch(patient.expectedPatientId);
      expect(userData.locationCode).toBe(patient.expectedLocationCode);
      expect(userData.registeredLocation).toBe('Chennai');
      expect(userData.registeredYear).toBe(2025);
      
      console.log(`✅ Patient ID verified: ${userData.globalPatientId}`);
      console.log(`✅ Location code verified: ${userData.locationCode}`);
    }
  });

  test('should register Mumbai patient with patient ID', async ({ page }) => {
    console.log('🧪 Test: Register Mumbai patient');
    
    const patient = testData.mumbai;
    
    // Click Register tab
    await page.click('text=Register');
    await page.waitForTimeout(500);
    
    // Fill registration form
    console.log('📝 Filling registration form...');
    await page.fill('[name="fullName"]', patient.fullName);
    await page.fill('[name="email"]', patient.email);
    await page.fill('[name="phone"]', patient.phone);
    
    // Select location
    console.log(`📍 Selecting location: ${patient.location}`);
    await page.click('[name="location"]');
    await page.waitForTimeout(300);
    await page.click(`text=${patient.location}`);
    
    // Fill passwords
    await page.fill('[name="password"]', patient.password);
    await page.fill('[name="confirmPassword"]', patient.password);
    
    // Accept terms
    await page.check('[name="agreeToTerms"]');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/registration-form-mumbai.png', fullPage: true });
    
    // Submit form
    console.log('✅ Submitting registration...');
    await page.click('button:has-text("Register")');
    
    // Wait for success
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/registration-success-mumbai.png', fullPage: true });
    
    // Verify success message
    const successMessage = page.locator('text=/Registration successful|Please login/i');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Registration successful');
    
    // Login and verify
    console.log('🔐 Logging in to verify patient ID...');
    await page.click('text=Login');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="email"]', patient.email);
    await page.fill('input[type="password"]', patient.password);
    await page.click('button:has-text("Login")');
    
    await page.waitForTimeout(3000);
    
    // Get token and verify
    const token = await page.evaluate(() => localStorage.getItem('token'));
    
    if (token) {
      const response = await page.request.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const userData = await response.json();
      console.log('📋 User data:', JSON.stringify(userData, null, 2));
      
      // Verify patient ID
      expect(userData.globalPatientId).toMatch(patient.expectedPatientId);
      expect(userData.locationCode).toBe(patient.expectedLocationCode);
      expect(userData.registeredLocation).toBe('Mumbai');
      
      console.log(`✅ Patient ID verified: ${userData.globalPatientId}`);
      console.log(`✅ Location code verified: ${userData.locationCode}`);
    }
  });

  test('should register Delhi patient with patient ID', async ({ page }) => {
    console.log('🧪 Test: Register Delhi patient');
    
    const patient = testData.delhi;
    
    // Click Register tab
    await page.click('text=Register');
    await page.waitForTimeout(500);
    
    // Fill form
    await page.fill('[name="fullName"]', patient.fullName);
    await page.fill('[name="email"]', patient.email);
    await page.fill('[name="phone"]', patient.phone);
    
    // Select location
    console.log(`📍 Selecting location: ${patient.location}`);
    await page.click('[name="location"]');
    await page.waitForTimeout(300);
    await page.click(`text=${patient.location}`);
    
    await page.fill('[name="password"]', patient.password);
    await page.fill('[name="confirmPassword"]', patient.password);
    await page.check('[name="agreeToTerms"]');
    
    await page.screenshot({ path: 'test-results/registration-form-delhi.png', fullPage: true });
    
    // Submit
    await page.click('button:has-text("Register")');
    await page.waitForTimeout(2000);
    
    // Verify
    const successMessage = page.locator('text=/Registration successful|Please login/i');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Registration successful');
  });

  test('should show all location options in dropdown', async ({ page }) => {
    console.log('🔍 Test: Verify all location options');
    
    // Click Register tab
    await page.click('text=Register');
    await page.waitForTimeout(500);
    
    // Click location dropdown
    await page.click('[name="location"]');
    await page.waitForTimeout(300);
    
    // Verify all cities are present
    const expectedCities = [
      'Chennai, Tamil Nadu',
      'Mumbai, Maharashtra',
      'Delhi',
      'Bangalore, Karnataka',
      'Hyderabad, Telangana',
      'Kolkata, West Bengal',
      'Pune, Maharashtra'
    ];
    
    for (const city of expectedCities) {
      const cityOption = page.locator(`text=${city}`);
      await expect(cityOption).toBeVisible();
      console.log(`✅ Found: ${city}`);
    }
    
    // Take screenshot of dropdown
    await page.screenshot({ path: 'test-results/location-dropdown.png', fullPage: true });
    
    console.log('✅ All location options verified');
  });

  test('should have Chennai as default location', async ({ page }) => {
    console.log('🔍 Test: Verify default location');
    
    // Click Register tab
    await page.click('text=Register');
    await page.waitForTimeout(500);
    
    // Check default value
    const locationField = page.locator('[name="location"]');
    const defaultValue = await locationField.inputValue();
    
    expect(defaultValue).toBe('Chennai');
    console.log('✅ Default location is Chennai');
  });

  test('should validate required fields including location', async ({ page }) => {
    console.log('🔍 Test: Verify form validation');
    
    // Click Register tab
    await page.click('text=Register');
    await page.waitForTimeout(500);
    
    // Try to submit empty form
    await page.click('button:has-text("Register")');
    await page.waitForTimeout(500);
    
    // Should show validation errors
    const errorMessages = page.locator('text=/Please|required/i');
    await expect(errorMessages.first()).toBeVisible();
    
    console.log('✅ Form validation working');
  });

  test('complete registration workflow with screenshots', async ({ page }) => {
    console.log('📸 Test: Complete workflow with screenshots');
    
    const patient = {
      fullName: 'Complete Workflow Test',
      email: `workflow.test.${timestamp}@test.com`,
      phone: '+91 9876543299',
      location: 'Bangalore, Karnataka',
      password: 'Test@123'
    };
    
    // Step 1: Initial page
    await page.screenshot({ path: 'test-results/workflow-01-initial.png', fullPage: true });
    
    // Step 2: Click Register
    await page.click('text=Register');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/workflow-02-register-tab.png', fullPage: true });
    
    // Step 3: Fill name
    await page.fill('[name="fullName"]', patient.fullName);
    await page.screenshot({ path: 'test-results/workflow-03-name-filled.png', fullPage: true });
    
    // Step 4: Fill email
    await page.fill('[name="email"]', patient.email);
    await page.screenshot({ path: 'test-results/workflow-04-email-filled.png', fullPage: true });
    
    // Step 5: Fill phone
    await page.fill('[name="phone"]', patient.phone);
    await page.screenshot({ path: 'test-results/workflow-05-phone-filled.png', fullPage: true });
    
    // Step 6: Select location
    await page.click('[name="location"]');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/workflow-06-location-dropdown.png', fullPage: true });
    
    await page.click(`text=${patient.location}`);
    await page.screenshot({ path: 'test-results/workflow-07-location-selected.png', fullPage: true });
    
    // Step 7: Fill password
    await page.fill('[name="password"]', patient.password);
    await page.screenshot({ path: 'test-results/workflow-08-password-filled.png', fullPage: true });
    
    // Step 8: Confirm password
    await page.fill('[name="confirmPassword"]', patient.password);
    await page.screenshot({ path: 'test-results/workflow-09-confirm-password.png', fullPage: true });
    
    // Step 9: Accept terms
    await page.check('[name="agreeToTerms"]');
    await page.screenshot({ path: 'test-results/workflow-10-terms-accepted.png', fullPage: true });
    
    // Step 10: Submit
    await page.click('button:has-text("Register")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/workflow-11-submitted.png', fullPage: true });
    
    console.log('✅ Complete workflow captured with screenshots');
  });
});

test.describe('Patient ID Format Validation', () => {
  
  test('should generate sequential patient IDs for same location', async ({ page }) => {
    console.log('🔢 Test: Sequential ID generation');
    
    // Register two patients in same location
    const patients = [
      {
        fullName: 'Sequential Test 1',
        email: `seq1.${timestamp}@test.com`,
        phone: '+91 9876543220',
        location: 'Pune, Maharashtra',
        password: 'Test@123'
      },
      {
        fullName: 'Sequential Test 2',
        email: `seq2.${timestamp}@test.com`,
        phone: '+91 9876543221',
        location: 'Pune, Maharashtra',
        password: 'Test@123'
      }
    ];
    
    const patientIds: string[] = [];
    
    for (const patient of patients) {
      await page.goto(`${BASE_URL}/login`);
      await page.click('text=Register');
      await page.waitForTimeout(500);
      
      await page.fill('[name="fullName"]', patient.fullName);
      await page.fill('[name="email"]', patient.email);
      await page.fill('[name="phone"]', patient.phone);
      
      await page.click('[name="location"]');
      await page.waitForTimeout(300);
      await page.click(`text=${patient.location}`);
      
      await page.fill('[name="password"]', patient.password);
      await page.fill('[name="confirmPassword"]', patient.password);
      await page.check('[name="agreeToTerms"]');
      
      await page.click('button:has-text("Register")');
      await page.waitForTimeout(2000);
      
      // Login to get patient ID
      await page.click('text=Login');
      await page.waitForTimeout(500);
      
      await page.fill('input[type="email"]', patient.email);
      await page.fill('input[type="password"]', patient.password);
      await page.click('button:has-text("Login")');
      await page.waitForTimeout(3000);
      
      const token = await page.evaluate(() => localStorage.getItem('token'));
      if (token) {
        const response = await page.request.get(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await response.json();
        patientIds.push(userData.globalPatientId);
        console.log(`✅ Patient ID: ${userData.globalPatientId}`);
      }
    }
    
    // Verify sequential IDs
    if (patientIds.length === 2) {
      const [id1, id2] = patientIds;
      const num1 = parseInt(id1.split('-')[2]);
      const num2 = parseInt(id2.split('-')[2]);
      
      expect(num2).toBe(num1 + 1);
      console.log(`✅ Sequential IDs verified: ${id1} → ${id2}`);
    }
  });
});
