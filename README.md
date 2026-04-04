# Ontology Management System - Java EE Architecture

## 架构概述

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐     ┌──────────┐
│   React     │────▶│    BFF      │────▶│  Java Spring    │────▶│  MySQL   │
│   Frontend  │◄────│  (Node.js)  │◄────│    Backend      │◄────│          │
└─────────────┘     └─────────────┘     └─────────────────┘     └──────────┘
     :3000               :3001               :8080               :3306
```

## 技术栈

- **前端**: React 19 + TypeScript + Vite + Tailwind CSS
- **BFF**: Node.js + Express + TypeScript
- **后端**: Spring Boot 3 + Java 17 + MyBatis-Plus
- **数据库**: MySQL 8.0

## 前置要求

1. **Java 17+**
2. **Maven 3.8+**
3. **Node.js 18+**
4. **MySQL 8.0+**

## 快速启动

### 1. 启动 MySQL

确保 MySQL 运行在 localhost:3306，并创建数据库：

```sql
CREATE DATABASE ontology CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

数据库配置（在 `backend/src/main/resources/application.yml`）：
- URL: `jdbc:mysql://localhost:3306/ontology`
- 用户名: `root`
- 密码: `12345678`

### 2. 一键启动所有服务

```bash
./start.sh
```

这将依次启动：
1. Java 后端 (端口 8080)
2. BFF 服务 (端口 3001)
3. 前端开发服务器 (端口 3000)

### 3. 访问应用

打开浏览器访问: http://localhost:3000

## 手动启动（开发模式）

### 启动 Java 后端

```bash
cd backend
mvn clean package -DskipTests
java -jar target/ontology-backend-1.0.0.jar
```

### 启动 BFF

```bash
cd bff
npm install
npm run dev
```

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

## API 端点

### 通过 BFF 访问 (推荐)

- 前端 -> BFF (http://localhost:3001/api/*)
- BFF -> Java 后端 (http://localhost:8080/api/*)

### 直接访问 Java 后端

- http://localhost:8080/api/ontology - 获取完整本体数据
- http://localhost:8080/api/industries - 行业分类
- http://localhost:8080/api/object-types - 对象类型 CRUD
- http://localhost:8080/api/link-types - 关系类型 CRUD
- http://localhost:8080/api/action-types - 动作类型 CRUD
- http://localhost:8080/api/research-agents - 研究智能体
- http://localhost:8080/api/ai/conversations - AI 对话

## 环境变量

### BFF (.env)

```
PORT=3001
JAVA_BACKEND_URL=http://localhost:8080
GEMINI_API_KEY=your_gemini_api_key_here
```

### 前端 (.env)

前端通过 Vite 代理访问 BFF，无需额外配置。

## 项目结构

```
ontology-java/
├── frontend/              # React 前端
│   ├── src/
│   │   ├── api/          # API 客户端
│   │   ├── components/   # React 组件
│   │   ├── pages/        # 页面组件
│   │   └── store/        # 状态管理
│   ├── package.json
│   └── vite.config.ts
├── bff/                   # Node.js BFF
│   ├── src/
│   │   ├── routes/       # API 路由
│   │   │   ├── ai.ts     # AI 功能路由
│   │   │   ├── agent.ts  # Agent 路由
│   │   │   └── research-agents.ts
│   │   └── index.ts      # 主入口
│   └── package.json
├── backend/               # Java Spring Boot
│   ├── src/main/java/com/ontology/
│   │   ├── controller/   # REST 控制器
│   │   ├── service/      # 业务逻辑
│   │   ├── mapper/       # MyBatis 映射器
│   │   └── entity/       # 实体类
│   └── pom.xml
└── start.sh              # 一键启动脚本
```

## 功能特性

- ✅ 本体建模（对象类型、关系类型、动作类型）
- ✅ 行业分类管理（申万行业）
- ✅ AI 辅助本体生成（Gemini API）
- ✅ 研究智能体（定时追踪、事件分析）
- ✅ 动作执行引擎
- ✅ 多轮对话式本体构建

## 许可证

MIT
