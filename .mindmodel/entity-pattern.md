# 实体模式 (Entity Pattern)

## 概述

AMS-AI 使用 Quarkus Panache Next 的 Repository 模式，实体类继承 `BaseEntity`，字段使用 `public` 访问修饰符，Repository 作为嵌套接口。

## 实体类结构

### 基础实体 (BaseEntity)

```java
package pro.walkin.ams.persistence.entity;

import io.quarkus.hibernate.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import pro.walkin.ams.persistence.generator.SnowflakeIdGeneratorType;

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

  @Override
  public String toString() {
    return this.getClass().getSimpleName() + "<" + id + ">";
  }
}
```

### 标准实体模板

```java
package pro.walkin.ams.persistence.entity.system;

import io.quarkus.hibernate.panache.PanacheRepository;
import jakarta.persistence.*;
import org.eclipse.microprofile.graphql.Ignore;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.processing.Find;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.persistence.entity.BaseEntity;

import java.time.Instant;
import java.util.Map;

/**
 * 用户实体
 *
 * <p>对应数据库表: users
 */
@Entity
@Table(name = "users")
@Filter(name = "tenant-filter")
public class User extends BaseEntity {

  /*
   * 用户名
   */
  @Column(name = "username", nullable = false, unique = true)
  public String username;

  /*
   * 邮箱地址
   */
  @Column(name = "email", unique = true)
  public String email;

  /*
   * 密码哈希
   */
  @Column(name = "password_hash", nullable = false)
  @Ignore  // GraphQL 忽略
  public String passwordHash;

  /*
   * 用户偏好设置 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "preferences")
  @Ignore
  public Map<String, Object> preferences;

  /*
   * 创建时间
   */
  @Column(name = "created_at")
  @CreationTimestamp
  public Instant createdAt;

  /*
   * 更新时间
   */
  @Column(name = "updated_at")
  @UpdateTimestamp
  public Instant updatedAt;

  public interface Repo extends PanacheRepository<User> {
    @Find
    Optional<User> findByUsername(String username);

    @Find
    Optional<User> findByEmail(String email);
  }
}
```

## 实体模式规则

### 必须遵守

1. **继承 BaseEntity**
   ```java
   public class User extends BaseEntity { }
   ```

2. **字段访问修饰符**
   ```java
   // ✅ 正确：public 字段
   public String username;
   
   // ❌ 错误：private 字段 + getter/setter
   private String username;
   public String getUsername() { return username; }
   ```

3. **嵌套 Repository 接口**
   ```java
   public class User extends BaseEntity {
     public interface Repo extends PanacheRepository<User> {
       // 查询方法
     }
   }
   ```

4. **列名使用 snake_case**
   ```java
   @Column(name = "tenant_id")
   public Long tenant;
   
   @Column(name = "created_at")
   public Instant createdAt;
   ```

5. **时间戳字段**
   ```java
   @Column(name = "created_at")
   @CreationTimestamp
   public Instant createdAt;
   
   @Column(name = "updated_at")
   @UpdateTimestamp
   public Instant updatedAt;
   ```

6. **JSON 字段**
   ```java
   @JdbcTypeCode(SqlTypes.JSON)
   @Column(name = "metadata")
   @Ignore  // 通常 GraphQL 不暴露
   public Map<String, Object> metadata;
   ```

7. **敏感字段标记 @Ignore**
   ```java
   @Column(name = "password_hash")
   @Ignore
   public String passwordHash;
   ```

### 禁止做法

1. **❌ 禁止使用 Lombok**
   ```java
   // ❌ 错误
   @Data
   @Entity
   public class User { }
   
   // ✅ 正确
   @Entity
   public class User extends BaseEntity {
     public String username;
   }
   ```

2. **❌ 禁止使用 private 字段**
   ```java
   // ❌ 错误
   private String username;
   
   // ✅ 正确
   public String username;
   ```

3. **❌ 禁止在实体中编写业务逻辑**
   ```java
   // ❌ 错误：复杂业务逻辑
   public void processAlarm() {
     // 大量业务代码
   }
   
   // ✅ 正确：简单的域行为
   public void updateAlarmSeverity(Severity newSeverity) {
     this.severity = newSeverity;
   }
   ```

## 字段类型映射

### 基础类型

| Java 类型 | 数据库类型 | 注解 |
|----------|----------|------|
| String | VARCHAR | `@Column(name = "...")` |
| Long | BIGINT | `@Column(name = "...")` |
| Integer | INTEGER | `@Column(name = "...")` |
| Boolean | BOOLEAN | `@Column(name = "...")` |
| Instant | TIMESTAMP | `@Column(name = "...")` |
| LocalDateTime | TIMESTAMP | `@Column(name = "...")` |

### 特殊类型

| Java 类型 | 数据库类型 | 注解 |
|----------|----------|------|
| Enum | VARCHAR | `@Enumerated(EnumType.STRING)` |
| Map<String, Object> | JSONB | `@JdbcTypeCode(SqlTypes.JSON)` |
| List<String> | JSONB | `@JdbcTypeCode(SqlTypes.JSON)` |

## 关联关系

### 多对一 (ManyToOne)

```java
/*
 * 父菜单引用
 */
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "parent_id", insertable = false, updatable = false)
@Ignore
public Menu parent;
```

### 一对多 (OneToMany)

```java
/*
 * 子菜单列表
 */
@OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
@Ignore
public List<Menu> children = new ArrayList<>();
```

### 多对多 (ManyToMany)

```java
/*
 * 用户角色（多对多关联）
 */
@ManyToMany(fetch = FetchType.LAZY)
@JoinTable(
    name = "user_roles",
    joinColumns = @JoinColumn(name = "user_id"),
    inverseJoinColumns = @JoinColumn(name = "role_id"))
@Ignore
public Set<Role> roles = new HashSet<>();
```

## 枚举定义

```java
public enum MenuType {
  FOLDER,
  MENU
}

@Enumerated(EnumType.STRING)
@Column(name = "menu_type", nullable = false)
public MenuType menuType = MenuType.MENU;
```

## Repository 查询方法

### @Find 注解

```java
public interface Repo extends PanacheRepository<User> {
  // 精确查询
  @Find
  Optional<User> findByUsername(String username);
  
  @Find
  Optional<User> findByEmail(String email);
  
  // 列表查询
  @Find
  List<User> findByStatus(String status);
  
  // Stream 查询
  @Find
  Stream<Alarm> findBySourceId(String sourceId);
}
```

### 自定义查询方法

```java
public interface Repo extends PanacheRepository<User> {
  // 分页查询
  default List<User> listByTenant(Long tenantId, int page, int size) {
    return find("tenant", tenantId).page(page, size).list();
  }
  
  // 复杂查询
  default List<User> findByFilters(
      Long tenantId,
      String username,
      String email,
      String status,
      String sortBy,
      String sortOrder,
      int page,
      int size) {
    StringBuilder query = new StringBuilder("tenant = :tenantId");
    Map<String, Object> params = new HashMap<>();
    params.put("tenantId", tenantId);
    
    if (username != null && !username.isBlank()) {
      query.append(" and lower(username) like lower(:username)");
      params.put("username", "%" + username + "%");
    }
    
    return find(query.toString(), params)
        .order(sortBy, Sort.Direction.valueOf(sortOrder))
        .page(page, size)
        .list();
  }
}
```

## 完整示例：告警实体

```java
package pro.walkin.ams.persistence.entity.running;

import io.quarkus.hibernate.panache.PanacheRepository;
import io.quarkus.panache.common.Parameters;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.processing.Find;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.persistence.entity.BaseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/**
 * 告警实体
 *
 * <p>对应数据库表: alarms
 */
@Entity
@Table(name = "alarms")
public class Alarm extends BaseEntity {

  @Column(name = "created_at")
  @CreationTimestamp
  public LocalDateTime createdAt;

  @Column(name = "updated_at")
  @UpdateTimestamp
  public LocalDateTime updatedAt;

  /*
   * 告警标题
   */
  @Column(name = "title")
  public String title;

  /*
   * 严重程度
   */
  @Enumerated(EnumType.STRING)
  @Column(name = "severity")
  public Constants.Alarm.Severity severity;

  /*
   * 状态
   */
  @Enumerated(EnumType.STRING)
  @Column(name = "status")
  public Constants.Alarm.Status status;

  /*
   * 原始告警元数据 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "metadata")
  public Map<String, Object> metadata;

  /**
   * 更新告警严重程度
   */
  public void updateAlarmSeverity(Constants.Alarm.Severity newSeverity) {
    this.severity = newSeverity;
  }

  public interface Repo extends PanacheRepository<Alarm> {
    @Find
    Stream<Alarm> findBySourceId(String sourceId);

    default List<Alarm> fetchPendingAlarms(int offset, int limit) {
      List<Constants.Alarm.Status> statuses = List.of(
          Constants.Alarm.Status.NEW,
          Constants.Alarm.Status.ACKNOWLEDGED,
          Constants.Alarm.Status.IN_PROGRESS
      );
      
      return find("status in (:statuses)", Parameters.with("statuses", statuses).map())
          .stream()
          .sorted((a1, a2) -> {
            LocalDateTime t1 = a1.occurredAt != null ? a1.occurredAt : LocalDateTime.MIN;
            LocalDateTime t2 = a2.occurredAt != null ? a2.occurredAt : LocalDateTime.MIN;
            return t1.compareTo(t2);
          })
          .skip(offset)
          .limit(limit)
          .toList();
    }
  }
}
```

## 数据库迁移

所有实体对应的表结构必须通过 Liquibase 管理：

```yaml
# src/main/resources/db/changelog/changes/001_create_users_table.yaml
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
                    unique: true
              - column:
                  name: created_at
                  type: TIMESTAMP
              - column:
                  name: updated_at
                  type: TIMESTAMP
```
