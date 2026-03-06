# feature-graphql GraphQL API 功能

**模块特定约束**

### API 方向

- **仅处理读操作**: GraphQL 查询
- **不处理写操作**: 写操作由 REST 端点处理（feature-admin, feature-core 等）

### 多租户

- 确保返回的数据已经过租户过滤（通过底层服务实现）

### 禁止

- ❌ 禁止处理写操作（Mutation）
