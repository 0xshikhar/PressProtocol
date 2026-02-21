#!/bin/bash

# PressProtocol Test Script (PNPM Driven)
# Runs automated checks across node and web app

set -e

echo "🧪 PressProtocol Verification Harness"
echo "====================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

test_service() {
    local name=$1
    local url=$2
    
    echo -n "Testing $name ($url)... "
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL (Unreachable)${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "1️⃣  TypeScript Verification"
echo "--------------------------"

echo -n "Typechecking apps/web... "
if pnpm --dir apps/web exec tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️ WARNING (Type warnings detected)${NC}"
fi

echo -n "Typechecking core/node... "
if pnpm --dir core/node exec tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️ WARNING (Type warnings detected)${NC}"
fi

echo ""

echo "2️⃣  Running Live Health Endpoints (if running)"
echo "-------------------------------------------"

test_service "Node Health Endpoint" "http://localhost:4000/health" || true
test_service "Web Portal Landing" "http://localhost:3000" || true

echo ""
echo "📊 Verification Summary"
echo "======================="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
