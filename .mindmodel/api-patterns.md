# API 设计模式 (API Patterns)

## RESTful API 设计

### URL 命名规范

```
# ✅ 正确
GET    /api/users                    # 获取用户列表
GET    /api/users/{id}               # 获取单个用户
POST   /api/users                    # 创建用户
PUT    /api/users/{id}               # 更新用户
DELETE /api/users/{id}               # 删除用户

# 多租户 API
GET    /api/tenants/{tenantId}/users
POST   /api/tenants/{tenantId}/users

# 子资源
GET    /api/users/{id}/roles         # 获取用户的角色
POST   /api/users/{id}/roles         # 为用户分配角色

# ❌ 错误
GET    /api/getUsers
POST   /api/createUser
GET    /api/user-management
```

### REST 资源设计

```java
@Path("/api/tenants/{tenantId}/users")
@ApplicationScoped
public class UserResource {
    
    @Inject
    UserService userService;
    
    // ========== 列表查询 ==========
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response listUsers(
        @PathParam("tenantId") Long tenantId,
        @QueryParam("page") @DefaultValue("0") int page,
        @QueryParam("size") @DefaultValue("20") int size,
        @QueryParam("search") String search,
        @QueryParam("status") String status
    ) {
        PageResponse<UserResponse> response = userService.listUsers(
            tenantId, page, size, search, status
        );
        return Response.ok(response).build();
    }
    
    // ========== 单个查询 ==========
    
    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUser(
        @PathParam("tenantId") Long tenantId,
        @PathParam("id") Long id
    ) {
        UserResponse user = userService.getUserById(id, tenantId);
        return Response.ok(user).build();
    }
    
    // ========== 创建 ==========
    
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createUser(
        @PathParam("tenantId") Long tenantId,
        @Valid UserRequest request
    ) {
        UserResponse user = userService.createUser(request, tenantId);
        return Response.status(201)
            .entity(user)
            .build();
    }
    
    // ========== 更新 ==========
    
    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateUser(
        @PathParam("tenantId") Long tenantId,
        @PathParam("id") Long id,
        @Valid UserRequest request
    ) {
        UserResponse user = userService.updateUser(id, request, tenantId);
        return Response.ok(user).build();
    }
    
    // ========== 删除 ==========
    
    @DELETE
    @Path("/{id}")
    public Response deleteUser(
        @PathParam("tenantId") Long tenantId,
        @PathParam("id") Long id
    ) {
        userService.deleteUser(id, tenantId);
        return Response.noContent().build();
    }
}
```

## 请求/响应设计

### 分页请求

```java
// Query Params
public record PageRequest(
    @QueryParam("page") @DefaultValue("0") int page,
    @QueryParam("size") @DefaultValue("20") int size,
    @QueryParam("sortBy") @DefaultValue("createdAt") String sortBy,
    @QueryParam("sortOrder") @DefaultValue("desc") String sortOrder
) {}
```

### 分页响应

```java
public record PageResponse<T>(
    List<T> data,
    long total,
    int page,
    int size,
    int totalPages
) {
    public static <T> PageResponse<T> of(List<T> data, long total, int page, int size) {
        int totalPages = (int) Math.ceil((double) total / size);
        return new PageResponse<>(data, total, page, size, totalPages);
    }
}
```

### 创建请求

```java
public record UserRequest(
    @NotNull(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在3-50之间")
    String username,
    
    @Email(message = "邮箱格式不正确")
    String email,
    
    @Size(min = 8, message = "密码至少8个字符")
    String password,
    
    @NotEmpty(message = "至少选择一个角色")
    List<Long> roleIds
) {}
```

### 响应 DTO

```java
public record UserResponse(
    Long id,
    String username,
    String email,
    String status,
    Long tenant,
    List<RoleResponse> roles,
    Instant createdAt,
    Instant updatedAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
            user.id,
            user.username,
            user.email,
            user.status,
            user.tenant,
            user.roles.stream()
                .map(RoleResponse::from)
                .toList(),
            user.createdAt,
            user.updatedAt
        );
    }
}
```

## 验证

### Jakarta Validation

```java
public record AlarmRequest(
    @NotBlank(message = "告警标题不能为空")
    @Size(max = 200, message = "标题最多200个字符")
    String title,
    
    @Size(max = 2000, message = "描述最多2000个字符")
    String description,
    
    @NotNull(message = "严重程度不能为空")
    Severity severity,
    
    @NotBlank(message = "告警来源不能为空")
    String source,
    
    @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "来源ID格式不正确")
    String sourceId
) {}
```

### 资源中使用验证

```java
@POST
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public Response createAlarm(
    @PathParam("tenantId") Long tenantId,
    @Valid @NotNull AlarmRequest request  // 自动验证
) {
    AlarmResponse alarm = alarmService.createAlarm(request, tenantId);
    return Response.status(201).entity(alarm).build();
}

// 验证失败自动返回 400
```

## HTTP 状态码

### 成功响应

```java
// 200 OK - 查询/更新成功
return Response.ok(user).build();

// 201 Created - 创建成功
return Response.status(201).entity(user).build();

// 204 No Content - 删除成功
return Response.noContent().build();
```

### 错误响应

```java
// 400 Bad Request - 参数验证失败
throw new ValidationException("用户名不能为空");

// 401 Unauthorized - 未认证
throw new UnauthorizedException("未登录");

// 403 Forbidden - 无权限
throw new ForbiddenException("权限不足");

// 404 Not Found - 资源不存在
throw new NotFoundException("User", userId.toString());

// 409 Conflict - 资源冲突
throw new ValidationException("用户名已存在");

// 422 Unprocessable Entity - 业务规则失败
throw new BusinessException("ALARM_001", "告警无法处理");

// 500 Internal Server Error - 服务器错误
throw new BaseException("服务器内部错误");
```

## 批量操作

### 批量创建

```java
@POST
@Path("/batch")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public Response batchCreateUsers(
    @PathParam("tenantId") Long tenantId,
    @Valid @Size(min = 1, max = 100) List<UserRequest> requests
) {
    List<UserResponse> users = userService.batchCreate(requests, tenantId);
    return Response.status(201).entity(users).build();
}
```

### 批量删除

```java
@DELETE
@Path("/batch")
public Response batchDeleteUsers(
    @PathParam("tenantId") Long tenantId,
    @NotEmpty List<Long> ids
) {
    userService.batchDelete(ids, tenantId);
    return Response.noContent().build();
}
```

## 搜索和过滤

### 搜索 API

```java
@GET
@Path("/search")
@Produces(MediaType.APPLICATION_JSON)
public Response searchUsers(
    @PathParam("tenantId") Long tenantId,
    @QueryParam("q") String query,
    @QueryParam("status") String status,
    @QueryParam("role") String role,
    @QueryParam("page") @DefaultValue("0") int page,
    @QueryParam("size") @DefaultValue("20") int size
) {
    UserSearchCriteria criteria = new UserSearchCriteria(
        query, status, role, page, size
    );
    
    PageResponse<UserResponse> response = userService.search(tenantId, criteria);
    return Response.ok(response).build();
}
```

## 异步操作

### 异步任务

```java
@POST
@Path("/import")
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)
public Response importUsers(
    @PathParam("tenantId") Long tenantId,
    @MultipartForm FileUpload file
) {
    // 启动异步任务
    String taskId = userService.startImport(file, tenantId);
    
    // 返回任务ID
    return Response.accepted()
        .entity(Map.of("taskId", taskId))
        .build();
}

@GET
@Path("/tasks/{taskId}")
@Produces(MediaType.APPLICATION_JSON)
public Response getTaskStatus(
    @PathParam("taskId") String taskId
) {
    TaskStatus status = userService.getTaskStatus(taskId);
    return Response.ok(status).build();
}
```

## API 版本控制

### URL 版本（推荐）

```java
@Path("/api/v1/users")
public class UserResourceV1 { }

@Path("/api/v2/users")
public class UserResourceV2 { }
```

### Header 版本

```java
@GET
@Produces(MediaType.APPLICATION_JSON)
public Response getUsers(
    @HeaderParam("X-API-Version") @DefaultValue("1") String version
) {
    if ("2".equals(version)) {
        // v2 逻辑
    } else {
        // v1 逻辑
    }
}
```

## OpenAPI 文档

```java
@Tag(name = "User", description = "用户管理")
@Path("/api/users")
@ApplicationScoped
public class UserResource {
    
    @Operation(
        summary = "获取用户列表",
        description = "分页查询用户列表，支持搜索和过滤"
    )
    @APIResponse(
        responseCode = "200",
        description = "查询成功",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON,
            schema = @Schema(implementation = PageResponse.class)
        )
    )
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response listUsers(...) { }
}
```

## 最佳实践

### ✅ 必须遵守

1. **使用 RESTful 风格**
2. **明确 HTTP 方法语义**
3. **使用标准状态码**
4. **参数验证**
5. **统一响应格式**
6. **多租户隔离**
7. **API 文档**
8. **错误处理一致**

### ❌ 禁止做法

1. **URL 包含动词**
2. **使用非标准状态码**
3. **缺少参数验证**
4. **响应格式不统一**
5. **绕过租户隔离**
6. **缺少错误处理**
7. **缺少文档**
