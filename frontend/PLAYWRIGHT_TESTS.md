# 🎭 Playwright UI Automation Tests - Patient ID Registration

## 📋 Test Suite Overview

Comprehensive UI automation tests for the location-based patient ID generation system.

---

## 🧪 Test Coverage

### Test Suite: Patient ID Registration System

1. **Location Dropdown Visibility**
   - ✅ Verifies location dropdown exists in registration form
   - ✅ Checks all 7 cities are available
   - ✅ Validates Chennai is default location

2. **Chennai Patient Registration**
   - ✅ Fills complete registration form
   - ✅ Selects Chennai location
   - ✅ Submits registration
   - ✅ Logs in to verify patient ID
   - ✅ Validates format: CHN-2025-XXXXX

3. **Mumbai Patient Registration**
   - ✅ Registers patient in Mumbai
   - ✅ Validates format: MUM-2025-XXXXX
   - ✅ Verifies location code: MUM

4. **Delhi Patient Registration**
   - ✅ Registers patient in Delhi
   - ✅ Validates format: DEL-2025-XXXXX

5. **Location Options Verification**
   - ✅ Chennai, Tamil Nadu
   - ✅ Mumbai, Maharashtra
   - ✅ Delhi
   - ✅ Bangalore, Karnataka
   - ✅ Hyderabad, Telangana
   - ✅ Kolkata, West Bengal
   - ✅ Pune, Maharashtra

6. **Form Validation**
   - ✅ Tests required field validation
   - ✅ Verifies error messages

7. **Complete Workflow with Screenshots**
   - ✅ Captures 11 screenshots of entire flow
   - ✅ Documents each step visually

8. **Sequential ID Generation**
   - ✅ Registers two patients in same location
   - ✅ Verifies IDs increment sequentially

---

## 🚀 Running the Tests

### Prerequisites

```bash
# Ensure services are running
docker-compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:5001
```

### Run All Tests (Headless)

```bash
cd frontend
chmod +x run-patient-id-tests.sh
./run-patient-id-tests.sh
```

### Run Tests with Browser Visible

```bash
npx playwright test tests/patient-id-registration.spec.ts --headed
```

### Run Specific Test

```bash
# Run only Chennai patient test
npx playwright test tests/patient-id-registration.spec.ts -g "Chennai"

# Run only location dropdown test
npx playwright test tests/patient-id-registration.spec.ts -g "location dropdown"
```

### Debug Mode

```bash
npx playwright test tests/patient-id-registration.spec.ts --debug
```

### View Test Report

```bash
npx playwright show-report
```

---

## 📸 Screenshots

Tests automatically capture screenshots at key points:

### Workflow Screenshots (11 total):
1. `workflow-01-initial.png` - Initial page load
2. `workflow-02-register-tab.png` - Register tab clicked
3. `workflow-03-name-filled.png` - Name field filled
4. `workflow-04-email-filled.png` - Email field filled
5. `workflow-05-phone-filled.png` - Phone field filled
6. `workflow-06-location-dropdown.png` - Location dropdown opened
7. `workflow-07-location-selected.png` - Location selected
8. `workflow-08-password-filled.png` - Password filled
9. `workflow-09-confirm-password.png` - Confirm password filled
10. `workflow-10-terms-accepted.png` - Terms accepted
11. `workflow-11-submitted.png` - Form submitted

### Test-Specific Screenshots:
- `registration-form-chennai.png`
- `registration-success-chennai.png`
- `registration-form-mumbai.png`
- `registration-success-mumbai.png`
- `registration-form-delhi.png`
- `location-dropdown.png`

All screenshots saved in: `test-results/`

---

## ✅ Expected Test Results

### Successful Test Run:

```
🎭 Patient ID Registration - UI Automation Tests
==================================================

✅ Services are running

🧪 Running Playwright UI tests...
==================================================

Running 8 tests using 1 worker

  ✓ should display location dropdown in registration form (5s)
  ✓ should register Chennai patient with patient ID (12s)
  ✓ should register Mumbai patient with patient ID (11s)
  ✓ should register Delhi patient with patient ID (10s)
  ✓ should show all location options in dropdown (3s)
  ✓ should have Chennai as default location (2s)
  ✓ should validate required fields including location (3s)
  ✓ complete registration workflow with screenshots (8s)

8 passed (54s)

==================================================
📊 TEST RESULTS
==================================================
✅ ALL TESTS PASSED!

📸 Screenshots saved in: test-results/
📄 HTML report: playwright-report/index.html
```

---

## 🔍 What Each Test Verifies

### Test 1: Location Dropdown Visibility
**Purpose:** Ensure location field is present and visible

**Steps:**
1. Navigate to /login
2. Click Register tab
3. Verify "Hospital Location" label exists
4. Verify location dropdown is visible

**Expected:** ✅ Location dropdown visible

---

### Test 2-4: Patient Registration (Chennai, Mumbai, Delhi)
**Purpose:** Test complete registration flow with different locations

**Steps:**
1. Navigate to /login
2. Click Register tab
3. Fill form:
   - Full Name
   - Email (unique)
   - Phone
   - Location (select from dropdown)
   - Password
   - Confirm Password
   - Accept terms
4. Submit form
5. Verify success message
6. Login with credentials
7. Fetch user data via API
8. Verify patient ID format and location code

**Expected:**
- ✅ Registration successful
- ✅ Patient ID format: CODE-YYYY-NNNNN
- ✅ Location code matches selected city
- ✅ All fields saved correctly

---

### Test 5: All Location Options
**Purpose:** Verify all 7 cities are available

**Steps:**
1. Open location dropdown
2. Check each city is visible:
   - Chennai, Tamil Nadu
   - Mumbai, Maharashtra
   - Delhi
   - Bangalore, Karnataka
   - Hyderabad, Telangana
   - Kolkata, West Bengal
   - Pune, Maharashtra

**Expected:** ✅ All 7 cities visible

---

### Test 6: Default Location
**Purpose:** Verify Chennai is pre-selected

**Steps:**
1. Open registration form
2. Check location field value

**Expected:** ✅ Default value is "Chennai"

---

### Test 7: Form Validation
**Purpose:** Test required field validation

**Steps:**
1. Open registration form
2. Click submit without filling
3. Verify error messages appear

**Expected:** ✅ Validation errors shown

---

### Test 8: Complete Workflow
**Purpose:** Document entire flow with screenshots

**Steps:**
1-11. Each step captured as screenshot

**Expected:** ✅ 11 screenshots saved

---

### Test 9: Sequential IDs
**Purpose:** Verify IDs increment for same location

**Steps:**
1. Register patient 1 in Pune
2. Register patient 2 in Pune
3. Compare patient IDs

**Expected:**
- ✅ Patient 1: PUN-2025-00001
- ✅ Patient 2: PUN-2025-00002
- ✅ Sequential increment verified

---

## 🐛 Troubleshooting

### Tests Fail: "Location dropdown not found"

**Cause:** Frontend not updated with location field

**Solution:**
```bash
# Restart frontend
docker-compose restart frontend

# Or rebuild
docker-compose up --build frontend
```

### Tests Fail: "Patient ID not generated"

**Cause:** Backend not updated or migration not run

**Solution:**
```bash
# Restart backend
docker-compose restart backend

# Check backend logs
docker-compose logs backend | grep "patient"
```

### Tests Timeout

**Cause:** Services not running or slow response

**Solution:**
```bash
# Check services
docker-compose ps

# Restart all
docker-compose restart
```

### Screenshots Not Saved

**Cause:** test-results directory doesn't exist

**Solution:**
```bash
mkdir -p test-results
```

---

## 📊 Test Metrics

- **Total Tests:** 8
- **Average Duration:** ~54 seconds
- **Screenshots Generated:** 17+
- **API Calls Verified:** 8+
- **Form Fields Tested:** 7
- **Location Options:** 7
- **Patient ID Formats:** 3 (CHN, MUM, DEL)

---

## 🎯 Success Criteria

All tests must pass with:

- ✅ Location dropdown visible
- ✅ All 7 cities available
- ✅ Chennai is default
- ✅ Registration succeeds for all locations
- ✅ Patient IDs generated correctly
- ✅ Format: CODE-YYYY-NNNNN
- ✅ Location codes match (CHN, MUM, DEL, etc.)
- ✅ Sequential IDs increment
- ✅ Form validation works
- ✅ Screenshots captured

---

## 📝 Test Data

Tests use unique emails with timestamp to avoid conflicts:

```typescript
const timestamp = Date.now();
const email = `chennai.ui.test.${timestamp}@test.com`;
```

**Test Patients Created:**
- chennai.ui.test.{timestamp}@test.com
- mumbai.ui.test.{timestamp}@test.com
- delhi.ui.test.{timestamp}@test.com
- workflow.test.{timestamp}@test.com
- seq1.{timestamp}@test.com
- seq2.{timestamp}@test.com

---

## 🔄 Continuous Integration

### GitHub Actions Example:

```yaml
name: Patient ID Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Start services
        run: docker-compose up -d
      - name: Run tests
        run: npm run test:patient-id
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)

---

**Status:** ✅ Ready to run!  
**Last Updated:** 2025-10-11  
**Test Suite Version:** 1.0
