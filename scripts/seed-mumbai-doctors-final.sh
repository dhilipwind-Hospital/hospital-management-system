#!/bin/bash

# 🏥 Seed Mumbai Doctors - Final Working Version
# Uses the new /api/dev/seed-mumbai-doctors endpoint
# Run from project root: bash scripts/seed-mumbai-doctors-final.sh

echo "🏥 Seeding Mumbai Doctors..."
echo "=========================================="

# Call the new endpoint
RESPONSE=$(curl -s -X POST http://localhost:5001/api/dev/seed-mumbai-doctors)

# Check if successful
if echo "$RESPONSE" | grep -q "Mumbai doctors seeded successfully"; then
  echo "✅ SUCCESS!"
  echo ""
  echo "$RESPONSE" | jq '{message, password, location, count}'
  echo ""
  echo "📋 Doctors Created:"
  echo "$RESPONSE" | jq -r '.doctors[] | "  ✅ \(.name) (\(.email))"'
  echo ""
  echo "=========================================="
  echo "🧪 Test Login:"
  echo "  curl -X POST http://localhost:5001/api/auth/login \\"
  echo "    -H 'Content-Type: application/json' \\"
  echo "    -d '{\"email\":\"cardiology.mum.chief@example.com\",\"password\":\"Doctor@123\"}'"
  echo ""
  echo "📍 All doctors registered to: Mumbai"
  echo "🔐 All passwords: Doctor@123"
  echo ""
else
  echo "❌ Failed to seed Mumbai doctors"
  echo "$RESPONSE" | jq '.'
fi
