#!/bin/bash

# Run Patient ID Registration UI Tests
# Automated Playwright tests for location-based patient ID generation

echo "🎭 Patient ID Registration - UI Automation Tests"
echo "=================================================="
echo ""

# Check if services are running
echo "🔍 Checking if services are running..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Frontend not running on http://localhost:3000"
    echo "   Please start: docker-compose up"
    exit 1
fi

if ! curl -s http://localhost:5001/api > /dev/null; then
    echo "❌ Backend not running on http://localhost:5001"
    echo "   Please start: docker-compose up"
    exit 1
fi

echo "✅ Services are running"
echo ""

# Create test-results directory
mkdir -p test-results

# Run Playwright tests
echo "🧪 Running Playwright UI tests..."
echo "=================================================="
echo ""

npx playwright test tests/patient-id-registration.spec.ts \
  --reporter=list \
  --reporter=html

TEST_EXIT_CODE=$?

echo ""
echo "=================================================="
echo "📊 TEST RESULTS"
echo "=================================================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ ALL TESTS PASSED!"
    echo ""
    echo "📸 Screenshots saved in: test-results/"
    echo "📄 HTML report: playwright-report/index.html"
    echo ""
    echo "To view the report:"
    echo "  npx playwright show-report"
else
    echo "❌ SOME TESTS FAILED!"
    echo ""
    echo "📸 Screenshots saved in: test-results/"
    echo "📄 HTML report: playwright-report/index.html"
    echo ""
    echo "To view the report:"
    echo "  npx playwright show-report"
fi

echo "=================================================="

exit $TEST_EXIT_CODE
