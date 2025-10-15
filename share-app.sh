#!/bin/bash

# Ayphen Hospital - Quick Share Script
# Makes your application accessible to anyone on the internet

echo "🏥 Ayphen Hospital - Share Application"
echo "======================================"
echo ""

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker not running. Start Docker Desktop first!"
    exit 1
fi

# Check ngrok
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok not installed!"
    echo ""
    echo "Install now:"
    echo "  brew install ngrok"
    echo ""
    echo "Then setup:"
    echo "  1. Sign up: https://dashboard.ngrok.com/signup"
    echo "  2. Get token: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "  3. Run: ngrok config add-authtoken YOUR_TOKEN"
    exit 1
fi

echo "✅ Prerequisites OK"
echo ""

# Start services
echo "🚀 Starting application..."
docker-compose up -d

echo "⏳ Waiting 30 seconds for services..."
sleep 30

echo ""
echo "✅ Application running!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Open 2 NEW terminal windows and run:"
echo ""
echo "Terminal 1 (Frontend):"
echo "  cd /Users/dhilipelango/Project\\ Hospital/hospital-website"
echo "  ngrok http 3000 --region=in"
echo ""
echo "Terminal 2 (Backend):"
echo "  cd /Users/dhilipelango/Project\\ Hospital/hospital-website"
echo "  ngrok http 5001 --region=in"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 SHARE WITH OTHERS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Copy the FRONTEND ngrok URL (https://xxx.ngrok.io)"
echo "Send it to anyone - they can access from anywhere!"
echo ""
echo "Test Accounts:"
echo "  • Admin: admin@hospital.com / Admin@2025"
echo "  • Doctor: doctor@example.com / doctor123"
echo "  • Patient: patient.demo@example.com / patient123"
echo ""
echo "Monitor: http://localhost:4040"
echo ""
echo "🛑 To stop: docker-compose down"
echo ""
