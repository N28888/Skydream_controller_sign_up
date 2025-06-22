#!/bin/bash

echo "🚀 开始部署 Skydream Controller Sign Up Platform..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查docker compose（新版本）
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 设置Docker Compose命令
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

# 停止现有容器
echo "🛑 停止现有容器..."
$DOCKER_COMPOSE down

# 清理旧镜像（可选）
echo "🧹 清理旧镜像..."
$DOCKER_COMPOSE down --rmi all

# 构建并启动服务
echo "🔨 构建并启动服务..."
$DOCKER_COMPOSE up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "📊 检查服务状态..."
$DOCKER_COMPOSE ps

# 检查服务健康状态
echo "🏥 检查服务健康状态..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 后端服务运行正常"
else
    echo "❌ 后端服务可能有问题，请检查日志"
fi

echo "✅ 部署完成！"
echo "🌐 前端访问地址: http://sj.yfanj.ca"
echo "🔧 后端API地址: http://sj.yfanj.ca:3001"
echo "📊 查看日志: $DOCKER_COMPOSE logs -f"
echo "🔍 查看特定服务日志: $DOCKER_COMPOSE logs -f [service_name]" 