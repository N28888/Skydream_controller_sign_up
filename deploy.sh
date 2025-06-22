#!/bin/bash

echo "🚀 开始部署 Skydream Controller Sign Up Platform..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose ps

echo "✅ 部署完成！"
echo "🌐 前端访问地址: http://your-vps-ip"
echo "🔧 后端API地址: http://your-vps-ip:3001"
echo "📊 查看日志: docker-compose logs -f" 