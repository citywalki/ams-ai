# Repository 模式

## 概述

AMS-AI 使用 Quarkus Panache Next 的 Repository 模式进行数据访问。Repository 作为实体类中的嵌套接口，提供类型安全的数据库操作。

## Repository 访问方式

### 通过 Entity_.managed() 或 Entity_.managedBlocking()

```java
// 非阻塞访问（推荐）
@Inject User.Repo userRepo;  // ❌ 不推荐：直接注入

// ✅ 正确：使用静态工厂方法
User_.managed().findByUsername("admin");
User_.managedBlocking().findById(1L);
```

### ⚠️ 重要：Repository 注入方式

虽然可以 `@Inject` Repository，但在 Panache Next 中，推荐使用静态访问：

```java
// 方式 1：静态访问（推荐）
List<User> users = User_.managed().listAll();
Optional<User> user = User_.managed().findByUsername("admin");

// 方式 2：注入访问（也可以）
@Inject User.Repo userRepo;
List<User> users = userRepo.listAll();
```

## Repository 接口定义

### 基础结构

```java
@Entity
@Table(name = "users")
public class User extends BaseEntity {
  
  // 实体字段...
  
  public interface Repo extends PanacheRepository<User> {
    // 查询方法定义
  }
}
```

### 查询方法类型

#### 1. @Find 注解方法（编译时生成）

```java
public interface Repo extends PanacheRepository<User> {
  // 精确查询 - 返回 Optional
  @Find
  Optional<User> findByUsername(String username);
  
  @Find
  Optional<User> findByEmail(String email);
  
  // 精确查询 - 返回实体（找不到抛异常）
  @Find
  User getByUsername(String username);
  
  // 列表查询
  @Find
  List<User> findByStatus(String status);
  
  @Find
  List<User> findByTenant(Long tenant);
  
  // Stream 查询（大数据集）
  @Find
  Stream<Alarm> findBySourceId(String sourceId);
  
  // 计数查询
  @Find
  long countByStatus(String status);
  
  // 存在性检查
  @Find
  boolean existsByUsername(String username);
}
```

#### 2. 自定义默认方法

```java
public interface Repo extends PanacheRepository<User> {
  
  // 分页查询
  default List<User> listByTenant(Long tenantId, int page, int size) {
    return find("tenant", tenantId)
        .page(page, size)
        .list();
  }
  
  // 复杂条件查询
  default List<User> searchUsers(
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
    
    if (email != null && !email.isBlank()) {
      query.append(" and lower(email) like lower(:email)");
      params.put("email", "%" + email + "%");
    }
    
    if (status != null && !status.isBlank()) {
      query.append(" and status = :status");
      params.put("status", status);
    }
    
    return find(query.toString(), params)
        .page(page, size)
        .list();
  }
  
  // 排序查询
  default List<User> listByTenantOrderByCreatedAt(Long tenantId) {
    return find("tenant", tenantId)
        .order("createdAt", Sort.Direction.Descending)
        .list();
  }
  
  // 聚合查询
  default long countByTenant(Long tenantId) {
    return count("tenant", tenantId);
  }
  
  // 批量操作
  default long deleteByTenant(Long tenantId) {
    return delete("tenant", tenantId);
  }
  
  // 流式查询（大数据集）
  default Stream<User> streamByTenant(Long tenantId) {
    return find("tenant", tenantId).stream();
  }
}
```

## 查询语法

### Panache 查询语言

```java
// 简单条件
find("status", "ACTIVE")
find("tenant", tenantId)

// 多条件 AND
find("tenant = ?1 and status = ?2", tenantId, "ACTIVE")

// 命名参数
find("tenant = :tenant and status = :status", 
     Parameters.with("tenant", tenantId).and("status", "ACTIVE"))

// LIKE 查询
find("lower(username) like lower(:username)", 
     Parameters.with("username", "%" + username + "%"))

// IN 查询
find("status in (:statuses)", 
     Parameters.with("statuses", List.of("NEW", "ACTIVE")))

// 排序
find("tenant", tenantId).order("createdAt", Sort.Direction.Descending)

// 分页
find("tenant", tenantId).page(0, 20).list()
find("tenant", tenantId).page(Page.of(0, 20)).list()

// 范围查询
find("tenant", tenantId).range(0, 19).list()
```

## 多租户过滤

### 自动过滤（通过 Hibernate Filter）

```java
// BaseEntity 已配置 @FilterDef(name = "tenant-filter")
// 所有查询自动添加 tenant_id 过滤（如果 TenantContext 已设置）

// 在 Service 层
@Transactional
public List<User> getUsers(Long tenantId) {
    // 设置租户上下文
    TenantContext.setCurrentTenantId(tenantId);
    
    // 查询自动过滤
    return User_.managed().listAll();
}
```

### 手动过滤（推荐用于明确租户）

```java
public interface Repo extends PanacheRepository<User> {
  default List<User> listByTenant(Long tenantId, int page, int size) {
    return find("tenant", tenantId)
        .page(page, size)
        .list();
  }
}
```

## 事务管理

### @Transactional 注解

```java
@ApplicationScoped
public class UserService {
  
  // 读操作
  @Transactional
  public User getUserById(Long id) {
    return User_.managed().findById(id);
  }
  
  // 写操作
  @Transactional
  public User createUser(UserDto dto, Long tenantId) {
    User user = new User();
    user.username = dto.username();
    user.tenant = tenantId;
    user.persist();  // 或 User_.managed().persist(user);
    return user;
  }
  
  // 批量操作
  @Transactional
  public void batchCreate(List<UserDto> dtos, Long tenantId) {
    dtos.forEach(dto -> {
      User user = new User();
      user.username = dto.username();
      user.tenant = tenantId;
      user.persist();
    });
  }
}
```

## CRUD 操作

### Create（创建）

```java
// 方式 1：实体方法
User user = new User();
user.username = "admin";
user.tenant = 1L;
user.persist();

// 方式 2：Repository 方法
User_.managed().persist(user);

// 批量创建
List<User> users = Arrays.asList(user1, user2);
User_.managed().persist(users);
```

### Read（读取）

```java
// 单个查询
User user = User_.managed().findById(1L);
Optional<User> userOpt = User_.managed().findByUsername("admin");

// 列表查询
List<User> users = User_.managed().listAll();
List<User> activeUsers = User_.managed().list("status", "ACTIVE");

// 分页查询
List<User> paged = User_.managed().find("tenant", 1L)
    .page(0, 20)
    .list();

// 计数
long count = User_.managed().count();
long activeCount = User_.managed().count("status", "ACTIVE");

// 存在性检查
boolean exists = User_.managed().existsByUsername("admin");
```

### Update（更新）

```java
// 方式 1：修改实体后 persist
@Transactional
public User updateUser(Long id, UserDto dto) {
  User user = User_.managed().findById(id);
  if (user == null) {
    throw new NotFoundException("User", id.toString());
  }
  user.username = dto.username();
  user.persist();  // 更新
  return user;
}

// 方式 2：批量更新
@Transactional
public int updateStatus(Long tenantId, String oldStatus, String newStatus) {
  return User_.managed().update(
      "status = ?1 where tenant = ?2 and status = ?3",
      newStatus, tenantId, oldStatus
  );
}
```

### Delete（删除）

```java
// 单个删除
@Transactional
public void deleteUser(Long id) {
  User user = User_.managed().findById(id);
  if (user != null) {
    User_.managed().delete(user);
  }
}

// 按 ID 删除
User_.managed().deleteById(1L);

// 条件删除
@Transactional
public int deleteByTenant(Long tenantId) {
  return User_.managed().delete("tenant", tenantId);
}

// 批量删除
User_.managed().delete("status", "INACTIVE");
```

## 最佳实践

### ✅ 推荐做法

1. **使用 @Find 注解简化查询**
   ```java
   @Find
   Optional<User> findByUsername(String username);  // 自动生成实现
   ```

2. **复杂查询使用 default 方法**
   ```java
   default List<User> searchUsers(...) {
     // 复杂查询逻辑
   }
   ```

3. **明确租户过滤**
   ```java
   default List<User> listByTenant(Long tenantId, int page, int size) {
     return find("tenant", tenantId).page(page, size).list();
   }
   ```

4. **使用 Stream 处理大数据集**
   ```java
   default Stream<Alarm> streamPendingAlarms() {
     return find("status", "NEW").stream();
   }
   ```

### ❌ 避免做法

1. **不要在 Repository 中写业务逻辑**
   ```java
   // ❌ 错误
   default User createAndValidate(UserDto dto) {
     // 验证逻辑应该在 Service 层
   }
   ```

2. **不要绕过 Repository 直接操作 EntityManager**
   ```java
   // ❌ 错误
   @Inject EntityManager em;
   em.createQuery("...");
   ```

3. **不要在 Repository 中处理事务**
   ```java
   // ❌ 错误：Repository 方法不应有 @Transactional
   @Transactional  // 事务应在 Service 层
   default void deleteUser(Long id) { }
   ```

4. **不要返回 null 集合**
   ```java
   // ❌ 错误
   default List<User> findUsers() {
     return null;  // 应该返回空列表
   }
   
   // ✅ 正确
   default List<User> findUsers() {
     return listAll();  // 永远不返回 null
   }
   ```

## 完整示例

```java
@Entity
@Table(name = "menus")
@Filter(name = "tenant-filter")
public class Menu extends BaseEntity {

  @Column(name = "key", nullable = false)
  public String key;

  @Column(name = "label", nullable = false)
  public String label;

  @Column(name = "parent_id")
  public Long parentId;

  @Column(name = "sort_order")
  public Integer sortOrder = 0;

  // ... 其他字段

  public interface Repo extends PanacheRepository<Menu> {

    // @Find 方法
    @Find
    Menu findByKey(String key);

    @Find
    List<Menu> findByParentId(Long parentId);

    @Find
    List<Menu> findByIsVisible(Boolean isVisible);

    // 自定义方法
    default Long countByKey(String key) {
      return count("key", key);
    }

    default List<Menu> listByTenantOrderBySort(Long tenantId) {
      return find("tenant", tenantId)
          .order("sortOrder", Sort.Direction.Ascending)
          .list();
    }

    default List<Menu> findChildren(Long parentId, Long tenantId) {
      return find("parentId = ?1 and tenant = ?2", parentId, tenantId)
          .list();
    }

    default Optional<Menu> findByKeyAndTenant(String key, Long tenantId) {
      return find("key = ?1 and tenant = ?2", key, tenantId)
          .firstResultOptional();
    }
  }
}
```

## 性能优化

### 分页查询

```java
// 使用 Panache 的分页
PanacheQuery<User> query = User_.managed().find("tenant", tenantId);
List<User> page1 = query.page(0, 20).list();
List<User> page2 = query.page(1, 20).list();

// 获取总数
long totalCount = query.count();
```

### 流式处理

```java
// 处理大量数据时不一次性加载到内存
try (Stream<Alarm> stream = Alarm_.managed().streamAll()) {
  stream.forEach(alarm -> {
    // 处理每个告警
  });
}
```

### 批量操作

```java
// 批量插入
@Transactional
public void batchInsert(List<User> users) {
  users.forEach(User::persist);
}

// 批量更新
@Transactional
public int batchUpdateStatus(List<Long> ids, String newStatus) {
  return User_.managed().update(
      "status = ?1 where id in ?2",
      newStatus, ids
  );
}
```
