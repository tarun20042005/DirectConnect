#!/bin/bash

# Test login endpoint
echo "🧪 Testing login with test@example.com / Test@1234"
echo "=================================================="

curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }' | jq . 2>/dev/null || echo "Failed - check if server is running"

echo ""
echo "✅ If you see a token above, login works!"
