#!/usr/bin/env bash

# Load .env if it exists
if [ -f .env ]; then
    # Simple .env loader
    export $(grep -v '^#' .env | xargs)
fi

PORT=${APP_PORT:-8000}
PATH_PREFIX=${APP_PATH:-/watchtracker}
BASE_URL="http://localhost:${PORT}${PATH_PREFIX}"

echo "Testing cookie functionality on ${BASE_URL}..."

# Test 1: Check if server is responding
echo "1. Testing server connectivity..."
response=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/)
if [ "$response" -eq 200 ]; then
    echo "✓ Server is responding (HTTP $response)"
else
    echo "✗ Server not responding (HTTP $response) at ${BASE_URL}/"
    exit 1
fi

# Test 2: Test login endpoint and check for Set-Cookie header
echo "2. Testing login endpoint for Set-Cookie header..."
cookie_header=$(curl -s -I -X POST \
    -d "user=testuser&passwd=testpass" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    ${BASE_URL}/login | grep -i "set-cookie")

if [ -n "$cookie_header" ]; then
    echo "✓ Set-Cookie header found:"
    echo "  $cookie_header"
else
    echo "✗ No Set-Cookie header found"
    echo "3. Full response headers:"
    curl -s -I -X POST \
        -d "user=testuser&passwd=testpass" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        ${BASE_URL}/login
fi