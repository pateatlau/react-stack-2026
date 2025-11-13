#!/bin/bash

# GraphQL Frontend Integration - Testing Script
# This script tests all GraphQL operations to ensure they work correctly

set -e

echo "========================================"
echo "GraphQL Frontend Integration Tests"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function to test GraphQL queries
test_graphql() {
    local test_name=$1
    local query=$2
    local expected_field=$3
    
    echo -n "Testing: $test_name... "
    
    response=$(curl -s http://localhost:4000/graphql \
        -H "Content-Type: application/json" \
        -d "{\"query\":\"$query\"}")
    
    if echo "$response" | grep -q "$expected_field"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "Response: $response"
        ((FAILED++))
        return 1
    fi
}

# Helper function to test REST API
test_rest() {
    local test_name=$1
    local endpoint=$2
    local expected_field=$3
    
    echo -n "Testing: $test_name... "
    
    response=$(curl -s "http://localhost:4000$endpoint")
    
    if echo "$response" | grep -q "$expected_field"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "Response: $response"
        ((FAILED++))
        return 1
    fi
}

echo "1. Backend Connectivity Tests"
echo "------------------------------"

# Check if GraphQL server is running
test_graphql "GraphQL Server Health" "{ __typename }" "Query"

# Check if REST API is running
test_rest "REST API Health" "/api/todos?limit=1" "data"

echo ""
echo "2. GraphQL Query Tests"
echo "----------------------"

# Test GetTodos query
test_graphql "Get Todos (Paginated)" \
    "query { todos(page: 1, limit: 5) { data { id title completed } meta { total page limit totalPages } } }" \
    "data"

# Test GetTodo query (using first todo ID)
TODO_ID=$(curl -s http://localhost:4000/graphql \
    -H "Content-Type: application/json" \
    -d '{"query":"{ todos(page: 1, limit: 1) { data { id } } }"}' \
    | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$TODO_ID" ]; then
    test_graphql "Get Single Todo by ID" \
        "query { todo(id: \\\"$TODO_ID\\\") { id title completed } }" \
        "title"
else
    echo -e "${YELLOW}⚠ SKIPPED: Get Single Todo (no todos found)${NC}"
fi

echo ""
echo "3. GraphQL Mutation Tests"
echo "-------------------------"

# Test CreateTodo mutation
CREATE_RESPONSE=$(curl -s http://localhost:4000/graphql \
    -H "Content-Type: application/json" \
    -d '{"query":"mutation { createTodo(input: { title: \"Test Todo from Script\", completed: false }) { id title completed } }"}')

if echo "$CREATE_RESPONSE" | grep -q "Test Todo from Script"; then
    echo -e "Testing: Create Todo... ${GREEN}✓ PASSED${NC}"
    ((PASSED++))
    
    # Extract created todo ID for further tests
    CREATED_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    # Test UpdateTodo mutation
    if [ ! -z "$CREATED_ID" ]; then
        test_graphql "Update Todo" \
            "mutation { updateTodo(id: \\\"$CREATED_ID\\\", input: { title: \\\"Updated Test Todo\\\" }) { id title } }" \
            "Updated Test Todo"
        
        # Test ToggleTodo mutation
        test_graphql "Toggle Todo Completion" \
            "mutation { toggleTodo(id: \\\"$CREATED_ID\\\") { id completed } }" \
            "completed"
        
        # Test DeleteTodo mutation
        test_graphql "Delete Todo" \
            "mutation { deleteTodo(id: \\\"$CREATED_ID\\\") }" \
            "true"
    fi
else
    echo -e "Testing: Create Todo... ${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo ""
echo "4. GraphQL Filtering & Sorting Tests"
echo "-------------------------------------"

# Test filtering by completed status
test_graphql "Filter Todos (Completed)" \
    "query { todos(filter: { completed: true }, limit: 5) { data { id completed } } }" \
    "completed"

test_graphql "Filter Todos (Active)" \
    "query { todos(filter: { completed: false }, limit: 5) { data { id completed } } }" \
    "completed"

# Test sorting
test_graphql "Sort Todos by Title" \
    "query { todos(sortBy: title, sortOrder: ASC, limit: 5) { data { id title } } }" \
    "title"

test_graphql "Sort Todos by Date" \
    "query { todos(sortBy: createdAt, sortOrder: DESC, limit: 5) { data { id createdAt } } }" \
    "createdAt"

echo ""
echo "5. REST API Tests (for comparison)"
echo "-----------------------------------"

test_rest "Get Todos (REST)" "/api/todos?page=1&limit=5" "data"
test_rest "Filter Completed (REST)" "/api/todos?completed=true&limit=5" "completed"
test_rest "Sort by Title (REST)" "/api/todos?sortBy=title&sortOrder=ASC&limit=5" "title"

echo ""
echo "6. Frontend Integration Tests"
echo "------------------------------"

# Check if frontend is accessible
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "Testing: Frontend Server... ${GREEN}✓ PASSED${NC}"
    ((PASSED++))
    
    # Check if routes are accessible
    for route in "/" "/rest" "/graphql"; do
        if curl -s "http://localhost:5173$route" | grep -q "<!doctype html"; then
            echo -e "Testing: Route $route... ${GREEN}✓ PASSED${NC}"
            ((PASSED++))
        else
            echo -e "Testing: Route $route... ${RED}✗ FAILED${NC}"
            ((FAILED++))
        fi
    done
else
    echo -e "Testing: Frontend Server... ${RED}✗ FAILED${NC}"
    echo -e "${YELLOW}⚠ Frontend server not running. Start with: npm run dev${NC}"
    ((FAILED++))
fi

echo ""
echo "========================================"
echo "Test Results Summary"
echo "========================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review the output above.${NC}"
    exit 1
fi
