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

## REST 规范（命令 — 统一 Command 端点）

### 使用场景
- 所有写操作（创建、更新、删除）通过统一 Command 端点
- 文件上传/下载使用独立 REST 端点

### 统一 Command 端点

所有写操作发送到单一端点 `POST /api/commands`，通过 `type` 字段路由到对应的 Handler。

**不再**为每个资源创建独立的 REST Controller（如 `/api/v1/users`、`/api/v1/roles`）。

### 请求/响应规范

#### Command 请求格式

```json
POST /api/commands
Content-Type: application/json

{
  "type": "CreateUserCommand",
  "payload": {
    "username": "john",
    "email": "john@example.com",
    "password": "secret",
    "status": "ACTIVE",
    "tenantId": 1
  }
}
```

- **type**: Command 类名（简名或全限定名），如 `CreateUserCommand`
- **payload**: Command 的具体数据，将反序列化为对应的 Command record

#### 成功响应

```json
// Handler 返回结果时 → 200 OK
{
  "id": 123,
  "username": "john",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}

// Handler 返回 null 时 → 204 No Content
```

#### 错误响应

```json
// 缺少 type 或未知 Command → 400 Bad Request
{
  "success": false,
  "errorCode": null,
  "errorMessage": "Unknown command type: FooCommand"
}

// Handler 执行失败 → 500 Internal Server Error
{
  "success": false,
  "errorCode": "COMMAND_EXECUTION_FAILED",
  "errorMessage": "Role code already exists"
}
```

#### HTTP 状态码

| 状态码 | 场景 | 说明 |
|--------|------|------|
| `200 OK` | Command 执行成功 | Handler 返回了结果 |
| `204 No Content` | Command 执行成功 | Handler 返回 null（如删除操作） |
| `400 Bad Request` | 请求错误 | 缺少 type、未知 Command、payload 反序列化失败 |
| `401 Unauthorized` | 未认证 | 需要登录 |
| `403 Forbidden` | 无权限 | 权限不足 |
| `500 Internal Error` | 执行失败 | Handler 抛出异常 |

### 多租户支持

所有 API 必须支持多租户：

- **Header 方式**: `X-Tenant-Id: tenant-001`
- **JWT Claim 方式**: 从 Token 中解析 `tenant_id`
- **后端处理**: 使用 `TenantContext.getCurrentTenantId()` 自动过滤

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

### REST 端点（统一 Command 调度）

```java
@Path("/api/commands")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CommandController {

    @Inject MessageGateway messageGateway;
    @Inject HandlerRegistry handlerRegistry;
    @Inject ObjectMapper objectMapper;

    @POST
    public CompletionStage<Response> execute(@Valid CommandRequest request) {
        // 1. 解析 Command 类型（通过 HandlerRegistry 路由）
        Class<? extends Command> commandClass = handlerRegistry.getCommandClass(request.type());

        // 2. 反序列化 payload 为 Command 对象
        Command command = objectMapper.treeToValue(request.payload(), commandClass);

        // 3. 通过 Tower MessageGateway 发送到对应 Handler
        return messageGateway.sendAsync(command, Object.class)
            .thenApply(result -> result == null
                ? Response.noContent().build()
                : Response.ok(result).build());
    }
}
```

每个 Handler 独立定义，由 Tower 框架自动注册和路由：

```java
@ApplicationScoped
public class CreateUserHandler implements CommandHandler<CreateUserCommand, User> {

    @Inject User.Repo userRepo;
    @Inject UserQuery userQuery;

    @Override
    @Transactional
    public User handle(CreateUserCommand cmd) {
        if (userQuery.findByUsername(cmd.username()).isPresent()) {
            throw new BusinessException("Username already exists");
        }
        User user = new User();
        user.username = cmd.username();
        user.email = cmd.email();
        user.tenantId = cmd.tenantId();
        userRepo.persist(user);
        return user;
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
