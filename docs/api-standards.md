# API 设计标准

## API 协议选择

| 操作类型 | 协议 | 说明 |
|---------|------|------|
| **查询（读）** | GraphQL | 灵活查询，减少往返次数 |
| **命令（写）** | REST | 明确的资源操作语义 |

## GraphQL 规范（查询）

### 使用场景
- 数据查询
- 复杂关联数据获取
- 前端需要灵活选择字段

### Schema 设计

#### 命名规范
- **Types**: `PascalCase` (e.g., `User`, `AlarmConfiguration`)
- **Fields**: `camelCase` (e.g., `createdAt`, `tenantId`)
- **Queries**: 动词 + 名词 (e.g., `getUser`, `listAlarms`)
- **Mutations**: 动词 + 资源 (e.g., `createUser`, `updateAlarm`)

#### 类型定义示例
```graphql
type User {
  id: ID!
  username: String!
  email: String
  tenantId: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Query {
  # 单条查询
  user(id: ID!): User
  
  # 列表查询（带分页）
  users(
    first: Int = 20
    after: String
    filter: UserFilterInput
    orderBy: UserOrderByInput
  ): UserConnection!
}

input UserFilterInput {
  username: StringFilter
  email: StringFilter
  createdAfter: DateTime
}

input StringFilter {
  equals: String
  contains: String
  startsWith: String
  endsWith: String
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### 分页规范

使用 **Relay Cursor Connections** 规范：

```graphql
query ListUsers($first: Int = 20, $after: String) {
  users(first: $first, after: $after) {
    edges {
      node {
        id
        username
        email
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

### 错误处理

```json
{
  "errors": [
    {
      "message": "User not found",
      "extensions": {
        "code": "NOT_FOUND",
        "field": "id"
      }
    }
  ]
}
```

## REST 规范（命令）

### 使用场景
- 资源创建、更新、删除
- 文件上传/下载
- 批量操作

### URL 设计

#### 资源命名
- 使用复数名词: `/users`, `/alarms`, `/configurations`
- 避免动词，使用 HTTP 方法表达动作
- 层级关系用 `/` 分隔: `/users/{id}/roles`

#### HTTP 方法

| 方法 | 用途 | 示例 |
|------|------|------|
| `GET` | 获取资源 | `GET /users/{id}` |
| `POST` | 创建资源 | `POST /users` |
| `PUT` | 完整更新 | `PUT /users/{id}` |
| `PATCH` | 部分更新 | `PATCH /users/{id}` |
| `DELETE` | 删除资源 | `DELETE /users/{id}` |

### 请求/响应规范

#### 成功响应

**创建成功 (201)**
```json
POST /api/v1/users
{
  "username": "john",
  "email": "john@example.com"
}

Response: 201 Created
{
  "id": "123",
  "username": "john",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**查询成功 (200)**
```json
GET /api/v1/users/123

Response: 200 OK
{
  "id": "123",
  "username": "john",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**列表查询 (200)**
```json
GET /api/v1/users?page=0&size=20&sort=createdAt,desc

Response: 200 OK
{
  "content": [
    { "id": "123", "username": "john" },
    { "id": "124", "username": "jane" }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 100,
  "totalPages": 5
}
```

#### 错误响应

统一错误格式：

```json
{
  "code": "VALIDATION_ERROR",
  "message": "请求参数验证失败",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/users",
  "details": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    },
    {
      "field": "password",
      "message": "密码长度不能少于8位"
    }
  ]
}
```

#### HTTP 状态码

| 状态码 | 场景 | 说明 |
|--------|------|------|
| `200 OK` | 成功 | 通用成功 |
| `201 Created` | 创建成功 | 资源创建成功 |
| `204 No Content` | 成功无返回 | 删除成功 |
| `400 Bad Request` | 请求错误 | 参数校验失败 |
| `401 Unauthorized` | 未认证 | 需要登录 |
| `403 Forbidden` | 无权限 | 权限不足 |
| `404 Not Found` | 不存在 | 资源未找到 |
| `409 Conflict` | 冲突 | 资源已存在 |
| `422 Unprocessable` | 业务错误 | 业务规则验证失败 |
| `500 Internal Error` | 服务器错误 | 系统异常 |

### 多租户支持

所有 API 必须支持多租户：

- **Header 方式**: `X-Tenant-Id: tenant-001`
- **JWT Claim 方式**: 从 Token 中解析 `tenant_id`
- **后端处理**: 使用 `TenantContext.getCurrentTenantId()` 自动过滤

### 版本控制

API 版本通过 URL 路径管理：

```
/api/v1/users
/api/v2/users
```

## 后端实现规范

### GraphQL 端点

```java
@GraphQLApi
public class UserGraphQLResource {
    
    @Query
    public Uni<User> user(@Name("id") String id) {
        return User_.managedBlocking().findById(id);
    }
    
    @Query
    public Uni<List<User>> users() {
        return User_.managedBlocking()
            .find("tenantId", TenantContext.getCurrentTenantId())
            .list();
    }
}
```

### REST 端点

```java
@Path("/api/v1/users")
@ApplicationScoped
public class UserResource {
    
    @GET
    @Path("/{id}")
    public Uni<User> getUser(@PathParam("id") String id) {
        return userQuery.findById(id);
    }
    
    @POST
    @Transactional
    public Uni<Response> createUser(CreateUserRequest request) {
        return userService.create(request)
            .map(user -> Response.status(201).entity(user).build());
    }
    
    @PUT
    @Path("/{id}")
    @Transactional
    public Uni<User> updateUser(@PathParam("id") String id, UpdateUserRequest request) {
        return userService.update(id, request);
    }
    
    @DELETE
    @Path("/{id}")
    @Transactional
    public Uni<Response> deleteUser(@PathParam("id") String id) {
        return userService.delete(id)
            .map(v -> Response.noContent().build());
    }
}
```

### 统一异常处理

异常由 `GlobalExceptionHandler` 统一处理：

```java
@Provider
public class GlobalExceptionHandler implements ExceptionMapper<Exception> {
    
    @Override
    public Response toResponse(Exception exception) {
        if (exception instanceof NotFoundException) {
            return Response.status(404)
                .entity(new ErrorResponse("NOT_FOUND", exception.getMessage()))
                .build();
        }
        // ...
    }
}
```

## 安全规范

### 认证
- 使用 JWT Token
- Token 通过 `Authorization: Bearer <token>` Header 传递

### 授权
- 基于角色的访问控制 (RBAC)
- 注解方式: `@RolesAllowed({"ADMIN", "USER"})`
- 数据级别: 通过 `TenantContext` 确保租户隔离

### 敏感数据处理
- 密码必须加密存储（bcrypt）
- API 响应中不要返回敏感字段（如密码哈希）
- 使用 DTO 控制返回字段

## 参考文件

- `lib-common/src/main/java/pro/walkin/ams/common/web/GlobalExceptionHandler.java`: 错误处理
- `lib-common/src/main/java/pro/walkin/ams/common/security/TenantContext.java`: 租户上下文
- GraphQL Schema 文件位置: `feature-graphql/src/main/resources/`
