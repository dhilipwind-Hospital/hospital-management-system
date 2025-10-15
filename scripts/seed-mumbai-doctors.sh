#!/bin/bash

# 🏥 Seed Mumbai Doctors Script
# Creates all Mumbai branch doctors via dev API
# Run from project root: bash scripts/seed-mumbai-doctors.sh

echo "🏥 Starting Mumbai Doctors Seed Process..."
echo "=========================================="

BASE_URL="http://localhost:5001/api/dev/seed-doctors-by-department"

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "${BLUE}📌 Creating Cardiology Department (Mumbai)...${NC}"

echo "  Creating Chief: Dr. Meera Shah"
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Cardiology",
    "email": "cardiology.mum.chief@example.com",
    "firstName": "Meera",
    "lastName": "Shah",
    "password": "Doctor@123",
    "role": "DOCTOR",
    "seniority": "chief",
    "location": "Mumbai"
  }' > /dev/null && echo "${GREEN}  ✅ Chief created${NC}"

echo "  Creating Senior: Dr. Rahul Desai"
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Cardiology",
    "email": "cardiology.mum.senior@example.com",
    "firstName": "Rahul",
    "lastName": "Desai",
    "password": "Doctor@123",
    "role": "DOCTOR",
    "seniority": "senior",
    "location": "Mumbai"
  }' > /dev/null && echo "${GREEN}  ✅ Senior created${NC}"

echo "  Creating Consultant: Dr. Kavya Iyer"
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Cardiology",
    "email": "cardiology.mum.consultant@example.com",
    "firstName": "Kavya",
    "lastName": "Iyer",
    "password": "Doctor@123",
    "role": "DOCTOR",
    "seniority": "consultant",
    "location": "Mumbai"
  }' > /dev/null && echo "${GREEN}  ✅ Consultant created${NC}"

echo "  Creating Practitioner: Dr. Ajay Kulkarni"
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Cardiology",
    "email": "cardiology.mum.practitioner@example.com",
    "firstName": "Ajay",
    "lastName": "Kulkarni",
    "password": "Doctor@123",
    "role": "DOCTOR",
    "seniority": "practitioner",
    "location": "Mumbai"
  }' > /dev/null && echo "${GREEN}  ✅ Practitioner created${NC}"

echo ""
echo "${BLUE}📌 Creating General Medicine Department (Mumbai)...${NC}"

echo "  Creating Chief: Dr. Anita Menon"
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "department": "General Medicine",
    "email": "general-medicine.mum.chief@example.com",
    "firstName": "Anita",
    "lastName": "Menon",
    "password": "Doctor@123",
    "role": "DOCTOR",
    "seniority": "chief",
    "location": "Mumbai"
  }' > /dev/null && echo "${GREEN}  ✅ Chief created${NC}"

echo "  Creating Senior: Dr. Vivek Patil"
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "department": "General Medicine",
    "email": "general-medicine.mum.senior@example.com",
    "firstName": "Vivek",
    "lastName": "Patil",
    "password": "Doctor@123",
    "role": "DOCTOR",
    "seniority": "senior",
    "location": "Mumbai"
  }' > /dev/null && echo "${GREEN}  ✅ Senior created${NC}"

echo "  Creating Consultant: Dr. Riya Malhotra"
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "department": "General Medicine",
    "email": "general-medicine.mum.consultant@example.com",
    "firstName": "Riya",
    "lastName": "Malhotra",
    "password": "Doctor@123",
    "role": "DOCTOR",
    "seniority": "consultant",
    "location": "Mumbai"
  }' > /dev/null && echo "${GREEN}  ✅ Consultant created${NC}"

echo "  Creating Practitioner: Dr. Arjun Bhat"
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "department": "General Medicine",
    "email": "general-medicine.mum.practitioner@example.com",
    "firstName": "Arjun",
    "lastName": "Bhat",
    "password": "Doctor@123",
    "role": "DOCTOR",
    "seniority": "practitioner",
    "location": "Mumbai"
  }' > /dev/null && echo "${GREEN}  ✅ Practitioner created${NC}"

echo ""
echo "${BLUE}📌 Creating Pediatrics Department (Mumbai)...${NC}"

echo "  Creating Chief: Dr. Sneha Kapoor"
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Pediatrics",
    "email": "pediatrics.mum.chief@example.com",
    "firstName": "Sneha",
    "lastName": "Kapoor",
    "password": "Doctor@123",
    "role": "DOCTOR",
    "seniority": "chief",
    "location": "Mumbai"
  }' > /dev/null && echo "${GREEN}  ✅ Chief created${NC}"

echo "  Creating Senior: Dr. Nikhil Rao"
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Pediatrics",
    "email": "pediatrics.mum.senior@example.com",
    "firstName": "Nikhil",
    "lastName": "Rao",
    "password": "Doctor@123",
    "role": "DOCTOR",
    "seniority": "senior",
    "location": "Mumbai"
  }' > /dev/null && echo "${GREEN}  ✅ Senior created${NC}"

echo "  Creating Consultant: Dr. Pooja Singh"
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Pediatrics",
    "email": "pediatrics.mum.consultant@example.com",
    "firstName": "Pooja",
    "lastName": "Singh",
    "password": "Doctor@123",
    "role": "DOCTOR",
    "seniority": "consultant",
    "location": "Mumbai"
  }' > /dev/null && echo "${GREEN}  ✅ Consultant created${NC}"

echo "  Creating Practitioner: Dr. Manav Kamat"
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Pediatrics",
    "email": "pediatrics.mum.practitioner@example.com",
    "firstName": "Manav",
    "lastName": "Kamat",
    "password": "Doctor@123",
    "role": "DOCTOR",
    "seniority": "practitioner",
    "location": "Mumbai"
  }' > /dev/null && echo "${GREEN}  ✅ Practitioner created${NC}"

echo ""
echo "=========================================="
echo "${GREEN}✅ Mumbai Doctors Seed Complete!${NC}"
echo ""
echo "📊 Summary:"
echo "  - Cardiology: 4 doctors (Chief, Senior, Consultant, Practitioner)"
echo "  - General Medicine: 4 doctors (Chief, Senior, Consultant, Practitioner)"
echo "  - Pediatrics: 4 doctors (Chief, Senior, Consultant, Practitioner)"
echo "  - Total: 12 Mumbai doctors created"
echo ""
echo "🔐 All accounts use password: Doctor@123"
echo "📍 All accounts registered to: Mumbai"
echo ""
echo "📋 See docs/MUMBAI_DOCTOR_TEST_ACCOUNTS.md for full credentials list"
echo ""
