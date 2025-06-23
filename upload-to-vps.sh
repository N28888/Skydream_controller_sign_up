#!/bin/bash

# VPS连接配置
VPS_USER=${2:-root}
VPS_IP="$1"
VPS_PATH="/home/your-username/skydream-project"

if [ -z "$VPS_IP" ]; then
    echo "❌ 请提供VPS IP地址"
    echo "用法: ./upload-to-vps.sh <vps-ip> [username]"
    exit 1
fi

echo "🚀 开始上传项目到VPS..."
echo "📡 连接到VPS: $VPS_USER@$VPS_IP"
echo "📁 目标路径: $VPS_PATH"

# 创建远程目录
ssh $VPS_USER@$VPS_IP "mkdir -p $VPS_PATH"

# 上传文件（排除node_modules、.git、.env等）
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude '.env' \
    . $VPS_USER@$VPS_IP:$VPS_PATH

echo "✅ 上传完成！"
echo "🔧 下一步："
echo "1. SSH连接到VPS: ssh $VPS_USER@$VPS_IP"
echo "2. 进入项目目录: cd $VPS_PATH"
echo "3. 进行后续部署操作（如安装依赖、启动服务等）" 