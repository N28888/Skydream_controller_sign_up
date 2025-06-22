#!/bin/bash

# VPS连接配置
VPS_USER="your-username"
VPS_IP="your-vps-ip"
VPS_PATH="/home/$VPS_USER/skydream-project"

echo "🚀 开始上传项目到VPS..."

# 检查参数
if [ "$1" = "" ]; then
    echo "❌ 请提供VPS IP地址"
    echo "用法: ./upload-to-vps.sh <vps-ip> [username]"
    exit 1
fi

VPS_IP=$1
VPS_USER=${2:-root}

echo "📡 连接到VPS: $VPS_USER@$VPS_IP"
echo "📁 目标路径: $VPS_PATH"

# 创建远程目录
echo "📂 创建远程目录..."
ssh $VPS_USER@$VPS_IP "mkdir -p $VPS_PATH"

# 上传文件（排除node_modules和.git）
echo "📤 上传项目文件..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude '.env' \
    . $VPS_USER@$VPS_IP:$VPS_PATH

# 设置权限
echo "🔐 设置文件权限..."
ssh $VPS_USER@$VPS_IP "chmod +x $VPS_PATH/deploy.sh"

echo "✅ 上传完成！"
echo "🔧 下一步："
echo "1. SSH连接到VPS: ssh $VPS_USER@$VPS_IP"
echo "2. 进入项目目录: cd $VPS_PATH"
echo "3. 编辑docker-compose.yml配置"
echo "4. 运行部署: ./deploy.sh" 