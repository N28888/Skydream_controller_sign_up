# Skydream Controller Sign Up Platform

Skydreamclub管制员活动报名系统

## 项目结构

```
Skydream_controller_sign_up/
├── frontend/          # React前端
├── backend/           # Node.js后端
└── README.md
```

## 技术栈

- **前端**: React + TypeScript + Ant Design
- **后端**: Node.js + Express + TypeScript
- **数据库**: MySQL
- **认证**: JWT

## 快速开始

### 1. 数据库设置

1. 安装MySQL
2. 创建数据库并导入初始化脚本：
```sql
source backend/src/config/init.sql
```

### 2. 后端设置

```bash
cd backend
npm install
cp env.example .env
# 编辑.env文件，配置数据库连接信息
npm run dev
```

### 3. 前端设置

```bash
cd frontend
npm install
npm start
```

## 管制员等级权限

- **S1**: DEL, GND, TWR
- **S2**: DEL, GND, TWR, APP
- **S3**: 除FSS外所有席位
- **C1+**: 所有席位（包括FSS）
- **I1+**: 所有席位，并可填写监管学员

## 开发进度

- [x] 项目初始化
- [x] 数据库设计与实现
- [x] 用户系统开发
- [x] 前端页面开发
- [ ] 活动与席位管理
- [ ] 席位报名与权限控制
- [ ] 管理员可在前端修改用户权限等级 