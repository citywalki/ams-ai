# 认证和授权系统使用指南

本文档介绍如何在AMS-AI项目中使用完整的认证和RBAC（基于角色的访问控制）系统。

## 1. 系统架构概览

认证和授权系统包含以下主要组件：

- **JWT令牌提供者**：负责生成和验证JWT令牌
- **密码服务**：负责密码哈希和验证
- **认证服务**：处理登录、注册、刷新令牌等操作
- **RBAC服务**：处理权限检查和角色分配
- **认证过滤器**：验证JWT令牌的有效性
- **授权过滤器**：检查用户权限
- **安全注解**：声明式权限控制

## 2. 实体模型

### 用户实体 (User)
- 用户基本信息（用户名、邮箱）
- 密码哈希
- 用户状态
- 角色集合（多对多关系）
- 直接权限集合（多对多关系）
- 租户信息
- 安全相关字段（上次登录、密码更新时间、失败尝试次数等）

### 角色实体 (Role)
- 角色代码和名称
- 描述
- 租户信息
- 权限集合（多对多关系）

### 权限实体 (Permission)
- 权限代码和名称
- 描述
- 租户信息

## 3. 安全注解使用

### @PermitAll
标记允许所有用户访问的方法或类。

```java
@Path("/public-data")
@PermitAll
public String getPublicData() {
    return "This is public data";
}
```

### @RequirePermission
要求用户拥有特定权限。

```java
@Path("/alarms")
@RequirePermission("ALARM_READ")
public String getAlarms() {
    return "Alarm data";
}
```

### @RequirePermissions
要求用户拥有多个权限（可选择AND/OR逻辑）。

```java
@Path("/alarms")
@RequirePermissions(value = {"ALARM_READ", "ALARM_WRITE"}, 
                   operator = RequirePermissions.LogicalOperator.ALL)
public String updateAlarm() {
    return "Updated alarm";
}
```

```java
@Path("/alarms")
@RequirePermissions(value = {"ALARM_WRITE", "ALARM_DELETE"}, 
                   operator = RequirePermissions.LogicalOperator.ANY)
public String modifyAlarm() {
    return "Modified alarm";
}
```

## 4. 服务注入和使用

### 注入认证服务

```java
@Inject
AuthenticationService authService;
```

### 用户登录示例

```java
@Path("/auth/login")
@POST
public Response login(LoginRequest request) {
    var result = authService.login(request.username, request.password);
    
    if (result.isPresent()) {
        var authResult = result.get();
        return Response.ok(new LoginResponse(
            authResult.user.id,
            authResult.user.username,
            authResult.accessToken,
            authResult.refreshToken
        )).build();
    } else {
        return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse("Invalid credentials"))
                .build();
    }
}
```

### 使用RBAC服务检查权限

```java
@Inject
RbacService rbacService;

// 检查用户权限
if (rbacService.hasPermission(jwtToken, "ALARM_WRITE")) {
    // 允许执行操作
}

// 批量检查权限
if (rbacService.hasAllPermissions(jwtToken, "ALARM_READ", "ALARM_WRITE")) {
    // 需要同时拥有两个权限
}

if (rbacService.hasAnyPermission(jwtToken, "ALARM_WRITE", "ALARM_DELETE")) {
    // 拥有任一权限即可
}
```

## 5. JWT令牌配置

JWT令牌具有以下特性：

- 访问令牌：15分钟有效期
- 刷新令牌：7天有效期
- 包含用户ID、用户名、租户ID、角色和权限信息
- 使用RS256算法签名

## 6. 多租户集成

系统完全集成了多租户架构：

- 每个用户属于一个租户
- 角色和权限也与特定租户关联
- JWT令牌包含租户ID信息
- 访问控制在租户级别实施

## 7. 安全最佳实践

### 密码安全
- 使用PBKDF2算法进行密码哈希
- 迭代次数为100,000次
- 包含盐值防止彩虹表攻击
- 密码强度验证（至少8位，包含大小写字母、数字和特殊字符）

### 账户安全
- 登录失败次数限制（5次失败后锁定30分钟）
- 账户状态管理（激活、禁用、锁定）
- 密码定期更新提醒

### 令牌安全
- JWT令牌过期检查
- 令牌撤销机制（通过刷新令牌控制）
- 安全的传输（HTTPS）

## 8. 初始化数据

系统在启动时会自动初始化以下默认数据：

- 默认租户
- 系统内置权限
- 基础角色（ADMIN、MANAGER、USER）
- 默认管理员账户（用户名：admin，密码：Admin123!）

## 9. 配置选项

在 `application.yml` 中配置相关参数：

```yaml
ams:
  auth:
    init-default-data: true  # 是否初始化默认安全数据
    jwt:
      access-token-expiration: 15M    # 访问令牌过期时间
      refresh-token-expiration: 7D    # 刷新令牌过期时间
      secret: "your-secret-key"       # JWT签名密钥
      issuer: "ams-ai-auth-service"   # JWT发行者
      algorithm: "RS256"              # 签名算法
```

## 10. 异常处理

系统定义了专门的认证异常类：

- `AuthException`: 认证相关的异常

## 11. 安全过滤器

系统自动应用以下安全过滤器：

1. **认证过滤器**：验证JWT令牌
2. **授权过滤器**：检查权限注解

这些过滤器确保只有经过认证且具有适当权限的用户才能访问受保护的资源。