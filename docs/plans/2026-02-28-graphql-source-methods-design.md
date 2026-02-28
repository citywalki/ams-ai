# GraphQL Source Methods 批量加载重构设计

## 背景

当前 GraphQL API 在处理懒加载关联字段时存在以下问题：

1. **LazyInitializationException** - 事务结束后访问懒加载集合
2. **N+1 查询问题** - 每个实体单独加载关联数据
3. **性能问题** - 使用 `.size()` 强制初始化不是最优解

## 目标

使用 SmallRye GraphQL 的 `@Source` 注解实现批量数据加载：
- 只有客户端请求时才加载关联数据
- 批量查询避免 N+1 问题
- 代码结构更清晰

## 架构设计

```
当前架构:
┌──────────────┐     ┌──────────────┐
│ GraphQLApi   │────▶│ Entity       │
│ (查询方法)    │     │ (懒加载字段)  │
└──────────────┘     └──────────────┘

重构后:
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ GraphQLApi   │────▶│ SourceMethod │────▶│ Repository   │
│ (查询方法)    │     │ (批量加载)    │     │ (批量查询)    │
└──────────────┘     └──────────────┘     └──────────────┘
```

## 重构范围

### 懒加载字段

| 实体 | 字段 | 关系类型 | Source Method 返回类型 |
|------|------|---------|----------------------|
| User | roles | ManyToMany | `List<Set<Role>>` |
| Role | permissions | ManyToMany | `List<Set<Permission>>` |
| Menu | children | OneToMany | `List<List<Menu>>` |
| Menu | parent | ManyToOne | `List<Menu>` |
| Menu | buttonPermissions | OneToMany | `List<List<Permission>>` |
| Permission | menu | ManyToOne | `List<Menu>` |

## 实现方案

### 1. 实体修改

在懒加载字段上添加 `@Ignore` 注解：

```java
// User.java
@ManyToMany(fetch = FetchType.LAZY)
@JoinTable(name = "user_roles", ...)
@Ignore  // 阻止 GraphQL 自动暴露
public Set<Role> roles = new HashSet<>();
```

### 2. Source Method 实现

每个 GraphQL API 类添加批量加载方法：

**UserGraphQLApi.java:**
```java
public List<Set<Role>> roles(@Source List<User> users) {
    if (users.isEmpty()) return List.of();
    
    List<Long> userIds = users.stream().map(u -> u.id).toList();
    Map<Long, Set<Role>> rolesByUser = loadRolesByUserIds(userIds);
    
    return users.stream()
        .map(u -> rolesByUser.getOrDefault(u.id, Set.of()))
        .toList();
}

private Map<Long, Set<Role>> loadRolesByUserIds(List<Long> userIds) {
    // 查询 user_roles 关联表
    // 返回 Map<UserId, Set<Role>>
}
```

**RoleGraphQLApi.java:**
```java
public List<Set<Permission>> permissions(@Source List<Role> roles) {
    if (roles.isEmpty()) return List.of();
    
    List<Long> roleIds = roles.stream().map(r -> r.id).toList();
    Map<Long, Set<Permission>> permsByRole = loadPermissionsByRoleIds(roleIds);
    
    return roles.stream()
        .map(r -> permsByRole.getOrDefault(r.id, Set.of()))
        .toList();
}
```

**MenuGraphQLApi.java:**
```java
public List<List<Menu>> children(@Source List<Menu> menus) {
    // 批量加载子菜单
}

public List<Menu> parent(@Source List<Menu> menus) {
    // 批量加载父菜单
}

public List<List<Permission>> buttonPermissions(@Source List<Menu> menus) {
    // 批量加载按钮权限
}
```

**PermissionGraphQLApi.java:**
```java
public List<Menu> menu(@Source List<Permission> permissions) {
    // 批量加载所属菜单
}
```

### 3. 批量查询优化

使用单次 JOIN 查询替代多次单独查询：

```java
// 加载用户角色的批量查询
private Map<Long, Set<Role>> loadRolesByUserIds(List<Long> userIds) {
    String jpql = """
        SELECT u.id, r FROM User u 
        JOIN u.roles r 
        WHERE u.id IN :userIds
        """;
    
    List<Object[]> results = session.createQuery(jpql, Object[].class)
        .setParameter("userIds", userIds)
        .getResultList();
    
    Map<Long, Set<Role>> map = new HashMap<>();
    for (Object[] row : results) {
        Long userId = (Long) row[0];
        Role role = (Role) row[1];
        map.computeIfAbsent(userId, k -> new HashSet<>()).add(role);
    }
    return map;
}
```

### 4. 移除旧的初始化代码

删除 UserGraphQLApi 中的 `.size()` 初始化代码：

```java
// 删除这段代码
for (User user : users) {
    user.roles.size();
}
```

## 文件变更清单

### 实体修改
- `lib-persistence/.../User.java` - 添加 `@Ignore` 到 roles
- `lib-persistence/.../Role.java` - 添加 `@Ignore` 到 permissions
- `lib-persistence/.../Menu.java` - 添加 `@Ignore` 到 children, parent, buttonPermissions
- `lib-persistence/.../Permission.java` - 添加 `@Ignore` 到 menu

### GraphQL API 修改
- `feature-graphql/.../UserGraphQLApi.java` - 添加 `roles(@Source List<User>)` 方法
- `feature-graphql/.../RoleGraphQLApi.java` - 添加 `permissions(@Source List<Role>)` 方法
- `feature-graphql/.../MenuGraphQLApi.java` - 添加 children, parent, buttonPermissions 方法
- `feature-graphql/.../PermissionGraphQLApi.java` - 添加 `menu(@Source List<Permission>)` 方法

## 验证方法

1. 启动应用，访问 `/q/graphql-ui/`
2. 执行包含关联字段的查询：

```graphql
query {
  users(page: 0, size: 10) {
    items {
      id
      username
      roles {
        id
        code
        name
        permissions {
          id
          code
        }
      }
    }
  }
}
```

3. 检查 SQL 日志，确认只有少量批量查询而非 N+1

## 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| 空列表处理 | 在方法开头检查 `users.isEmpty()` |
| 关联不存在 | 使用 `getOrDefault` 返回空集合 |
| 性能回退 | 添加查询日志监控批量加载效果 |

## 后续优化

1. 考虑添加 DataLoader 缓存（同一请求内）
2. 添加 `@Description` 注解提供字段文档
3. 监控批量查询性能，调整查询策略
