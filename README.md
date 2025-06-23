# Skydream Controller Sign Up Platform

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.10.5-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)

**天梦管制员活动报名系统** - 一个专为航空管制员设计的活动报名和管理平台

## 🎯 项目简介

Skydream Controller Sign Up Platform 是一个专为航空管制员设计的活动报名和管理系统。系统支持多种管制员等级，提供活动创建、席位管理、报名功能等核心服务，帮助管制员更好地组织和参与飞行活动。

### 主要特点

- 🛫 **专业管制员系统** - 专为航空管制员设计的专业平台
- 👥 **多等级权限管理** - 支持S1-S3、C1-C3、I1-I3、SUP、ADM等级
- 📅 **活动管理** - 完整的活动创建、编辑、删除功能
- 🎯 **席位报名** - 智能席位分配和权限控制
- 🔐 **安全认证** - JWT token认证，确保数据安全
- 📱 **响应式设计** - 支持桌面和移动设备访问

## ✨ 功能特性

### 用户管理
- ✅ 用户注册和登录
- ✅ 多等级权限控制
- ✅ 用户信息管理
- ✅ 密码加密存储

### 活动管理
- ✅ 活动创建和编辑
- ✅ 活动详情展示
- ✅ 活动列表管理
- ✅ AIRAC周期管理

### 席位管理
- ✅ 席位创建和分配
- ✅ 批量席位创建
- ✅ 席位类型管理（DEL、GND、TWR、APP、CTR、FSS）
- ✅ 席位状态跟踪

### 报名系统
- ✅ 智能权限控制
- ✅ 席位报名和取消
- ✅ 监督员指定
- ✅ 报名记录管理

### 仪表板
- ✅ 实时统计数据
- ✅ 最近活动展示
- ✅ 个人报名记录
- ✅ 快速操作入口

## 🛠 技术栈

### 前端
- **框架**: React 19.1.0 + TypeScript 4.9.5
- **UI库**: Ant Design 5.26.1
- **路由**: React Router DOM 7.6.2
- **HTTP客户端**: Axios 1.10.0
- **日期处理**: Day.js 1.11.13
- **构建工具**: Create React App 5.0.1

### 后端
- **运行时**: Node.js 20.10.5
- **框架**: Express.js 4.18.2
- **语言**: TypeScript 5.3.3
- **数据库**: MySQL 8.0
- **ORM**: MySQL2 3.6.5
- **认证**: JWT 9.0.2 + bcryptjs 2.4.3
- **安全**: Helmet 7.1.0
- **日志**: Morgan 1.10.0

### 部署
- **容器化**: Docker + Docker Compose
- **Web服务器**: Nginx
- **数据库**: MySQL 8.0

## 📁 项目结构

```
Skydream_controller_sign_up/
├── frontend/                 # React前端应用
│   ├── public/              # 静态资源
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API服务
│   │   ├── types/           # TypeScript类型定义
│   │   └── App.tsx          # 应用入口
│   ├── package.json         # 前端依赖配置
│   └── Dockerfile           # 前端Docker配置
├── backend/                 # Node.js后端应用
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由定义
│   │   ├── middleware/      # 中间件
│   │   └── index.ts         # 应用入口
│   ├── package.json         # 后端依赖配置
│   └── Dockerfile           # 后端Docker配置
├── docker-compose.yml       # Docker Compose配置
├── deploy.sh               # 部署脚本
├── deploy-update.sh        # 更新部署脚本
└── README.md               # 项目说明文档
```

## 🎛 用户权限系统

### 管制员等级

| 等级 | 名称 | 可报名席位 | 特殊权限 |
|------|------|------------|----------|
| S1 | 学员1级 | DEL, GND | 基础席位 |
| S2 | 学员2级 | DEL, GND, TWR | 塔台席位 |
| S3 | 学员3级 | DEL, GND, TWR, APP | 进近席位 |
| C1 | 管制员1级 | DEL, GND, TWR, APP | 完整席位 |
| C2 | 管制员2级 | DEL, GND, TWR, APP, CTR | 区调席位 |
| C3 | 管制员3级 | 所有席位 | 最高席位权限 |
| I1 | 教员1级 | 所有席位 | 可监督学员 |
| I2 | 教员2级 | 所有席位 | 可监督学员 |
| I3 | 教员3级 | 所有席位 | 可监督学员 |
| SUP | 监督员 | 所有席位 | 管理权限 |
| ADM | 管理员 | 所有权限 | 系统管理 |

### 席位类型

- **DEL** - 放行席位
- **GND** - 地面席位
- **TWR** - 塔台席位
- **APP** - 进近席位
- **CTR** - 区调席位
- **FSS** - 飞行服务站

## 📚 API文档

### 认证相关

#### 用户注册
```
POST /api/users/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### 用户登录
```
POST /api/users/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

### 活动管理

#### 获取活动列表
```
GET /api/events
Authorization: Bearer <token>
```

#### 创建活动
```
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "departure_airport": "string",
  "arrival_airport": "string",
  "route": "string",
  "flight_level": "string",
  "airac": "string",
  "event_date": "YYYY-MM-DD",
  "event_time": "HH:mm:ss"
}
```

### 席位管理

#### 获取活动席位
```
GET /api/events/:eventId/positions
Authorization: Bearer <token>
```

#### 报名席位
```
POST /api/positions/:id/signup
Authorization: Bearer <token>
Content-Type: application/json

{
  "student_supervised": "string" // 可选，监督员用户名
}
```

## 📄 许可证

本项目采用 MIT 许可证

## 📞 联系方式

- 项目地址: [https://github.com/N28888/Skydream_controller_sign_up]

---

**Skydream Controller Sign Up Platform** - 让航空管制活动管理更简单、更高效！ 