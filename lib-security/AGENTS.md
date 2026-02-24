# lib-security 安全认证与权限控制

**Generated:** 2026-02-24 11:36
**Commit:** (当前Git提交)

## OVERVIEW

lib-security 提供 JWT 认证、租户上下文管理、RBAC 权限控制和安全配置功能，是 AMS-AI 安全架构的核心模块。

## WHERE TO LOOK

- `controller/` - 认证控制器：登录、刷新、登出端点
- `service/` - 安全服务：认证、Token、权限检查
- `config/` - 安全配置：JWT 配置、默认数据初始化
- `util/` - 安全工具：用户ID提取、权限检查

## STRUCTURE

```
lib-security/
├── src/main/java/pro/walkin/ams/security/
│   ├── controller/
│   │   └── AuthController.java         # 认证API端点
│   ├── service/
│   │   ├── AuthenticationService.java  # 登录认证
│   │   ├── TokenService.java           # JWT令牌管理
│   │   ├── PasswordService.java        # 密码验证
│   │   ├── RbacService.java            # 权限检查服务
│   │   └── MenuService.java            # 菜单管理
│   ├── config/
│   │   ├── SecurityConfig.java         # 安全配置初始化
│   │   └── JwtConfig.java             # JWT配置类
│   ├── util/
│   │   └── SecurityUtils.java          # 安全工具类
│   └── common/
│       └── Constants.java              # 安全相关常量
└── src/main/resources/
    └── application-security.yml        # 安全配置文件
```

## CONVENTIONS

- **JWT令牌**: 使用 RS256 算法，包含用户ID、租户ID、角色信息
- **租户上下文**: 通过 `TenantContext.getCurrentTenantId()` 获取当前租户
- **权限检查**: 基于 `RbacService.getUserPermissions()` 进行权限验证
- **默认用户**: 启动时自动创建 admin 用户（username="admin", password="Admin123!"）

## 核心组件

### JWT 认证流程

```java
// TokenService - 生成访问令牌
public String generateAccessToken(User user, Set<String> roles) {
    return tokenBuilder.subject(user.getId().toString())
        .claim("tenantId", user.getTenantId())
        .claim("roles", roles)
        .expiresIn(Duration.ofMinutes(30))
        .sign();
}

// TokenService - 验证令牌
public Claims verifyToken(String token) {
    return jwtVerifier.verify(token);
}
```

### RBAC 权限检查

```java
// RbacService - 获取用户权限
public Set<String> getUserPermissions(Long userId, Long tenantId) {
    String cacheKey = userId + ":" + tenantId;
    return cache.get(cacheKey, () -> {
        // 检查是否为 ADMIN 角色
        boolean isAdmin = checkAdminRole(userId, tenantId);
        if (isAdmin) {
            // ADMIN 用户拥有所有权限
            return permissionRepo.listAllByTenant(tenantId)
                .stream()
                .map(Permission::getCode)
                .collect(Collectors.toSet());
        }
        
        // 普通用户获取分配的权限
        return rolePermissionRepo.listOfUser(userId)
            .stream()
            .filter(rp -> tenantId.equals(rp.getRole().getTenant()))
            .map(rp -> rp.getPermission().getCode())
            .collect(Collectors.toSet());
    });
}
```

### 租户上下文管理

```java
// TenantContext - 租户上下文
public class TenantContext {
    private static final ThreadLocal<Long> tenantId = new ThreadLocal<>();
    
    public static void setCurrentTenantId(Long tenantId) {
        TenantContext.tenantId.set(tenantId);
    }
    
    public static Long getCurrentTenantId() {
        return tenantId.get();
    }
    
    public static void clear() {
        tenantId.remove();
    }
}
```

## API 端点

### 认证相关

```bash
POST   /auth/login           # 用户登录
POST   /auth/refresh        # 刷新访问令牌
POST   /auth/logout         # 用户登出
GET    /auth/me            # 获取当前用户信息
```

### 权限相关

```bash
GET    /system/permissions/user     # 获取用户权限
GET    /system/permissions/available # 可用权限列表
```

## 安全配置

### 默认数据初始化

SecurityConfig 在应用启动时创建：

1. **默认租户**: 系统租户 (tenant_id=1)
2. **基础权限**: 用户管理、角色管理、权限管理、菜单管理
3. **默认角色**: ADMIN、MANAGER、USER
4. **默认菜单**: 6个系统管理菜单
5. **默认用户**: admin 用户，分配 ADMIN 角色

### 权限体系

```java
// 前端权限码（在 Constants.Auth 中定义）
public static final String PERMISSION_VIEW_DASHBOARD = "view:dashboard";
public static final String PERMISSION_VIEW_ALERTS = "view:alerts";
public static final String PERMISSION_VIEW_SETTINGS = "view:settings";
public static final String PERMISSION_ADMIN_MENUS = "admin:menus";
public static final String PERMISSION_ADMIN_ROLES = "admin:roles";
public static final String PERMISSION_ADMIN_PERMISSIONS = "admin:permissions";

// 后端业务权限
public static final String PERMISSION_ALARM_READ = "alarm:read";
public static final String PERMISSION_ALARM_WRITE = "alarm:write";
public static final String PERMISSION_ALARM_DELETE = "alarm:delete";
```

## ADMIN 角色特权

ADMIN 角色用户自动获得系统所有权限：

```java
// RbacService 中的特殊处理
if(isAdmin){
        LOG.

info("User {} is ADMIN, granting all permissions",userId);

List<Permission> allPermissions = permissionRepo.listAllByTenant(tenantId);
    return allPermissions.

stream()
        .

map(Permission::getCode)
        .

collect(Collectors.toSet());
        }
```

## 使用示例

### 权限检查

```java
// 在控制器中检查权限
@GET
@Path("/users")
@RolesAllowed({"ADMIN", "MANAGER"})
public Response getAllUsers() {
    // 只有 ADMIN 或 MANAGER 角色可以访问
    return Response.ok(userService.findAll()).build();
}

// 自定义权限检查
@GET
@Path("/alerts")
public Response getAlerts() {
    Set<String> userPermissions = rbacService.getUserPermissions(
        SecurityUtils.getCurrentUserId(),
        TenantContext.getCurrentTenantId()
    );
    
    if (!userPermissions.contains("alarm:read")) {
        throw new ForbiddenException("没有告警查看权限");
    }
    
    return Response.ok(alertService.findAll()).build();
}
```

### JWT 令牌使用

```java
// 在前端存储和使用令牌
const token = localStorage.getItem('accessToken');
const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};

// 在 API 调用中使用令牌
const response = await fetch('/api/system/users', {
    method: 'GET',
    headers: headers
});
```

## 安全最佳实践

1. **令牌管理**: 访问令牌 30 分钟过期，刷新令牌 7 天过期
2. **密码安全**: 使用 BCrypt 加密，默认密码强度要求
3. **租户隔离**: 所有数据查询都包含租户过滤
4. **权限缓存**: 用户权限信息缓存 1 小时
5. **日志审计**: 记录所有认证和权限相关操作

## 测试规范

- **认证测试**: 验证登录、刷新、登出流程
- **权限测试**: 测试不同角色的权限访问控制
- **JWT测试**: 验证令牌生成、验证、过期处理
- **租户测试**: 确保多租户数据隔离正确性