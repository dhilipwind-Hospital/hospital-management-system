#!/bin/bash

echo "🚀 Deploy Hospital Management System"
echo ""
echo "STEP 1: Get your GitHub Personal Access Token"
echo "Go to: https://github.com/settings/tokens/new"
echo "- Note: Hospital Deploy"
echo "- Expiration: 30 days"  
echo "- Select: repo (full control)"
echo "- Click: Generate token"
echo "- Copy the token (ghp_xxxxx)"
echo ""
read -p "Paste your GitHub token here: " TOKEN
echo ""

cd "/Users/dhilipelango/Project Hospital 3/hospital-website"

# Set remote with token
git remote set-url origin https://$TOKEN@github.com/dhilipwind-Hospital/hospital-management-system.git

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Code is on GitHub!"
    echo ""
    echo "STEP 2: Deploy on Render"
    echo "1. Go to: https://render.com"
    echo "2. Click: New + → Blueprint"
    echo "3. Select: hospital-management-system repository"
    echo "4. Click: Apply"
    echo "5. Wait 15 minutes"
    echo "6. Your app will be live!"
    echo ""
else
    echo "❌ Push failed. Please check your token and try again."
fi
