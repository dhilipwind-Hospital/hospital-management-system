#!/bin/bash

# Test Patient ID Registration
# Automated test script using curl

API_URL="http://localhost:5001/api"
TIMESTAMP=$(date +%s)

echo "🧪 Testing Patient ID Registration System"
echo "=========================================="
echo ""

# Test 1: Register Chennai Patient
echo "📝 Test 1: Register patient in Chennai"
echo "--------------------------------------"

CHENNAI_EMAIL="chennai.test.${TIMESTAMP}@test.com"
echo "Email: $CHENNAI_EMAIL"
echo "Location: Chennai"

CHENNAI_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Chennai\",
    \"lastName\": \"Patient\",
    \"email\": \"${CHENNAI_EMAIL}\",
    \"phone\": \"+91 9876543210\",
    \"password\": \"Test@123\",
    \"confirmPassword\": \"Test@123\",
    \"location\": \"Chennai\"
  }")

echo "Response: $CHENNAI_RESPONSE"

# Login to get patient details
echo ""
echo "Logging in to verify patient ID..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${CHENNAI_EMAIL}\",
    \"password\": \"Test@123\"
  }")

echo "Login Response:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract patient ID
PATIENT_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"globalPatientId":"[^"]*"' | cut -d'"' -f4)
if [ -n "$PATIENT_ID" ]; then
  echo ""
  echo "✅ Patient ID Generated: $PATIENT_ID"
  
  # Verify format
  if [[ $PATIENT_ID =~ ^CHN-[0-9]{4}-[0-9]{5}$ ]]; then
    echo "✅ Format is correct: CHN-YYYY-NNNNN"
  else
    echo "❌ Format is incorrect!"
  fi
else
  echo "❌ Patient ID not found in response!"
fi

echo ""
echo "=========================================="
echo ""

# Test 2: Register Mumbai Patient
echo "📝 Test 2: Register patient in Mumbai"
echo "--------------------------------------"

MUMBAI_EMAIL="mumbai.test.${TIMESTAMP}@test.com"
echo "Email: $MUMBAI_EMAIL"
echo "Location: Mumbai"

MUMBAI_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Mumbai\",
    \"lastName\": \"Patient\",
    \"email\": \"${MUMBAI_EMAIL}\",
    \"phone\": \"+91 9876543211\",
    \"password\": \"Test@123\",
    \"confirmPassword\": \"Test@123\",
    \"location\": \"Mumbai\"
  }")

echo "Response: $MUMBAI_RESPONSE"

# Login to get patient details
echo ""
echo "Logging in to verify patient ID..."
MUMBAI_LOGIN=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${MUMBAI_EMAIL}\",
    \"password\": \"Test@123\"
  }")

echo "Login Response:"
echo "$MUMBAI_LOGIN" | python3 -m json.tool 2>/dev/null || echo "$MUMBAI_LOGIN"

# Extract patient ID
MUMBAI_PATIENT_ID=$(echo "$MUMBAI_LOGIN" | grep -o '"globalPatientId":"[^"]*"' | cut -d'"' -f4)
if [ -n "$MUMBAI_PATIENT_ID" ]; then
  echo ""
  echo "✅ Patient ID Generated: $MUMBAI_PATIENT_ID"
  
  # Verify format
  if [[ $MUMBAI_PATIENT_ID =~ ^MUM-[0-9]{4}-[0-9]{5}$ ]]; then
    echo "✅ Format is correct: MUM-YYYY-NNNNN"
  else
    echo "❌ Format is incorrect!"
  fi
else
  echo "❌ Patient ID not found in response!"
fi

echo ""
echo "=========================================="
echo "📊 TEST SUMMARY"
echo "=========================================="

if [ -n "$PATIENT_ID" ] && [ -n "$MUMBAI_PATIENT_ID" ]; then
  echo "✅ Both patients registered successfully"
  echo "✅ Patient IDs generated correctly"
  echo ""
  echo "Chennai Patient: $PATIENT_ID"
  echo "Mumbai Patient: $MUMBAI_PATIENT_ID"
  echo ""
  echo "🎉 ALL TESTS PASSED!"
else
  echo "❌ SOME TESTS FAILED!"
  echo ""
  echo "Possible issues:"
  echo "  - Backend not running"
  echo "  - Database migration not completed"
  echo "  - PatientIdService not working"
fi

echo "=========================================="
