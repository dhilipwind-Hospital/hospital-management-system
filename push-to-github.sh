#!/bin/bash

echo "🚀 Pushing Hospital Management System to GitHub..."

# Navigate to project directory
cd "/Users/dhilipelango/Project Hospital 3/hospital-website"

# Check current remote
echo "Current remote:"
git remote -v

# You need to run this command with your GitHub Personal Access Token
echo ""
echo "⚠️  To push, you need a GitHub Personal Access Token"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Select 'repo' scope"
echo "4. Copy the token"
echo ""
echo "Then run:"
echo "git remote set-url origin https://YOUR_TOKEN@github.com/dhilipwind-Hospital/hospital-management-system.git"
echo "git push -u origin main"
echo ""
echo "Replace YOUR_TOKEN with your actual token"
