#!/bin/bash

# 🏥 Seed Mumbai Doctors Script V2
# Creates Mumbai doctors using the admin user creation endpoint
# Run from project root: bash scripts/seed-mumbai-doctors-v2.sh

echo "🏥 Starting Mumbai Doctors Seed Process..."
echo "=========================================="

# First, login as admin to get token
echo "🔐 Logging in as admin..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"Admin@2025"}' | jq -r '.accessToken')

if [ "$ADMIN_TOKEN" == "null" ] || [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Failed to get admin token. Is the backend running?"
  exit 1
fi

echo "✅ Admin token obtained"
echo ""

BASE_URL="http://localhost:5001/api/admin/users"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to create a doctor
create_doctor() {
  local email=$1
  local firstName=$2
  local lastName=$3
  local department=$4
  local seniority=$5
  
  echo "  Creating: Dr. $firstName $lastName ($seniority)"
  
  RESPONSE=$(curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{
      \"email\": \"$email\",
      \"firstName\": \"$firstName\",
      \"lastName\": \"$lastName\",
      \"password\": \"Doctor@123\",
      \"role\": \"doctor\",
      \"phone\": \"+91 98765 43210\",
      \"gender\": \"other\",
      \"registeredLocation\": \"Mumbai\",
      \"department\": \"$department\",
      \"preferences\": {
        \"seniority\": \"$seniority\"
      }
    }")
  
  if echo "$RESPONSE" | grep -q "error\|Error\|fail"; then
    echo "  ⚠️  May already exist or error occurred"
  else
    echo "${GREEN}  ✅ Created${NC}"
  fi
}

echo "${BLUE}📌 Creating Cardiology Department (Mumbai)...${NC}"
create_doctor "cardiology.mum.chief@example.com" "Meera" "Shah" "Cardiology" "chief"
create_doctor "cardiology.mum.senior@example.com" "Rahul" "Desai" "Cardiology" "senior"
create_doctor "cardiology.mum.consultant@example.com" "Kavya" "Iyer" "Cardiology" "consultant"
create_doctor "cardiology.mum.practitioner@example.com" "Ajay" "Kulkarni" "Cardiology" "practitioner"

echo ""
echo "${BLUE}📌 Creating General Medicine Department (Mumbai)...${NC}"
create_doctor "general-medicine.mum.chief@example.com" "Anita" "Menon" "General Medicine" "chief"
create_doctor "general-medicine.mum.senior@example.com" "Vivek" "Patil" "General Medicine" "senior"
create_doctor "general-medicine.mum.consultant@example.com" "Riya" "Malhotra" "General Medicine" "consultant"
create_doctor "general-medicine.mum.practitioner@example.com" "Arjun" "Bhat" "General Medicine" "practitioner"

echo ""
echo "${BLUE}📌 Creating Pediatrics Department (Mumbai)...${NC}"
create_doctor "pediatrics.mum.chief@example.com" "Sneha" "Kapoor" "Pediatrics" "chief"
create_doctor "pediatrics.mum.senior@example.com" "Nikhil" "Rao" "Pediatrics" "senior"
create_doctor "pediatrics.mum.consultant@example.com" "Pooja" "Singh" "Pediatrics" "consultant"
create_doctor "pediatrics.mum.practitioner@example.com" "Manav" "Kamat" "Pediatrics" "practitioner"

echo ""
echo "=========================================="
echo "${GREEN}✅ Mumbai Doctors Seed Complete!${NC}"
echo ""
echo "📊 Summary:"
echo "  - Cardiology: 4 doctors"
echo "  - General Medicine: 4 doctors"
echo "  - Pediatrics: 4 doctors"
echo "  - Total: 12 Mumbai doctors"
echo ""
echo "🔐 All accounts use password: Doctor@123"
echo "📍 All accounts registered to: Mumbai"
echo ""
echo "📋 See docs/MUMBAI_DOCTOR_TEST_ACCOUNTS.md for credentials"
echo ""
echo "🧪 Test login:"
echo "  curl -X POST http://localhost:5001/api/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"cardiology.mum.chief@example.com\",\"password\":\"Doctor@123\"}'"
echo ""
