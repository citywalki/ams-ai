# 安全模式 (Security Pattern)

## 概述

AMS-AI 采用 JWT + RBAC（基于角色的访问控制）安全架构，支持多租户隔离和细粒度权限控制。

## 认证架构

### JWT 认证流程

```
1. 用户登录 → TokenService 生成 JWT
2. 客户端存储 JWT (Cookie/LocalStorage)
3. 请求携带 JWT (Authorization: Bearer <token>)
4. JwtAuthFilter 验证 JWT
5. 解析用户信息和租户ID
6. 设置 TenantContext 和 SecurityContext
7. 业务处理
```

### TokenService

```java
package pro.walkin.ams.common.security.service;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Duration;
import java.util.Set;

@ApplicationScoped
public class TokenService {
    
    @Inject
    @ConfigProperty(name = "jwt.issuer")
    String issuer;
    
    @Inject
    @ConfigProperty(name = "jwt.expiration", defaultValue = "86400")
    Long expirationSeconds;
    
    public String generateToken(Long userId, String username, Long tenantId, Set<String> roles) {
        return Jwt.issuer(issuer)
            .subject(userId.toString())
            .upn(username)
            .claim("tenant_id", tenantId)
            .groups(roles)
            .expiresIn(Duration.ofSeconds(expirationSeconds))
            .sign();
    }
    
    public String generateRefreshToken(Long userId) {
        return Jwt.issuer(issuer)
            .subject(userId.toString())
            .claim("type", "refresh")
            .expiresIn(Duration.ofDays(30))
            .sign();
    }
}
```

### AuthenticationService

```java
package pro.walkin.ams.admin.auth.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.common.exception.BusinessException;
import pro.walkin.ams.common.security.service.TokenService;
import pro.walkin.ams.persistence.entity.system.User;

@ApplicationScoped
public class AuthenticationService {
    
    @Inject
    User.Repo userRepo;
    
    @Inject
    PasswordService passwordService;
    
    @Inject
    TokenService tokenService;
    
    @Inject
    RbacService rbacService;
    
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // 1. 查找用户
        User user = userRepo.findByUsername(request.username())
            .orElseThrow(() -> new BusinessException("AUTH_001", "用户名或密码错误"));
        
        // 2. 验证密码
        if (!passwordService.verifyPassword(request.password(), user.passwordHash)) {
            throw new BusinessException("AUTH_001", "用户名或密码错误");
        }
        
        // 3. 检查用户状态
        if (!"ACTIVE".equals(user.status)) {
            throw new BusinessException("AUTH_002", "用户已被禁用");
        }
        
        // 4. 获取角色
        Set<String> roles = rbacService.getUserRoles(user.id);
        
        // 5. 生成 JWT
        String token = tokenService.generateToken(
            user.id, 
            user.username, 
            user.tenant,
            roles
        );
        
        // 6. 更新登录时间
        user.lastLoginAt = Instant.now();
        user.failedLoginAttempts = 0;
        user.persist();
        
        return new LoginResponse(token, user.id, user.username, user.tenant, roles);
    }
    
    @Transactional
    public void logout(Long userId) {
        // 可以将 token 加入黑名单（如果需要）
        // 或者客户端直接删除 token
    }
}
```

## 过滤器链

### JwtAuthFilter

```java
package pro.walkin.ams.common.filter;

import io.quarkus.security.UnauthorizedException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.resteasy.reactive.server.ServerRequestFilter;
import pro.walkin.ams.common.security.TenantContext;

import java.io.IOException;

@Provider
@ApplicationScoped
public class JwtAuthFilter implements ContainerRequestFilter {
    
    @Inject
    JsonWebToken jwt;
    
    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String path = requestContext.getUriInfo().getPath();
        
        // 跳过公开路径
        if (isPublicPath(path)) {
            return;
        }
        
        // 验证 JWT
        if (jwt == null || jwt.getClaim("tenant_id") == null) {
            throw new UnauthorizedException("未认证");
        }
        
        // 设置租户上下文
        Long tenantId = jwt.getClaim("tenant_id");
        TenantContext.setCurrentTenantId(tenantId);
        
        // 设置用户上下文
        Long userId = Long.parseLong(jwt.getSubject());
        SecurityContext.setCurrentUserId(userId);
    }
    
    private boolean isPublicPath(String path) {
        return path.startsWith("/auth/login") ||
               path.startsWith("/auth/register") ||
               path.startsWith("/health") ||
               path.startsWith("/metrics");
    }
}
```

### AuthorizationFilter

```java
package pro.walkin.ams.common.filter;

import jakarta.annotation.security.DenyAll;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ResourceInfo;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.ext.Provider;
import org.jboss.resteasy.reactive.server.ServerRequestFilter;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.admin.system.service.RbacService;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.Set;

@Provider
@ApplicationScoped
public class AuthorizationFilter implements ContainerRequestFilter {
    
    @Context
    ResourceInfo resourceInfo;
    
    @Inject
    RbacService rbacService;
    
    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        Method method = resourceInfo.getResourceMethod();
        Class<?> resourceClass = resourceInfo.getResourceClass();
        
        // @PermitAll - 允许所有已认证用户
        if (method.isAnnotationPresent(PermitAll.class) ||
            resourceClass.isAnnotationPresent(PermitAll.class)) {
            return;
        }
        
        // @DenyAll - 拒绝所有
        if (method.isAnnotationPresent(DenyAll.class)) {
            requestContext.abortWith(
                Response.status(Response.Status.FORBIDDEN)
                    .entity("访问被拒绝")
                    .build()
            );
            return;
        }
        
        // @RolesAllowed - 角色检查
        RolesAllowed rolesAllowed = method.getAnnotation(RolesAllowed.class);
        if (rolesAllowed == null) {
            rolesAllowed = resourceClass.getAnnotation(RolesAllowed.class);
        }
        
        if (rolesAllowed != null) {
            Long userId = SecurityContext.getCurrentUserId();
            Long tenantId = TenantContext.getCurrentTenantId();
            
            Set<String> userRoles = rbacService.getUserRoles(userId, tenantId);
            
            boolean hasRole = Arrays.stream(rolesAllowed.value())
                .anyMatch(userRoles::contains);
            
            if (!hasRole) {
                requestContext.abortWith(
                    Response.status(Response.Status.FORBIDDEN)
                        .entity("权限不足")
                        .build()
                );
            }
        }
    }
}
```

### TenantHibernateFilter

```java
package pro.walkin.ams.common.filter;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.ext.Provider;
import org.hibernate.Session;
import pro.walkin.ams.common.security.TenantContext;

import java.io.IOException;

@Provider
@ApplicationScoped
public class TenantHibernateFilter implements ContainerRequestFilter {
    
    @Inject
    EntityManager entityManager;
    
    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        Long tenantId = TenantContext.getCurrentTenantId();
        
        if (tenantId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter("tenant-filter")
                   .setParameter("tenant", tenantId);
        }
    }
}
```

## RBAC 权限控制

### RbacService

```java
package pro.walkin.ams.admin.system.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;

import java.util.Set;
import java.util.stream.Collectors;

@ApplicationScoped
public class RbacService {
    
    @Inject
    User.Repo userRepo;
    
    @Inject
    Role.Repo roleRepo;
    
    @Inject
    Permission.Repo permissionRepo;
    
    public Set<String> getUserRoles(Long userId, Long tenantId) {
        User user = userRepo.findById(userId);
        if (user == null || !tenantId.equals(user.tenant)) {
            return Set.of();
        }
        
        return user.roles.stream()
            .map(role -> role.code)
            .collect(Collectors.toSet());
    }
    
    public Set<String> getUserPermissions(Long userId) {
        User user = userRepo.findById(userId);
        if (user == null) {
            return Set.of();
        }
        
        return user.roles.stream()
            .flatMap(role -> role.permissions.stream())
            .map(permission -> permission.code)
            .collect(Collectors.toSet());
    }
    
    public boolean hasPermission(Long userId, String permissionCode) {
        return getUserPermissions(userId).contains(permissionCode);
    }
    
    public boolean hasAnyPermission(Long userId, String... permissionCodes) {
        Set<String> userPermissions = getUserPermissions(userId);
        return Arrays.stream(permissionCodes)
            .anyMatch(userPermissions::contains);
    }
    
    public boolean hasAllPermissions(Long userId, String... permissionCodes) {
        Set<String> userPermissions = getUserPermissions(userId);
        return Arrays.stream(permissionCodes)
            .allMatch(userPermissions::contains);
    }
}
```

### 自定义注解

```java
package pro.walkin.ams.common.security;

import jakarta.interceptor.InterceptorBinding;

import java.lang.annotation.*;

@InterceptorBinding
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    String[] value();
}
```

```java
package pro.walkin.ams.common.security;

import jakarta.inject.Inject;
import jakarta.interceptor.AroundInvoke;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;
import jakarta.ws.rs.ForbiddenException;
import pro.walkin.ams.admin.system.service.RbacService;

@Interceptor
@RequirePermission({})
@Priority(Interceptor.Priority.APPLICATION)
public class PermissionInterceptor {
    
    @Inject
    RbacService rbacService;
    
    @AroundInvoke
    public Object checkPermission(InvocationContext context) throws Exception {
        RequirePermission annotation = context.getMethod()
            .getAnnotation(RequirePermission.class);
        
        if (annotation == null) {
            annotation = context.getTarget().getClass()
                .getAnnotation(RequirePermission.class);
        }
        
        if (annotation != null) {
            Long userId = SecurityContext.getCurrentUserId();
            String[] requiredPermissions = annotation.value();
            
            if (!rbacService.hasAllPermissions(userId, requiredPermissions)) {
                throw new ForbiddenException("权限不足");
            }
        }
        
        return context.proceed();
    }
}
```

### 使用权限注解

```java
@ApplicationScoped
@Path("/api/users")
public class UserResource {
    
    @Inject
    UserService userService;
    
    @GET
    @RequirePermission("user:read")
    public List<UserResponse> listUsers() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return userService.listUsers(tenantId, 0, 20);
    }
    
    @POST
    @RequirePermission("user:create")
    public UserResponse createUser(UserRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return userService.createUser(request, tenantId);
    }
    
    @DELETE
    @Path("/{id}")
    @RequirePermission("user:delete")
    public void deleteUser(@PathParam("id") Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        userService.deleteUser(id, tenantId);
    }
}
```

## 密码安全

### PasswordService

```java
package pro.walkin.ams.admin.auth.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.mindrot.jbcrypt.BCrypt;

@ApplicationScoped
public class PasswordService {
    
    private static final int BCRYPT_ROUNDS = 12;
    
    public String hashPassword(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(BCRYPT_ROUNDS));
    }
    
    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        return BCrypt.checkpw(plainPassword, hashedPassword);
    }
}
```

## 安全配置

### SecurityConfig

```java
package pro.walkin.ams.common.config;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;

@ApplicationScoped
public class SecurityConfig {
    
    @Inject
    User.Repo userRepo;
    
    @Inject
    Role.Repo roleRepo;
    
    @Inject
    Permission.Repo permissionRepo;
    
    @Inject
    PasswordService passwordService;
    
    @Transactional
    void onStart(@Observes StartupEvent event) {
        initPermissions();
        initRoles();
        initAdminUser();
    }
    
    private void initPermissions() {
        if (permissionRepo.count() == 0) {
            createPermission("user:read", "查看用户");
            createPermission("user:create", "创建用户");
            createPermission("user:update", "更新用户");
            createPermission("user:delete", "删除用户");
            // 更多权限...
        }
    }
    
    private void initRoles() {
        if (roleRepo.count() == 0) {
            // 管理员角色
            Role adminRole = createRole("ADMIN", "管理员");
            adminRole.permissions.addAll(permissionRepo.listAll());
            adminRole.persist();
            
            // 普通用户角色
            Role userRole = createRole("USER", "普通用户");
            userRole.permissions.add(permissionRepo.findByCode("user:read"));
            userRole.persist();
        }
    }
    
    private void initAdminUser() {
        if (userRepo.count() == 0) {
            User admin = new User();
            admin.username = "admin";
            admin.email = "admin@example.com";
            admin.passwordHash = passwordService.hashPassword("admin123");
            admin.tenant = 1L;
            admin.status = "ACTIVE";
            admin.persist();
            
            // 分配管理员角色
            Role adminRole = roleRepo.findByCode("ADMIN");
            admin.roles.add(adminRole);
            admin.persist();
        }
    }
    
    private Permission createPermission(String code, String name) {
        Permission permission = new Permission();
        permission.code = code;
        permission.name = name;
        permission.tenant = 1L;
        permission.persist();
        return permission;
    }
    
    private Role createRole(String code, String name) {
        Role role = new Role();
        role.code = code;
        role.name = name;
        role.tenant = 1L;
        role.persist();
        return role;
    }
}
```

## 最佳实践

### ✅ 必须遵守

1. **所有 API 必须有权限控制**
2. **所有敏感数据必须加密**
3. **密码必须使用强哈希（BCrypt）**
4. **JWT 必须包含租户信息**
5. **所有操作必须验证租户隔离**
6. **日志中不能记录密码等敏感信息**
7. **使用 HTTPS**
8. **定期更新密钥**

### ❌ 禁止做法

1. **硬编码密码**
2. **明文存储密码**
3. **跳过权限检查**
4. **跨租户访问**
5. **在 URL 中传递敏感信息**
6. **使用弱哈希算法（MD5、SHA1）**
7. **日志记录敏感数据**
8. **JWT 永不过期**
