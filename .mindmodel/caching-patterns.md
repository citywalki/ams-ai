# 缓存模式 (Caching Pattern)

## 概述

AMS-AI 使用 Hazelcast 5.4.0 作为分布式缓存，配合 Quarkus Cache 注解实现方法级缓存。

## Hazelcast 配置

### application.yaml

```yaml
quarkus:
  cache:
    enabled: true
    type: hazelcast
    
hazelcast:
  cluster:
    name: ams-ai-cluster
  network:
    join:
      multicast:
        enabled: false
      tcp-ip:
        enabled: true
        members: 127.0.0.1:5701
  map:
    default:
      time-to-live-seconds: 3600
      max-size:
        policy: PER_NODE
        size: 10000
```

### HazelcastConfig

```java
package pro.walkin.ams.common.config;

import com.hazelcast.config.Config;
import com.hazelcast.config.MapConfig;
import com.hazelcast.config.EvictionConfig;
import com.hazelcast.config.EvictionPolicy;
import io.quarkus.runtime.Startup;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;

@ApplicationScoped
public class HazelcastConfig {
    
    @Produces
    @ApplicationScoped
    @Startup
    public Config produceHazelcastConfig() {
        Config config = new Config();
        config.setClusterName("ams-ai-cluster");
        
        // 用户菜单缓存
        config.addMapConfig(createMapConfig(
            "user-menus",
            3600,  // 1小时 TTL
            5000   // 最大5000条
        ));
        
        // 用户权限缓存
        config.addMapConfig(createMapConfig(
            "user-permissions",
            1800,  // 30分钟 TTL
            10000  // 最大10000条
        ));
        
        // 角色缓存
        config.addMapConfig(createMapConfig(
            "roles",
            7200,  // 2小时 TTL
            1000   // 最大1000条
        ));
        
        return config;
    }
    
    private MapConfig createMapConfig(String name, int ttl, int maxSize) {
        return new MapConfig(name)
            .setTimeToLiveSeconds(ttl)
            .setEvictionConfig(
                new EvictionConfig()
                    .setSize(maxSize)
                    .setEvictionPolicy(EvictionPolicy.LRU)
            );
    }
}
```

## Quarkus Cache 注解

### @CacheResult（缓存结果）

```java
@ApplicationScoped
public class MenuService {
    
    /**
     * 获取用户菜单
     * 结果会被缓存，key 为 userId
     */
    @CacheResult(cacheName = "user-menus")
    public List<MenuResponseDto> getUserMenus(Long userId, Long tenantId) {
        // 查询逻辑
        List<Menu> menus = menuRepo.listByTenantOrderBySort(tenantId);
        
        // 过滤权限
        Set<String> permissions = rbacService.getUserPermissions(userId);
        
        return menus.stream()
            .filter(menu -> hasPermission(menu, permissions))
            .map(this::mapEntityToResponseDto)
            .toList();
    }
}
```

### @CacheInvalidate（失效缓存）

```java
@ApplicationScoped
public class MenuService {
    
    /**
     * 更新菜单
     * 失效该租户下所有用户的菜单缓存
     */
    @CacheInvalidateAll(cacheName = "user-menus")
    public MenuResponseDto updateMenu(Long id, MenuDto dto, Long tenantId) {
        // 更新逻辑
        Menu menu = menuRepo.findById(id);
        mapDtoToEntity(dto, menu);
        menuRepo.persist(menu);
        
        // 自动失效缓存
        return mapEntityToResponseDto(menu);
    }
    
    /**
     * 删除菜单
     * 失效该租户下所有用户的菜单缓存
     */
    @CacheInvalidateAll(cacheName = "user-menus")
    public void deleteMenu(Long id, Long tenantId) {
        Menu menu = menuRepo.findById(id);
        menuRepo.delete(menu);
    }
}
```

### @CacheInvalidateAll（失效所有）

```java
@ApplicationScoped
public class RoleService {
    
    /**
     * 更新角色权限
     * 失效所有权限缓存
     */
    @CacheInvalidateAll(cacheName = "user-permissions")
    @CacheInvalidateAll(cacheName = "user-menus")
    public void updateRolePermissions(Long roleId, List<Long> permissionIds) {
        // 更新逻辑
        Role role = Role_.managed().findById(roleId);
        role.permissions.clear();
        role.permissions.addAll(
            Permission_.managed().find("id in ?1", permissionIds).list()
        );
        role.persist();
    }
}
```

## 手动缓存操作

```java
@ApplicationScoped
public class MenuService {
    
    @Inject
    @CacheName("user-menus")
    Cache cache;
    
    /**
     * 手动失效租户相关的所有缓存
     */
    private void invalidateTenantCache(Long tenantId) {
        // 获取租户下所有用户
        List<Long> userIds = User_.managed()
            .find("tenant", tenantId)
            .project(User.IdOnly.class)
            .stream()
            .map(u -> u.id)
            .toList();
        
        // 批量失效
        userIds.forEach(userId -> {
            cache.invalidate(userId).await().indefinitely();
        });
    }
    
    /**
     * 手动添加缓存
     */
    private void cacheUserMenus(Long userId, List<MenuResponseDto> menus) {
        cache.put(userId, menus).await().indefinitely();
    }
    
    /**
     * 手动获取缓存
     */
    private List<MenuResponseDto> getCachedMenus(Long userId) {
        Optional<List<MenuResponseDto>> cached = 
            cache.<Long, List<MenuResponseDto>>get(userId)
                .await()
                .indefinitely();
        
        return cached.orElse(null);
    }
}
```

## 缓存策略

### 1. 读穿透（Read-Through）

```java
@ApplicationScoped
public class RbacService {
    
    /**
     * 获取用户权限（读穿透）
     * 如果缓存不存在，自动查询数据库并缓存
     */
    @CacheResult(cacheName = "user-permissions")
    public Set<String> getUserPermissions(Long userId) {
        User user = User_.managed().findById(userId);
        
        return user.roles.stream()
            .flatMap(role -> role.permissions.stream())
            .map(permission -> permission.code)
            .collect(Collectors.toSet());
    }
}
```

### 2. 写穿透（Write-Through）

```java
@ApplicationScoped
public class RbacService {
    
    @Inject
    @CacheName("user-permissions")
    Cache cache;
    
    /**
     * 分配角色（写穿透）
     * 更新数据库同时失效缓存
     */
    @Transactional
    @CacheInvalidate(cacheName = "user-permissions", key = "{userId}")
    public void assignRole(Long userId, Long roleId) {
        User user = User_.managed().findById(userId);
        Role role = Role_.managed().findById(roleId);
        
        user.roles.add(role);
        user.persist();
        
        // 自动失效缓存
    }
}
```

### 3. 缓存预热

```java
@ApplicationScoped
public class CacheWarmup {
    
    @Inject
    RbacService rbacService;
    
    @Inject
    MenuService menuService;
    
    /**
     * 应用启动时预热缓存
     */
    @Transactional
    void onStartup(@Observes StartupEvent event) {
        LOG.info("开始预热缓存...");
        
        // 预热所有用户的权限和菜单
        List<User> users = User_.managed().listAll();
        
        users.forEach(user -> {
            // 预热权限
            rbacService.getUserPermissions(user.id);
            
            // 预热菜单
            menuService.getUserMenus(user.id, user.tenant);
        });
        
        LOG.info("缓存预热完成");
    }
}
```

## 缓存键设计

### 简单键

```java
// 单参数键
@CacheResult(cacheName = "user-menus")
public List<MenuDto> getUserMenus(Long userId) { }

// 键 = userId
```

### 复合键

```java
// 多参数键
@CacheResult(cacheName = "user-menus")
public List<MenuDto> getUserMenus(Long userId, Long tenantId) { }

// 键 = {userId, tenantId}
```

### 自定义键生成器

```java
@ApplicationScoped
public class CacheKeyGenerator {
    
    /**
     * 生成用户菜单缓存键
     */
    public String generateUserMenuKey(Long userId, Long tenantId) {
        return String.format("user:%d:tenant:%d:menus", userId, tenantId);
    }
    
    /**
     * 生成权限缓存键
     */
    public String generatePermissionKey(Long userId) {
        return String.format("user:%d:permissions", userId);
    }
}
```

## 缓存失效策略

### 1. 基于 TTL（Time To Live）

```yaml
hazelcast:
  map:
    user-menus:
      time-to-live-seconds: 3600  # 1小时后自动失效
```

### 2. 基于事件

```java
@ApplicationScoped
public class MenuService {
    
    /**
     * 创建菜单 - 失效所有用户菜单缓存
     */
    @CacheInvalidateAll(cacheName = "user-menus")
    public MenuResponseDto createMenu(MenuDto dto, Long tenantId) { }
    
    /**
     * 更新菜单 - 失效所有用户菜单缓存
     */
    @CacheInvalidateAll(cacheName = "user-menus")
    public MenuResponseDto updateMenu(Long id, MenuDto dto, Long tenantId) { }
    
    /**
     * 删除菜单 - 失效所有用户菜单缓存
     */
    @CacheInvalidateAll(cacheName = "user-menus")
    public void deleteMenu(Long id, Long tenantId) { }
}
```

### 3. 手动失效

```java
@ApplicationScoped
public class CacheService {
    
    @Inject
    @CacheName("user-menus")
    Cache menuCache;
    
    @Inject
    @CacheName("user-permissions")
    Cache permissionCache;
    
    /**
     * 失效用户的所有缓存
     */
    public void invalidateUserCache(Long userId) {
        menuCache.invalidate(userId).await().indefinitely();
        permissionCache.invalidate(userId).await().indefinitely();
    }
    
    /**
     * 失效租户的所有缓存
     */
    public void invalidateTenantCache(Long tenantId) {
        menuCache.invalidateAll().await().indefinitely();
        permissionCache.invalidateAll().await().indefinitely();
    }
}
```

## 缓存监控

### 缓存统计

```java
@ApplicationScoped
public class CacheMonitor {
    
    @Inject
    @CacheName("user-menus")
    Cache menuCache;
    
    /**
     * 获取缓存统计信息
     */
    public CacheStats getCacheStats() {
        return new CacheStats(
            menuCache.getName(),
            menuCache.size(),
            menuCache.getHitRate(),
            menuCache.getMissRate(),
            menuCache.getEvictionCount()
        );
    }
}

public record CacheStats(
    String cacheName,
    long size,
    double hitRate,
    double missRate,
    long evictionCount
) {}
```

### Micrometer 指标

```java
@ApplicationScoped
public class CacheMetrics {
    
    @Inject
    MeterRegistry meterRegistry;
    
    @Scheduled(every = "60s")
    void recordCacheMetrics() {
        // 记录缓存大小
        meterRegistry.gauge("cache.user_menus.size", menuCache.size());
        
        // 记录命中率
        meterRegistry.gauge("cache.user_menus.hit_rate", menuCache.getHitRate());
    }
}
```

## 缓存最佳实践

### ✅ 推荐做法

1. **读多写少的数据适合缓存**
   - 用户权限
   - 菜单配置
   - 系统配置

2. **设置合理的 TTL**
   - 频繁变化的数据：短 TTL（分钟级）
   - 不常变化的数据：长 TTL（小时级）

3. **及时失效缓存**
   - 数据更新时立即失效
   - 使用 @CacheInvalidate

4. **缓存预热**
   - 应用启动时加载热点数据

5. **监控缓存命中率**
   - 命中率低需要调整策略

### ❌ 避免做法

1. **缓存大对象**
   - 单个对象不超过 1MB

2. **缓存频繁变化的数据**
   - 实时性要求高的数据不适合缓存

3. **缓存敏感数据**
   - 密码、密钥等不应缓存

4. **过度缓存**
   - 不是所有数据都需要缓存

5. **缓存键设计不当**
   - 避免键冲突
   - 确保键的唯一性

## 缓存场景

### 1. 用户权限缓存

```java
@CacheResult(cacheName = "user-permissions")
public Set<String> getUserPermissions(Long userId) {
    // 查询权限
}

@CacheInvalidate(cacheName = "user-permissions")
public void updateRole(Long roleId) {
    // 更新角色
}
```

### 2. 菜单缓存

```java
@CacheResult(cacheName = "user-menus")
public List<MenuDto> getUserMenus(Long userId, Long tenantId) {
    // 查询菜单
}

@CacheInvalidateAll(cacheName = "user-menus")
public void updateMenu(Long menuId) {
    // 更新菜单
}
```

### 3. 系统配置缓存

```java
@CacheResult(cacheName = "system-config")
public String getConfig(String key) {
    // 查询配置
}

@CacheInvalidate(cacheName = "system-config")
public void updateConfig(String key, String value) {
    // 更新配置
}
```
