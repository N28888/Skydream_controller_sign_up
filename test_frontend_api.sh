#!/bin/bash

echo "🧪 测试前端API调用..."

# 1. 登录获取token
echo "=== 1. 登录获取token ==="
LOGIN_RESPONSE=$(curl -s -X POST http://sj.yfanj.ca:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
    echo "❌ 无法获取token"
    exit 1
fi

echo ""
echo "=== 2. 测试获取活动列表（前端首页调用）==="
curl -X GET http://sj.yfanj.ca:3001/api/events \
  -H "Content-Type: application/json" \
  -w "\n状态码: %{http_code}\n"

echo ""
echo "=== 3. 测试获取用户信息（前端登录后调用）==="
curl -X GET http://sj.yfanj.ca:3001/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n状态码: %{http_code}\n"

echo ""
echo "=== 4. 测试获取用户列表（用户管理页面）==="
curl -X GET http://sj.yfanj.ca:3001/api/users/all \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n状态码: %{http_code}\n"

echo ""
echo "=== 5. 测试获取活动详情（活动详情页面）==="
curl -X GET http://sj.yfanj.ca:3001/api/events/1 \
  -H "Content-Type: application/json" \
  -w "\n状态码: %{http_code}\n"

echo ""
echo "=== 6. 测试获取活动席位（活动详情页面）==="
curl -X GET http://sj.yfanj.ca:3001/api/events/1/positions \
  -H "Content-Type: application/json" \
  -w "\n状态码: %{http_code}\n"

echo ""
echo "=== 7. 测试前端页面访问 ==="
echo "测试前端首页:"
curl -I http://sj.yfanj.ca/ | head -5

echo ""
echo "测试前端登录页面:"
curl -I http://sj.yfanj.ca/login | head -5 