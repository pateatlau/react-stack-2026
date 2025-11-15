#!/bin/bash

echo "======================================"
echo "Frontend Phase 1 - MFE Integration Test"
echo "======================================"
echo ""
echo "Date: $(date)"
echo "Node Version: $(node --version)"
echo "npm Version: $(npm --version)"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 3)
    
    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response, expected $expected)"
        return 1
    fi
}

# Check if servers are running
echo "=== Checking MFE Servers ==="
echo ""

test_endpoint "Shell (Host)" "http://localhost:5173" "200"
test_endpoint "Auth MFE" "http://localhost:5174" "200"
test_endpoint "Todos MFE" "http://localhost:5175" "200"
test_endpoint "Chatbot MFE" "http://localhost:5176" "200"

echo ""
echo "=== Checking Remote Entry Points ==="
echo ""

test_endpoint "Auth remoteEntry.js" "http://localhost:5174/assets/remoteEntry.js" "200"
test_endpoint "Todos remoteEntry.js" "http://localhost:5175/assets/remoteEntry.js" "200"
test_endpoint "Chatbot remoteEntry.js" "http://localhost:5176/assets/remoteEntry.js" "200"

echo ""
echo "=== Performance Metrics ==="
echo ""

# Test startup times
for port in 5173 5174 5175 5176; do
    start_time=$(date +%s%N)
    curl -s "http://localhost:$port" > /dev/null
    end_time=$(date +%s%N)
    elapsed=$((($end_time - $start_time) / 1000000))
    
    case $port in
        5173) name="Shell" ;;
        5174) name="Auth MFE" ;;
        5175) name="Todos MFE" ;;
        5176) name="Chatbot MFE" ;;
    esac
    
    echo "$name (Port $port): ${elapsed}ms response time"
done

echo ""
echo "=== Backend Configuration ==="
echo ""

if [ -f ".env.development" ]; then
    echo "Environment: .env.development"
    grep "VITE_API_URL" .env.development
    grep "VITE_GRAPHQL_URL" .env.development
else
    echo -e "${YELLOW}⚠ Warning: .env.development not found${NC}"
fi

echo ""
echo "=== Process Status ==="
echo ""

vite_processes=$(ps aux | grep vite | grep -E "5173|5174|5175|5176" | grep -v grep | wc -l | tr -d ' ')
echo "Vite processes running: $vite_processes/4"

if [ "$vite_processes" = "4" ]; then
    echo -e "${GREEN}✓ All MFE servers are running${NC}"
else
    echo -e "${RED}✗ Not all servers running (expected 4, found $vite_processes)${NC}"
fi

echo ""
echo "=== Manual Testing Instructions ==="
echo ""
echo "1. Open http://localhost:5173 in your browser"
echo "2. Test navigation:"
echo "   - Click 'Login' to load Auth MFE"
echo "   - Click 'Todos' to load Todos MFE"
echo "   - Click 'Chat' to load Chatbot MFE"
echo "3. Check browser DevTools:"
echo "   - Network tab for remoteEntry.js loading"
echo "   - Console for any errors"
echo "   - React DevTools for component tree"
echo ""
echo "=== Test Complete ==="
