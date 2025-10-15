#!/bin/bash

# 🏥 Seed Mumbai Doctors Script V3
# Creates Mumbai doctors using the registration endpoint
# Run from project root: bash scripts/seed-mumbai-doctors-v3.sh

echo "🏥 Starting Mumbai Doctors Seed Process..."
echo "=========================================="

BASE_URL="http://localhost:5001/api/auth/register"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to create a doctor via registration
create_doctor() {
  local email=$1
  local firstName=$2
  local lastName=$3
  
  echo "  Registering: Dr. $firstName $lastName"
  
  RESPONSE=$(curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$email\",
      \"firstName\": \"$firstName\",
      \"lastName\": \"$lastName\",
      \"password\": \"Doctor@123\",
      \"phone\": \"+91 98765 43210\",
      \"role\": \"doctor\",
      \"location\": \"Mumbai\",
      \"agreeToTerms\": true
    }")
  
  if echo "$RESPONSE" | grep -q "already exists"; then
    echo "${YELLOW}  ⚠️  Already exists${NC}"
  elif echo "$RESPONSE" | grep -q "success\|created"; then
    echo "${GREEN}  ✅ Created${NC}"
  else
    echo "${GREEN}  ✅ Registered${NC}"
  fi
}

echo "${BLUE}📌 Creating Cardiology Department (Mumbai)...${NC}"
create_doctor "cardiology.mum.chief@example.com" "Meera" "Shah"
create_doctor "cardiology.mum.senior@example.com" "Rahul" "Desai"
create_doctor "cardiology.mum.consultant@example.com" "Kavya" "Iyer"
create_doctor "cardiology.mum.practitioner@example.com" "Ajay" "Kulkarni"

echo ""
echo "${BLUE}📌 Creating General Medicine Department (Mumbai)...${NC}"
create_doctor "general-medicine.mum.chief@example.com" "Anita" "Menon"
create_doctor "general-medicine.mum.senior@example.com" "Vivek" "Patil"
create_doctor "general-medicine.mum.consultant@example.com" "Riya" "Malhotra"
create_doctor "general-medicine.mum.practitioner@example.com" "Arjun" "Bhat"

echo ""
echo "${BLUE}📌 Creating Pediatrics Department (Mumbai)...${NC}"
create_doctor "pediatrics.mum.chief@example.com" "Sneha" "Kapoor"
create_doctor "pediatrics.mum.senior@example.com" "Nikhil" "Rao"
create_doctor "pediatrics.mum.consultant@example.com" "Pooja" "Singh"
create_doctor "pediatrics.mum.practitioner@example.com" "Manav" "Kamat"

echo ""
echo "=========================================="
echo "${GREEN}✅ Mumbai Doctors Registration Complete!${NC}"
echo ""
echo "${YELLOW}⚠️  NOTE: Doctors registered with 'doctor' role${NC}"
echo "${YELLOW}   Admin must update their role to 'DOCTOR' if needed${NC}"
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
