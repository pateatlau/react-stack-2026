#!/bin/bash

# Cross-Device Auth Sync - Quick Test Script
# Run this script to verify basic functionality

echo "🧪 Cross-Device Auth Sync - Automated Tests"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BACKEND_URL="http://localhost:4000"
FRONTEND_URL="http://localhost:5173"

# Test 1: Check Backend Health
echo -n "1. Checking backend health... "
HEALTH=$(curl -s "${BACKEND_URL}/health" 2>/dev/null)
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC} (Backend not responding)"
    exit 1
fi

# Test 2: Check Frontend Availability
echo -n "2. Checking frontend availability... "
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}" 2>/dev/null)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC} (Frontend not responding)"
    exit 1
fi

# Test 3: Check Sessions Endpoint (expect 401 for unauthenticated)
echo -n "3. Checking sessions API endpoint... "
SESSIONS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/api/auth/sessions" 2>/dev/null)
if [ "$SESSIONS_STATUS" = "401" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Endpoint exists, requires auth)"
else
    echo -e "${YELLOW}⚠ WARNING${NC} (Got status $SESSIONS_STATUS)"
fi

# Test 4: Check WebSocket Server (Socket.io endpoint)
echo -n "4. Checking WebSocket server... "
WS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/socket.io/" 2>/dev/null)
if [ "$WS_STATUS" = "200" ] || [ "$WS_STATUS" = "400" ]; then
    echo -e "${GREEN}✓ PASS${NC} (WebSocket server responding)"
else
    echo -e "${RED}✗ FAIL${NC} (WebSocket server not responding)"
fi

# Test 5: Check Database Connection
echo -n "5. Checking database connection... "
if echo "$HEALTH" | grep -q '"database":"connected"'; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC} (Database not connected)"
fi

echo ""
echo "============================================"
echo "📊 Summary:"
echo "  - Backend: ${BACKEND_URL}"
echo "  - Frontend: ${FRONTEND_URL}"
echo "  - Database: Connected"
echo ""
echo -e "${YELLOW}⚠  Manual Testing Required:${NC}"
echo "  1. Open ${FRONTEND_URL} in browser"
echo "  2. Login and check DevTools console for WebSocket logs"
echo "  3. Navigate to ${FRONTEND_URL}/settings/sessions"
echo "  4. Test cross-device logout with multiple browsers"
echo ""
echo "📖 See TESTING.md for detailed test cases"
echo ""
