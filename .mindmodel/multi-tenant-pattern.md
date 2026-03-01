# 多租户模式 (Multi-Tenant Pattern)

## 概述

AMS-AI 采用共享数据库、共享 Schema 的多租户架构。所有核心表包含 `tenant_id` 字段，通过 TenantContext 和 Hibernate Filter 实现数据隔离。

## 租户隔离架构

### 数据库层面

所有核心表必须包含 `tenant_id` 字段：

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,  -- 租户ID
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    -- 其他字段...
    CONSTRAINT uk_users_tenant_username UNIQUE (tenant_id, username)
);
```

### 实体层面

所有实体继承 `BaseEntity`，自动包含租户过滤：

```java
@MappedSuperclass
@FilterDef(
    name = "tenant-filter",
    parameters = @ParamDef(name = "tenant", type = Long.class),
    defaultCondition = "tenant_id = :tenant")
@Filter(name = "tenant-filter")
public abstract class BaseEntity extends PanacheEntityBase {
    
    @Id @SnowflakeIdGeneratorType 
    public Long id;
    
    @Column(name = "tenant_id", nullable = false)
    public Long tenant;
}
```

## TenantContext

### 实现模式

```java
package pro.walkin.ams.common.security;

import java.util.Optional;

public class TenantContext {
    
    private static final ThreadLocal<Long> CURRENT_TENANT = new ThreadLocal<>();
    
    public static void setCurrentTenantId(Long tenantId) {
        CURRENT_TENANT.set(tenantId);
    }
    
    public static Long getCurrentTenantId() {
        return CURRENT_TENANT.get();
    }
    
    public static Optional<Long> getCurrentTenantIdOptional() {
        return Optional.ofNullable(CURRENT_TENANT.get());
    }
    
    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
```

### 使用方式

```java
// 设置租户上下文
TenantContext.setCurrentTenantId(tenantId);

// 获取当前租户
Long tenantId = TenantContext.getCurrentTenantId();

// 清除上下文
TenantContext.clear();
```

## TenantHibernateFilter

### 自动租户过滤

```java
package pro.walkin.ams.common.filter;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import org.hibernate.Session;
import org.jboss.resteasy.reactive.server.ServerRequestFilter;
import org.jboss.resteasy.reactive.server.SimpleSpanInfo;
import io.quarkus.hibernate.orm.runtime.session.TenantFilterEnabled;
import io.vertx.core.http.HttpServerRequest;

@ApplicationScoped
public class TenantHibernateFilter {
    
    @Inject
    EntityManager entityManager;
    
    @ServerRequestFilter
    public SimpleSpanInfo filter(HttpServerRequest request) {
        // 从请求中获取租户ID（从 JWT 或 Header）
        Long tenantId = extractTenantId(request);
        
        if (tenantId != null) {
            // 设置 TenantContext
            TenantContext.setCurrentTenantId(tenantId);
            
            // 启用 Hibernate Filter
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter("tenant-filter")
                 .setParameter("tenant", tenantId);
        }
        
        return null;  // 继续请求处理
    }
    
    private Long extractTenantId(HttpServerRequest request) {
        // 从 JWT token 中提取
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            // 解析 JWT 获取 tenant_id
            return JwtUtil.extractTenantId(authorization.substring(7));
        }
        
        // 或从自定义 Header 中提取
        String tenantHeader = request.getHeader("X-Tenant-Id");
        if (tenantHeader != null) {
            return Long.parseLong(tenantHeader);
        }
        
        return null;
    }
}
```

## Service 层租户处理

### 明确租户参数（推荐）

```java
@ApplicationScoped
public class UserService {
    
    // ✅ 推荐：明确传递 tenantId
    public User createUser(UserDto dto, Long tenantId) {
        Objects.requireNonNull(tenantId, "租户ID不能为空");
        
        User user = new User();
        user.username = dto.username();
        user.tenant = tenantId;  // 设置租户
        user.persist();
        
        return user;
    }
    
    public User getUserById(Long id, Long tenantId) {
        User user = User_.managed().findById(id);
        
        // 租户隔离检查
        if (user != null && !tenantId.equals(user.tenant)) {
            throw new ValidationException("数据不属于当前租户", "id", id);
        }
        
        return user;
    }
    
    public List<User> listUsers(Long tenantId, int page, int size) {
        // 明确的租户过滤
        return User_.managed()
            .find("tenant", tenantId)
            .page(page, size)
            .list();
    }
}
```

### 使用 TenantContext（便捷）

```java
@ApplicationScoped
public class AlarmService {
    
    public Alarm createAlarm(AlarmDto dto) {
        // 从 TenantContext 获取租户ID
        Long tenantId = TenantContext.getCurrentTenantId();
        Objects.requireNonNull(tenantId, "租户上下文未设置");
        
        Alarm alarm = new Alarm();
        alarm.title = dto.title();
        alarm.tenant = tenantId;
        alarm.persist();
        
        return alarm;
    }
    
    public List<Alarm> listAlarms(int page, int size) {
        Long tenantId = TenantContext.getCurrentTenantId();
        
        // Hibernate Filter 会自动过滤，但明确指定更安全
        return Alarm_.managed()
            .find("tenant", tenantId)
            .page(page, size)
            .list();
    }
}
```

## Repository 层租户过滤

### 自动过滤（Hibernate Filter）

```java
// 如果 Hibernate Filter 已启用，查询自动添加租户过滤
List<User> users = User_.managed().listAll();
// 实际执行: SELECT * FROM users WHERE tenant_id = :tenant
```

### 手动过滤（更明确）

```java
public interface Repo extends PanacheRepository<User> {
    
    // 明确的租户参数
    default List<User> listByTenant(Long tenantId, int page, int size) {
        return find("tenant", tenantId)
            .page(page, size)
            .list();
    }
    
    // 租户 + 其他条件
    default Optional<User> findByUsernameAndTenant(String username, Long tenantId) {
        return find("username = ?1 and tenant = ?2", username, tenantId)
            .firstResultOptional();
    }
    
    // 复杂查询
    default List<User> searchByTenant(
        Long tenantId,
        String username,
        String email,
        String status,
        int page,
        int size
    ) {
        StringBuilder query = new StringBuilder("tenant = :tenantId");
        Map<String, Object> params = new HashMap<>();
        params.put("tenantId", tenantId);
        
        if (username != null && !username.isBlank()) {
            query.append(" and lower(username) like lower(:username)");
            params.put("username", "%" + username + "%");
        }
        
        // 其他条件...
        
        return find(query.toString(), params)
            .page(page, size)
            .list();
    }
}
```

## 唯一性约束

### 租户内唯一

```java
// 数据库约束
CONSTRAINT uk_users_tenant_username UNIQUE (tenant_id, username)

// 应用层验证
public User createUser(UserDto dto, Long tenantId) {
    // 检查租户内唯一性
    if (User_.managed().count("username = ?1 and tenant = ?2", 
                              dto.username(), tenantId) > 0) {
        throw new ValidationException("用户名已存在", "username", dto.username());
    }
    
    User user = new User();
    user.username = dto.username();
    user.tenant = tenantId;
    user.persist();
    
    return user;
}
```

### 全局唯一

```java
// 某些字段需要全局唯一（跨租户）
@Column(name = "email", unique = true)  // 全局唯一
public String email;

// 应用层验证
public User createUser(UserDto dto, Long tenantId) {
    // 全局唯一性检查
    if (User_.managed().count("email", dto.email()) > 0) {
        throw new ValidationException("邮箱已被注册", "email", dto.email());
    }
    
    // 租户内唯一性检查
    if (User_.managed().count("username = ?1 and tenant = ?2", 
                              dto.username(), tenantId) > 0) {
        throw new ValidationException("用户名已存在", "username", dto.username());
    }
    
    // 创建用户...
}
```

## 跨租户操作（禁止）

### ❌ 禁止跨租户查询

```java
// ❌ 错误：跨租户查询
public List<User> getAllUsers() {
    return User_.managed().listAll();  // 可能返回所有租户的用户
}

// ✅ 正确：限制在当前租户
public List<User> getCurrentTenantUsers() {
    Long tenantId = TenantContext.getCurrentTenantId();
    return User_.managed().find("tenant", tenantId).list();
}
```

### ❌ 禁止跨租户修改

```java
// ❌ 错误：修改其他租户数据
public void updateAnyUser(Long userId, UserDto dto) {
    User user = User_.managed().findById(userId);
    user.username = dto.username();  // 可能修改其他租户的用户
}

// ✅ 正确：检查租户
public void updateUser(Long userId, UserDto dto, Long tenantId) {
    User user = User_.managed().findById(userId);
    
    if (!tenantId.equals(user.tenant)) {
        throw new ValidationException("无权修改其他租户数据");
    }
    
    user.username = dto.username();
}
```

## Liquibase 迁移

### 表结构定义

```yaml
databaseChangeLog:
  - changeSet:
      id: 001-create-users-table
      author: system
      changes:
        - createTable:
            tableName: users
            columns:
              - column:
                  name: id
                  type: BIGINT
                  constraints:
                    primaryKey: true
              - column:
                  name: tenant_id
                  type: BIGINT
                  constraints:
                    nullable: false
              - column:
                  name: username
                  type: VARCHAR(100)
                  constraints:
                    nullable: false
        - addUniqueConstraint:
            tableName: users
            columnNames: tenant_id, username
            constraintName: uk_users_tenant_username
```

### 初始租户数据

```yaml
databaseChangeLog:
  - changeSet:
      id: 002-insert-default-tenant
      author: system
      changes:
        - insert:
            tableName: tenants
            columns:
              - column:
                  name: id
                  value: 1
              - column:
                  name: name
                  value: "Default Tenant"
              - column:
                  name: code
                  value: "DEFAULT"
```

## 测试租户隔离

```java
@QuarkusTest
class UserServiceTest {
    
    @Inject
    UserService userService;
    
    @Test
    void shouldNotAccessOtherTenantData() {
        // 创建租户1的用户
        TenantContext.setCurrentTenantId(1L);
        User user1 = userService.createUser(new UserDto("user1", "user1@example.com"), 1L);
        
        // 创建租户2的用户
        TenantContext.setCurrentTenantId(2L);
        User user2 = userService.createUser(new UserDto("user2", "user2@example.com"), 2L);
        
        // 验证租户隔离
        TenantContext.setCurrentTenantId(1L);
        List<User> tenant1Users = userService.listUsers(1L, 0, 10);
        assertThat(tenant1Users).hasSize(1);
        assertThat(tenant1Users.get(0).username).isEqualTo("user1");
        
        TenantContext.setCurrentTenantId(2L);
        List<User> tenant2Users = userService.listUsers(2L, 0, 10);
        assertThat(tenant2Users).hasSize(1);
        assertThat(tenant2Users.get(0).username).isEqualTo("user2");
    }
    
    @Test
    void shouldRejectCrossTenantAccess() {
        // 创建租户1的用户
        User user = userService.createUser(new UserDto("user1", "user1@example.com"), 1L);
        
        // 尝试用租户2访问
        assertThatThrownBy(() -> {
            userService.getUserById(user.id, 2L);
        }).isInstanceOf(ValidationException.class)
          .hasMessageContaining("数据不属于当前租户");
    }
}
```

## 最佳实践

### ✅ 必须遵守

1. **所有核心表包含 tenant_id**
2. **所有实体继承 BaseEntity**
3. **所有 Service 方法明确租户参数**
4. **所有查询添加租户过滤**
5. **所有唯一性约束考虑租户范围**
6. **所有测试验证租户隔离**

### ❌ 禁止做法

1. **跨租户查询**
2. **跨租户修改**
3. **忘记设置 tenant_id**
4. **绕过 Hibernate Filter**
5. **全局唯一性约束不加租户考虑**
6. **测试不验证租户隔离**
