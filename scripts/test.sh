#!/bin/bash

# AnonPress Test Script
# Run tests and verify setup

set -e

echo "🧪 AnonPress Test Suite"
echo "======================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_service() {
    local name=$1
    local url=$2
    
    echo -n "Testing $name... "
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Backend tests
echo "🔧 Backend API Tests"
echo "-------------------"

test_service "Health endpoint" "http://localhost:4000/health"
test_service "Ready endpoint" "http://localhost:4000/health/ready"
test_service "Live endpoint" "http://localhost:4000/health/live"

# Test API endpoints
echo -n "Testing content list endpoint... "
if curl -s "http://localhost:4000/api/content" | grep -q "success"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((TESTS_FAILED++))
fi

echo -n "Testing discovery endpoint... "
if curl -s "http://localhost:4000/api/discovery" | grep -q "success"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((TESTS_FAILED++))
fi

echo ""

# Web app tests
echo "🌐 Web App Tests"
echo "---------------"

test_service "Home page" "http://localhost:3000"
test_service "Publish page" "http://localhost:3000/publish"
test_service "Dashboard page" "http://localhost:3000/dashboard"

echo ""

# Database tests
echo "🗄️  Database Tests"
echo "-----------------"

echo -n "Testing database connection... "
cd backend
if npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((TESTS_FAILED++))
fi
cd ..

echo ""

# Summary
echo "📊 Test Summary"
echo "==============="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total:  $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
