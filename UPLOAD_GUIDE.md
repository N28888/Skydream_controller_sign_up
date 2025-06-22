# 上传到VPS指南

## 快速上传

### 方法一：使用上传脚本（推荐）

```bash
# 1. 确保SSH密钥已配置
ssh-copy-id user@your-vps-ip

# 2. 运行上传脚本
./upload-to-vps.sh your-vps-ip username
```

### 方法二：手动上传

```bash
# 使用scp上传
scp -r . user@your-vps-ip:/home/user/skydream-project

# 或使用rsync（更高效）
rsync -avz --exclude 'node_modules' --exclude '.git' . user@your-vps-ip:/home/user/skydream-project
```

## 上传前准备

### 1. 确保SSH连接正常
```bash
# 测试SSH连接
ssh user@your-vps-ip
```

### 2. 检查VPS环境
```bash
# 检查Docker是否安装
ssh user@your-vps-ip "docker --version"

# 检查Docker Compose是否安装
ssh user@your-vps-ip "docker-compose --version"
```

## 上传后配置

### 1. 连接到VPS
```bash
ssh user@your-vps-ip
```

### 2. 进入项目目录
```bash
cd /home/user/skydream-project
```

### 3. 编辑配置文件
```bash
# 编辑docker-compose.yml
nano docker-compose.yml

# 修改以下配置：
# - MYSQL_ROOT_PASSWORD: 设置安全的MySQL root密码
# - MYSQL_PASSWORD: 设置数据库用户密码
# - JWT_SECRET: 设置JWT密钥
# - CORS_ORIGIN: 设置你的域名
```

### 4. 部署应用
```bash
./deploy.sh
```

## 常见问题

### SSH连接失败
```bash
# 检查SSH密钥
ls -la ~/.ssh/

# 生成SSH密钥（如果没有）
ssh-keygen -t rsa -b 4096

# 复制密钥到VPS
ssh-copy-id user@your-vps-ip
```

### 权限问题
```bash
# 在VPS上设置权限
chmod +x deploy.sh
chmod +x upload-to-vps.sh
```

### 网络问题
```bash
# 检查防火墙
sudo ufw status

# 开放必要端口
sudo ufw allow 22   # SSH
sudo ufw allow 80   # HTTP
sudo ufw allow 443  # HTTPS
sudo ufw allow 3001 # API
``` 