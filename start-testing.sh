#!/bin/bash

# Ayphen Hospital - Testing Deployment Script
# This script sets up ngrok tunnels for remote testing

echo "🏥 Ayphen Hospital - Testing Deployment"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo ""
    echo "Install ngrok:"
    echo "  Mac: brew install ngrok"
    echo "  Or download from: https://ngrok.com/download"
    echo ""
    echo "After installing, run:"
    echo "  ngrok config add-authtoken YOUR_AUTH_TOKEN"
    echo "  Get token from: https://dashboard.ngrok.com/get-started/your-authtoken"
    exit 1
fi

echo "✅ ngrok is installed"
echo ""

# Start Docker containers
echo "🚀 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

# Check if services are running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Services failed to start"
    echo "Check logs: docker-compose logs"
    exit 1
fi

echo "✅ Services are running"
echo ""

# Display service status
echo "📊 Service Status:"
docker-compose ps
echo ""

echo "🌐 Starting ngrok tunnels..."
echo ""
echo "⚠️  IMPORTANT: Keep this terminal open!"
echo "⚠️  Open 2 NEW terminals and run these commands:"
echo ""
echo "Terminal 1 (Frontend):"
echo "  ngrok http 3000 --region=in"
echo ""
echo "Terminal 2 (Backend):"
echo "  ngrok http 5001 --region=in"
echo ""
echo "Then:"
echo "1. Copy the HTTPS URLs from both terminals"
echo "2. Update frontend API URL with backend ngrok URL"
echo "3. Share frontend ngrok URL with testers"
echo ""
echo "📋 Test Accounts:"
echo "  Admin: admin@hospital.com / Admin@2025"
echo "  Doctor: doctor@example.com / doctor123"
echo "  Patient: patient.demo@example.com / patient123"
echo "  Pharmacist: pharmacist@example.com / Pharmacist@123"
echo ""
echo "🔍 Monitor ngrok traffic: http://localhost:4040"
echo ""
echo "🛑 To stop: docker-compose down"
echo ""
echo "✅ Setup complete! Follow the instructions above."
