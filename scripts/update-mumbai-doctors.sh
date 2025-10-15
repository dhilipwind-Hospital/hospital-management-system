#!/bin/bash

# 🏥 Update Existing Doctors to Mumbai Location
# Updates seeded doctors to Mumbai branch
# Run from project root: bash scripts/update-mumbai-doctors.sh

echo "🏥 Updating Doctors to Mumbai Location..."
echo "=========================================="

# Login as admin
echo "🔐 Logging in as admin..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"Admin@2025"}' | jq -r '.accessToken')

if [ "$ADMIN_TOKEN" == "null" ] || [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Failed to get admin token"
  exit 1
fi

echo "✅ Admin authenticated"
echo ""

# Array of Mumbai doctor emails
MUMBAI_DOCTORS=(
  "cardiology.mum.chief@example.com"
  "cardiology.mum.senior@example.com"
  "cardiology.mum.consultant@example.com"
  "cardiology.mum.practitioner@example.com"
  "general-medicine.mum.chief@example.com"
  "general-medicine.mum.senior@example.com"
  "general-medicine.mum.consultant@example.com"
  "general-medicine.mum.practitioner@example.com"
  "pediatrics.mum.chief@example.com"
  "pediatrics.mum.senior@example.com"
  "pediatrics.mum.consultant@example.com"
  "pediatrics.mum.practitioner@example.com"
)

echo "📝 Updating ${#MUMBAI_DOCTORS[@]} doctors to Mumbai location..."
echo ""

for email in "${MUMBAI_DOCTORS[@]}"; do
  echo "  Updating: $email"
  
  # Get user ID
  USER_ID=$(curl -s -X GET "http://localhost:5001/api/admin/users?email=$email" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.users[0].id // empty')
  
  if [ -z "$USER_ID" ]; then
    echo "    ⚠️  User not found, skipping"
    continue
  fi
  
  # Update location
  curl -s -X PATCH "http://localhost:5001/api/admin/users/$USER_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"registeredLocation\": \"Mumbai\"}" > /dev/null
  
  echo "    ✅ Updated to Mumbai"
done

echo ""
echo "=========================================="
echo "✅ Mumbai Location Update Complete!"
echo ""
echo "🧪 Test login:"
echo "  curl -X POST http://localhost:5001/api/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"cardiology.mum.chief@example.com\",\"password\":\"Doctor@123\"}'"
echo ""
