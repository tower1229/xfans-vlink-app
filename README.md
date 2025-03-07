# XFans VLink App

## 技术栈

- Next.js 15.1.7
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL
- TailwindCSS
- MobX
- Viem

## 环境变量配置

本项目使用环境变量来管理敏感信息和配置。请按照以下步骤设置环境变量：

1. 在项目根目录创建一个 `.env` 文件（已提供 `.env.example` 作为模板）
2. 填写以下必要的环境变量：

```bash
# 数据库配置
DATABASE_URL_UNPOOLED=postgres://user:password@endpoint.neon.tech/neondb?sslmode=require

# JWT 配置
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRES_IN=7d

# Web3 配置
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_RPC_URL=your_rpc_url_here
```

### 环境变量说明

| 变量名                   | 描述             | 是否必需 |
| ------------------------ | ---------------- | -------- |
| DATABASE_URL_UNPOOLED    | 数据库连接 URL   | 是       |
| JWT_SECRET               | JWT 密钥         | 是       |
| JWT_EXPIRES_IN           | JWT 过期时间     | 是       |
| REFRESH_TOKEN_SECRET     | 刷新令牌密钥     | 是       |
| REFRESH_TOKEN_EXPIRES_IN | 刷新令牌过期时间 | 是       |
| NEXT_PUBLIC_CHAIN_ID     | 区块链网络 ID    | 是       |
| NEXT_PUBLIC_RPC_URL      | RPC 节点 URL     | 是       |

## 开发说明

### 安装依赖

```bash
yarn install
```

### 初始化数据库

```bash
# 生成 Prisma Client
yarn prisma:generate

# 运行数据库迁移
yarn prisma:migrate

# 启动 Prisma Studio（可选）
yarn prisma:studio
```

### 启动开发服务器

```bash
yarn dev
```

### 构建生产版本

```bash
yarn build
```

### 启动生产服务器

```bash
yarn start
```

## 数据库架构

本项目使用 PostgreSQL 数据库，通过 Prisma ORM 进行管理。

### 付费内容表 (posts)

| 字段名       | 类型     | 描述           |
| ------------ | -------- | -------------- |
| id           | String   | 内容 ID (主键) |
| title        | String   | 内容标题       |
| image        | String   | 内容图片 URL   |
| price        | BigInt   | 内容价格       |
| tokenAddress | String   | 代币合约地址   |
| chainId      | Int      | 区块链 ID      |
| ownerAddress | String   | 内容所有者地址 |
| createdAt    | DateTime | 创建时间       |
| updatedAt    | DateTime | 更新时间       |

### 订单表 (orders)

| 字段名    | 类型     | 描述           |
| --------- | -------- | -------------- |
| id        | String   | 订单 ID (主键) |
| userId    | String   | 用户 ID (外键) |
| postId    | String   | 内容 ID (外键) |
| status    | Int      | 订单状态       |
| amount    | BigInt   | 订单金额       |
| txHash    | String?  | 交易哈希       |
| expiresAt | DateTime | 过期时间       |
| createdAt | DateTime | 创建时间       |
| updatedAt | DateTime | 更新时间       |

### 用户表 (users)

| 字段名        | 类型     | 描述           |
| ------------- | -------- | -------------- |
| id            | String   | 用户 ID (主键) |
| username      | String   | 用户名         |
| email         | String?  | 电子邮件       |
| password      | String   | 密码哈希       |
| walletAddress | String?  | 钱包地址       |
| role          | String   | 用户角色       |
| createdAt     | DateTime | 创建时间       |
| updatedAt     | DateTime | 更新时间       |

### 刷新令牌表 (refresh_tokens)

| 字段名    | 类型     | 描述           |
| --------- | -------- | -------------- |
| id        | String   | 令牌 ID (主键) |
| token     | String   | 刷新令牌       |
| userId    | String   | 用户 ID (外键) |
| expiresAt | DateTime | 过期时间       |
| createdAt | DateTime | 创建时间       |

## API 文档

API 文档使用 OpenAPI 规范，可以在 `openapi.json` 文件中查看完整的 API 定义。

## 安全注意事项

- 不要将 `.env` 文件提交到版本控制系统中
- 确保所有敏感信息都通过环境变量配置
- 定期更新依赖包以修复潜在的安全漏洞
- 使用 HTTPS 进行所有 API 通信
- 遵循 JWT 最佳实践进行身份验证

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request
