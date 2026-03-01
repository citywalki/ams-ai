# Service 模式

## 概述

Service 层负责业务逻辑处理，协调 Repository、外部服务和业务规则。使用 Quarkus CDI 进行依赖注入。

## Service 类结构

### 基本结构

```java
package pro.walkin.ams.admin.system.service;

import io.quarkus.cache.CacheInvalidate;
import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.Menu;

import java.util.Objects;

@ApplicationScoped
@Transactional
public class MenuService {
  
  private static final Logger LOG = LoggerFactory.getLogger(MenuService.class);
  
  @Inject
  Menu.Repo menuRepo;
  
  @Inject
  RbacService rbacService;
  
  // 业务方法...
}
```

## 注解使用

### @ApplicationScoped

```java
// ✅ 正确：单例作用域
@ApplicationScoped
public class UserService {
}

// ❌ 错误：不要使用 @Singleton
@Singleton  // Quarkus 推荐使用 @ApplicationScoped
public class UserService {
}
```

### @Transactional

```java
@ApplicationScoped
@Transactional  // 类级别：所有 public 方法默认事务性
public class UserService {
  
  // 读操作
  public User getUserById(Long id) {
    return User_.managed().findById(id);
  }
  
  // 写操作
  public User createUser(UserDto dto) {
    User user = new User();
    user.persist();
    return user;
  }
  
  // 只读操作可以优化
  @Transactional(Transactional.TxType.READ)
  public List<User> listUsers() {
    return User_.managed().listAll();
  }
}
```

### @Inject

```java
@ApplicationScoped
public class MenuService {
  
  // 字段注入（推荐）
  @Inject
  Menu.Repo menuRepo;
  
  @Inject
  RbacService rbacService;
  
  // 缓存注入
  @Inject
  @CacheName("user-menus")
  Cache cache;
}
```

## 依赖注入

### 字段注入（推荐）

```java
@ApplicationScoped
public class UserService {
  
  @Inject
  User.Repo userRepo;
  
  @Inject
  TokenService tokenService;
  
  @Inject
  RbacService rbacService;
}
```

### 构造器注入（测试友好）

```java
@ApplicationScoped
public class UserService {
  
  private final User.Repo userRepo;
  private final TokenService tokenService;
  
  @Inject
  public UserService(User.Repo userRepo, TokenService tokenService) {
    this.userRepo = userRepo;
    this.tokenService = tokenService;
  }
}
```

## CRUD 操作模式

### Create（创建）

```java
public MenuResponseDto createMenu(MenuDto dto, Long tenantId) {
  // 1. 参数验证
  Objects.requireNonNull(dto, "菜单数据不能为空");
  Objects.requireNonNull(tenantId, "租户ID不能为空");
  
  // 2. 业务规则验证
  if (menuRepo.countByKey(dto.key()) > 0) {
    throw new ValidationException("菜单标识符已存在", "key", dto.key());
  }
  
  // 3. 父菜单验证
  if (dto.parentId() != null) {
    Menu parent = menuRepo.findById(dto.parentId());
    if (parent == null) {
      throw new NotFoundException("Menu", dto.parentId().toString());
    }
    if (!tenantId.equals(parent.tenant)) {
      throw new ValidationException("父菜单不属于当前租户", "parentId", dto.parentId());
    }
  }
  
  // 4. 创建实体
  Menu menu = new Menu();
  mapDtoToEntity(dto, menu);
  menu.tenant = tenantId;
  menu.persist();
  
  // 5. 记录日志
  LOG.debug("创建菜单成功: id={}, key={}, tenant={}", menu.id, menu.key, tenantId);
  
  // 6. 返回 DTO
  return mapEntityToResponseDto(menu);
}
```

### Read（读取）

```java
// 单个查询
public MenuResponseDto getMenuById(Long id, Long tenantId) {
  Objects.requireNonNull(id, "菜单ID不能为空");
  Objects.requireNonNull(tenantId, "租户ID不能为空");
  
  Menu menu = menuRepo.findById(id);
  if (menu == null) {
    throw new NotFoundException("Menu", id.toString());
  }
  
  // 租户隔离检查
  if (!tenantId.equals(menu.tenant)) {
    throw new ValidationException("菜单不属于当前租户", "id", id);
  }
  
  return mapEntityToResponseDto(menu);
}

// 列表查询
public PageResponse<MenuResponseDto> listMenus(Long tenantId, int page, int size) {
  List<Menu> menus = menuRepo.listByTenantOrderBySort(tenantId);
  long total = menuRepo.count("tenant", tenantId);
  
  List<MenuResponseDto> dtos = menus.stream()
      .map(this::mapEntityToResponseDto)
      .collect(Collectors.toList());
  
  return new PageResponse<>(dtos, total, page, size);
}
```

### Update（更新）

```java
public MenuResponseDto updateMenu(Long id, MenuDto dto, Long tenantId) {
  // 1. 参数验证
  Objects.requireNonNull(id, "菜单ID不能为空");
  Objects.requireNonNull(dto, "菜单数据不能为空");
  Objects.requireNonNull(tenantId, "租户ID不能为空");
  
  // 2. 查询实体
  Menu menu = menuRepo.findById(id);
  if (menu == null) {
    throw new NotFoundException("Menu", id.toString());
  }
  
  // 3. 租户隔离检查
  if (!tenantId.equals(menu.tenant)) {
    throw new ValidationException("菜单不属于当前租户", "id", id);
  }
  
  // 4. 业务规则验证
  if (!dto.key().equals(menu.key)) {
    if (menuRepo.count("key = ?1 and tenant = ?2 and id != ?3", 
                       dto.key(), tenantId, id) > 0) {
      throw new ValidationException("菜单标识符已存在", "key", dto.key());
    }
  }
  
  // 5. 更新实体
  mapDtoToEntity(dto, menu);
  menuRepo.persist(menu);
  
  // 6. 记录日志
  LOG.debug("更新菜单成功: id={}, key={}, tenant={}", menu.id, menu.key, tenantId);
  
  // 7. 失效缓存
  invalidateMenuCaches(tenantId);
  
  return mapEntityToResponseDto(menu);
}
```

### Delete（删除）

```java
public void deleteMenu(Long id, Long tenantId) {
  // 1. 参数验证
  Objects.requireNonNull(id, "菜单ID不能为空");
  Objects.requireNonNull(tenantId, "租户ID不能为空");
  
  // 2. 查询实体
  Menu menu = menuRepo.findById(id);
  if (menu == null) {
    throw new NotFoundException("Menu", id.toString());
  }
  
  // 3. 租户隔离检查
  if (!tenantId.equals(menu.tenant)) {
    throw new ValidationException("菜单不属于当前租户", "id", id);
  }
  
  // 4. 业务规则检查（是否有子菜单）
  if (menuRepo.count("parentId = ?1 and tenant = ?2", id, tenantId) > 0) {
    throw new ValidationException("请先删除子菜单", "id", id);
  }
  
  // 5. 删除
  menuRepo.delete(menu);
  
  // 6. 记录日志
  LOG.debug("删除菜单成功: id={}, key={}, tenant={}", id, menu.key, tenantId);
  
  // 7. 失效缓存
  invalidateMenuCaches(tenantId);
}
```

## 缓存使用

### @CacheResult（查询缓存）

```java
@CacheResult(cacheName = "user-menus")
public List<MenuDto> getUserMenus(Long userId, Long tenantId) {
  // 查询逻辑
  // 结果会被缓存
}
```

### @CacheInvalidate（失效缓存）

```java
@CacheInvalidate(cacheName = "user-menus", key = "{userId}")
public void updateUserMenus(Long userId) {
  // 更新逻辑
  // 缓存会自动失效
}
```

### @CacheInvalidateAll（失效所有）

```java
@CacheInvalidateAll(cacheName = "user-menus")
public void invalidateAllMenus() {
  // 失效整个缓存
}
```

### 手动缓存操作

```java
@Inject
@CacheName("user-menus")
Cache cache;

private void invalidateMenuCaches(Long tenantId) {
  cache.invalidateAll().await().indefinitely();
}
```

## 异常处理

### 业务异常

```java
// 验证异常
if (menuRepo.countByKey(dto.key()) > 0) {
  throw new ValidationException("菜单标识符已存在", "key", dto.key());
}

// 未找到异常
Menu menu = menuRepo.findById(id);
if (menu == null) {
  throw new NotFoundException("Menu", id.toString());
}

// 业务异常
if (menuRepo.count("parentId = ?1", id) > 0) {
  throw new BusinessException("ALARM_001", "请先删除子菜单");
}
```

### 全局异常处理

```java
@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Exception> {
  
  @Override
  public Response toResponse(Exception exception) {
    if (exception instanceof NotFoundException) {
      return Response.status(404)
          .entity(Map.of("error", exception.getMessage()))
          .build();
    }
    
    if (exception instanceof ValidationException) {
      return Response.status(400)
          .entity(Map.of("error", exception.getMessage()))
          .build();
    }
    
    // 其他异常...
    return Response.status(500)
        .entity(Map.of("error", "Internal server error"))
        .build();
  }
}
```

## 日志规范

### 日志级别

```java
// DEBUG：详细调试信息
LOG.debug("创建菜单成功: id={}, key={}, tenant={}", menu.id, menu.key, tenantId);

// INFO：重要业务操作
LOG.info("用户登录成功: userId={}, username={}", user.id, user.username);

// WARN：警告信息（不影响系统运行）
LOG.warn("租户配额即将用尽: tenantId={}, used={}", tenantId, used);

// ERROR：错误信息（需要关注）
LOG.error("创建告警失败: tenantId={}", tenantId, exception);
```

### 日志最佳实践

```java
// ✅ 正确：使用参数化日志
LOG.debug("查询用户: id={}, tenant={}", userId, tenantId);

// ❌ 错误：使用字符串拼接
LOG.debug("查询用户: id=" + userId + ", tenant=" + tenantId);

// ✅ 正确：异常作为最后一个参数
LOG.error("创建用户失败: tenantId={}", tenantId, e);

// ❌ 错误：异常消息拼接
LOG.error("创建用户失败: " + e.getMessage(), e);
```

## Service 间调用

```java
@ApplicationScoped
public class UserService {
  
  @Inject
  RoleService roleService;
  
  @Inject
  RbacService rbacService;
  
  @Inject
  NotificationService notificationService;
  
  public User createUserWithRole(UserDto dto, Long tenantId) {
    // 1. 创建用户
    User user = createUser(dto, tenantId);
    
    // 2. 分配默认角色
    roleService.assignDefaultRole(user.id, tenantId);
    
    // 3. 发送通知
    notificationService.sendWelcomeEmail(user.email);
    
    return user;
  }
}
```

## 完整示例

```java
package pro.walkin.ams.admin.system.service;

import io.quarkus.cache.Cache;
import io.quarkus.cache.CacheInvalidate;
import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheName;
import io.quarkus.cache.CacheResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.dto.MenuDto;
import pro.walkin.ams.common.dto.MenuResponseDto;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.Menu;

import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
@Transactional
public class MenuService {
  
  private static final Logger LOG = LoggerFactory.getLogger(MenuService.class);
  private static final String USER_MENUS_CACHE = "user-menus";
  
  @Inject
  @CacheName(USER_MENUS_CACHE)
  Cache cache;
  
  @Inject
  Menu.Repo menuRepo;
  
  @Inject
  RbacService rbacService;
  
  // ========== CRUD 操作 ==========
  
  public MenuResponseDto createMenu(MenuDto dto, Long tenantId) {
    Objects.requireNonNull(dto, "菜单数据不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");
    
    if (menuRepo.countByKey(dto.key()) > 0) {
      throw new ValidationException("菜单标识符已存在", "key", dto.key());
    }
    
    if (dto.parentId() != null) {
      Menu parent = menuRepo.findById(dto.parentId());
      if (parent == null) {
        throw new NotFoundException("Menu", dto.parentId().toString());
      }
      if (!tenantId.equals(parent.tenant)) {
        throw new ValidationException("父菜单不属于当前租户", "parentId", dto.parentId());
      }
    }
    
    Menu menu = new Menu();
    mapDtoToEntity(dto, menu);
    menu.tenant = tenantId;
    menu.persist();
    
    LOG.debug("创建菜单成功: id={}, key={}, tenant={}", menu.id, menu.key, tenantId);
    return mapEntityToResponseDto(menu);
  }
  
  public MenuResponseDto updateMenu(Long id, MenuDto dto, Long tenantId) {
    Objects.requireNonNull(id, "菜单ID不能为空");
    Objects.requireNonNull(dto, "菜单数据不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");
    
    Menu menu = menuRepo.findById(id);
    if (menu == null) {
      throw new NotFoundException("Menu", id.toString());
    }
    if (!tenantId.equals(menu.tenant)) {
      throw new ValidationException("菜单不属于当前租户", "id", id);
    }
    
    if (!dto.key().equals(menu.key)) {
      if (menuRepo.count("key = ?1 and tenant = ?2 and id != ?3", 
                         dto.key(), tenantId, id) > 0) {
        throw new ValidationException("菜单标识符已存在", "key", dto.key());
      }
    }
    
    mapDtoToEntity(dto, menu);
    menuRepo.persist(menu);
    
    LOG.debug("更新菜单成功: id={}, key={}, tenant={}", menu.id, menu.key, tenantId);
    invalidateMenuCaches(tenantId);
    
    return mapEntityToResponseDto(menu);
  }
  
  public void deleteMenu(Long id, Long tenantId) {
    Objects.requireNonNull(id, "菜单ID不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");
    
    Menu menu = menuRepo.findById(id);
    if (menu == null) {
      throw new NotFoundException("Menu", id.toString());
    }
    if (!tenantId.equals(menu.tenant)) {
      throw new ValidationException("菜单不属于当前租户", "id", id);
    }
    
    if (menuRepo.count("parentId = ?1 and tenant = ?2", id, tenantId) > 0) {
      throw new ValidationException("请先删除子菜单", "id", id);
    }
    
    menuRepo.delete(menu);
    LOG.debug("删除菜单成功: id={}, key={}, tenant={}", id, menu.key, tenantId);
    invalidateMenuCaches(tenantId);
  }
  
  // ========== 查询操作 ==========
  
  @CacheResult(cacheName = USER_MENUS_CACHE)
  public List<MenuResponseDto> getUserMenus(Long userId, Long tenantId) {
    Set<String> permissions = rbacService.getUserPermissions(userId);
    List<Menu> menus = menuRepo.listByTenantOrderBySort(tenantId);
    
    return menus.stream()
        .filter(menu -> hasMenuPermission(menu, permissions))
        .map(this::mapEntityToResponseDto)
        .collect(Collectors.toList());
  }
  
  // ========== 私有方法 ==========
  
  private void invalidateMenuCaches(Long tenantId) {
    cache.invalidateAll().await().indefinitely();
  }
  
  private void mapDtoToEntity(MenuDto dto, Menu menu) {
    menu.key = dto.key();
    menu.label = dto.label();
    menu.route = dto.route();
    menu.parentId = dto.parentId();
    menu.icon = dto.icon();
    menu.sortOrder = dto.sortOrder();
    menu.isVisible = dto.isVisible();
  }
  
  private MenuResponseDto mapEntityToResponseDto(Menu menu) {
    return new MenuResponseDto(
        menu.id,
        menu.key,
        menu.label,
        menu.route,
        menu.parentId,
        menu.icon,
        menu.sortOrder,
        menu.isVisible,
        menu.tenant
    );
  }
  
  private boolean hasMenuPermission(Menu menu, Set<String> permissions) {
    if (menu.rolesAllowed == null || menu.rolesAllowed.isEmpty()) {
      return true;
    }
    return menu.rolesAllowed.stream()
        .anyMatch(permissions::contains);
  }
}
```

## 最佳实践

### ✅ 推荐做法

1. **单一职责**：每个 Service 只负责一个业务领域
2. **明确的事务边界**：使用 @Transactional
3. **参数验证**：使用 Objects.requireNonNull
4. **租户隔离**：所有操作都要检查 tenant_id
5. **日志记录**：关键操作记录 DEBUG 日志
6. **缓存策略**：读多写少的数据使用缓存
7. **异常处理**：使用自定义异常，明确错误原因

### ❌ 避免做法

1. **不要在 Service 中直接操作 EntityManager**
2. **不要绕过事务注解**
3. **不要返回 null**（返回 Optional 或空集合）
4. **不要在 Service 中处理 HTTP 请求/响应**（应该在 Controller 层）
5. **不要在 Service 中处理数据库连接**（Repository 层负责）
