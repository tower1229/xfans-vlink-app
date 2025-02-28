# vlink-xfans

## 环境变量配置

本项目使用环境变量来管理敏感信息和配置。请按照以下步骤设置环境变量：

1. 在项目根目录创建一个 `.env` 文件（已提供 `.env.example` 作为模板）
2. 填写以下必要的环境变量：

```
# 支付配置
VERIFIER_PRIVATE_KEY=your_private_key_here
PAYMENT_CONTRACT_ADDRESS=your_payment_contract_address_here

# Neon Database 连接信息
DATABASE_URL=postgres://user:password@endpoint.neon.tech/neondb?sslmode=require
```

### 环境变量说明

| 变量名                   | 描述                   | 是否必需 |
| ------------------------ | ---------------------- | -------- |
| VERIFIER_PRIVATE_KEY     | 用于签名订单的私钥     | 是       |
| PAYMENT_CONTRACT_ADDRESS | 支付合约地址           | 是       |
| DATABASE_URL             | Neon Database 连接 URL | 是       |

### 安全注意事项

- 不要将 `.env` 文件提交到版本控制系统中
- 在生产环境中，确保私钥等敏感信息安全存储

## 在 Vercel 上部署

本项目可以轻松部署到 Vercel 平台，并使用 Neon Database 数据库。

### 步骤 1: 创建 Vercel 账户

如果您还没有 Vercel 账户，请前往 [Vercel](https://vercel.com) 注册一个账户。

### 步骤 2: 创建 Neon Database 账户

1. 前往 [Neon](https://neon.tech) 注册一个账户
2. 创建一个新项目
3. 获取数据库连接字符串

### 步骤 3: 安装 Vercel CLI (可选)

```bash
npm install -g vercel
```

### 步骤 4: 部署项目

#### 方法 1: 使用 Vercel 仪表板

1. 在 Vercel 仪表板中点击 "New Project"
2. 导入您的 Git 仓库
3. 配置项目设置
4. 在 "Environment Variables" 部分添加必要的环境变量，包括 `DATABASE_URL`
5. 点击 "Deploy"

#### 方法 2: 使用 Vercel CLI

```bash
# 登录 Vercel
vercel login

# 部署项目
vercel
```

### 步骤 5: 初始化数据库

部署完成后，访问以下 API 端点初始化数据库：

```
https://your-vercel-domain.vercel.app/api/init-db
```

这将创建必要的数据库表并填充示例产品数据。

## 数据库架构

本项目使用 Neon PostgreSQL 数据库存储产品和订单信息。

### 产品表 (products)

| 字段名        | 类型      | 描述                     |
| ------------- | --------- | ------------------------ |
| id            | VARCHAR   | 产品 ID (主键)           |
| title         | VARCHAR   | 产品标题                 |
| image         | VARCHAR   | 产品图片 URL             |
| price         | VARCHAR   | 产品价格 (BigInt 字符串) |
| token_address | VARCHAR   | 代币合约地址             |
| chain_id      | INTEGER   | 区块链 ID                |
| owner_address | VARCHAR   | 产品所有者地址           |
| created_at    | TIMESTAMP | 创建时间                 |
| updated_at    | TIMESTAMP | 更新时间                 |

### 订单表 (orders)

| 字段名           | 类型      | 描述                     |
| ---------------- | --------- | ------------------------ |
| id               | VARCHAR   | 订单 ID (主键)           |
| product_id       | VARCHAR   | 产品 ID (外键)           |
| user_address     | VARCHAR   | 用户地址                 |
| price            | VARCHAR   | 订单价格 (BigInt 字符串) |
| token_address    | VARCHAR   | 代币合约地址             |
| owner_address    | VARCHAR   | 产品所有者地址           |
| chain_id         | INTEGER   | 区块链 ID                |
| status           | VARCHAR   | 订单状态                 |
| signature        | TEXT      | 订单签名                 |
| transaction_hash | VARCHAR   | 交易哈希                 |
| created_at       | TIMESTAMP | 创建时间                 |
| expires_at       | TIMESTAMP | 过期时间                 |

### 数据库管理接口

- `GET /api/init-db` - 初始化数据库

## 关于 Neon Database

[Neon](https://neon.tech) 是一个无服务器 PostgreSQL 数据库服务，具有以下特点：

- 自动扩展
- 按使用付费
- 无需管理基础设施
- 与 Vercel 无缝集成
- 支持 PostgreSQL 的所有功能
