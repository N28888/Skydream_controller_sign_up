#!/bin/bash

echo "🧪 测试API功能..."

# 测试登录API
echo "=== 测试登录API ==="
curl -X POST http://sj.yfanj.ca:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -w "\n状态码: %{http_code}\n"

echo ""
echo "=== 测试获取用户列表API ==="
curl -X GET http://sj.yfanj.ca:3001/api/users/all \
  -H "Content-Type: application/json" \
  -w "\n状态码: %{http_code}\n"

echo ""
echo "=== 测试获取活动列表API ==="
curl -X GET http://sj.yfanj.ca:3001/api/events \
  -H "Content-Type: application/json" \
  -w "\n状态码: %{http_code}\n" 