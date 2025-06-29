#!/bin/bash

echo "🧪 测试带认证的API功能..."

# 1. 登录获取token
echo "=== 1. 登录获取token ==="
LOGIN_RESPONSE=$(curl -s -X POST http://sj.yfanj.ca:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "登录响应: $LOGIN_RESPONSE"

# 提取token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "获取到的token: $TOKEN"

if [ -z "$TOKEN" ]; then
    echo "❌ 无法获取token，登录失败"
    exit 1
fi

echo ""
echo "=== 2. 测试获取用户信息 ==="
curl -X GET http://sj.yfanj.ca:3001/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n状态码: %{http_code}\n"

echo ""
echo "=== 3. 测试获取用户列表（需要ADM权限）==="
curl -X GET http://sj.yfanj.ca:3001/api/users/all \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n状态码: %{http_code}\n"

echo ""
echo "=== 4. 测试创建活动（需要SUP/ADM权限）==="
curl -X POST http://sj.yfanj.ca:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"测试活动","departure_airport":"ZBAA","arrival_airport":"ZSPD","route":"A461","flight_level":"FL300","airac":"2506","event_date":"2025-07-01","event_time":"14:00:00"}' \
  -w "\n状态码: %{http_code}\n"

echo ""
echo "=== 5. 测试获取活动列表（无需权限）==="
curl -X GET http://sj.yfanj.ca:3001/api/events \
  -H "Content-Type: application/json" \
  -w "\n状态码: %{http_code}\n" 