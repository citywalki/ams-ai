# lib-persistence 数据持久层

**Generated:** 2026-02-24 11:36
**Commit:** (当前Git提交)

## OVERVIEW

lib-persistence 提供 Hibernate 实体层实现，采用 Quarkus Panache Next Repository 模式，支持多租户数据访问和数据库迁移管理。

## WHERE TO LOOK

- `entity/` - Hibernate 实体定义：继承 BaseEntity，内嵌 Repository 接口
- `entity/system/` - 系统管理实体：用户、角色、权限、菜单
- `entity/modeling/` - 业务建模实体：告警、标签映射等
- `db/changelog/` - Liquibase 数据库迁移脚本

## STRUCTURE

```
lib-persistence/
├── src/main/java/pro/walkin/ams/persistence/entity/
│   ├── BaseEntity.java              # 基础实体类
│   ├── system/                      # 系统管理实体
│   │   ├── User.java                # 用户实体
│   │   ├── Role.java                # 角色实体
│   │   ├── Permission.java          # 权限实体
│   │   ├── Menu.java                # 菜单实体
│   │   ├── UserRole.java            # 用户角色关联
│   │   ├── RolePermission.java      # 角色权限关联
│   │   └── UserPermission.java      # 用户权限关联
│   └── modeling/                    # 业务建模实体
│       ├── Alarm.java               # 告警实体
│       ├── LabelMapping.java        # 标签映射
│       └── SampleEntity.java        # 示例实体
├── src/main/resources/db/changelog/tables/
│   ├── 01_tenant_table.yaml         # 租户表
│   ├── 02_system_tables.yaml        # 系统表
│   ├── 03_modeling_tables.yaml      # 建模表
│   └── 24_default_menus.yaml        # 默认菜单数据
└── build/generated/                 # Hibernate 生成代码
```

## CONVENTIONS

- **实体类**: 继承 `BaseEntity`，字段 `public`，内嵌 `Repo extends PanacheRepository<Entity>`
- **Repository**: 使用 `Entity_.managedBlocking()` 或 `Entity_.managed()` 访问
- **多租户**: 核心表包含 `tenant_id`，使用手动租户过滤
- **时间戳**: `created_at`, `updated_at` 使用 `@CreationTimestamp`, `@UpdateTimestamp`
- **JSON字段**: `Map<String, Object>` 配合 `@JdbcTypeCode(SqlTypes.JSON)`

## 实体规范示例

```java

@Entity
@Table(name = "alarms")
public class Alarm extends BaseEntity {
    @Column(name = "title")
    public String title;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    public Map<String, Object> metadata;

    public interface Repo extends PanacheRepository<Alarm> {
        @Find
        Stream<Alarm> findBySourceId(String sourceId);

        default List<Alarm> findByTenant(Long tenantId) {
            return find("tenant", tenantId).list();
        }
    }
}
```

## 多租户数据访问模式

系统采用手动租户过滤方式，在每个查询方法中明确指定租户条件：

```java
// 正确的租户过滤方式
public List<Role> findAllByTenant(Long tenantId) {
    if (tenantId == null) {
        return List.of();
    }
    return Role_.managedBlocking().find("tenant", tenantId).list();
}

// 错误：缺少租户过滤
// PanacheBlockingQuery<Role> query = Role_.managedBlocking().findAll();
```

## Repository 调用模式

```java
// 阻塞式调用（推荐）
List<Alarm> alarms = Alarm_.managedBlocking()
                .find("tenant = ?1 AND status = ?2", tenantId, "ACTIVE")
                .list();

// 响应式调用
Uni<List<Alarm>> alarms = Alarm_.managed()
        .find("tenant = ?1", tenantId)
        .list();
```

## Liquibase 数据库迁移

- **表结构**: 使用 YAML 格式定义表结构
- **默认数据**: 通过 `24_default_menus.yaml` 提供初始化数据
- **迁移命令**:
  ```bash
  ./gradlew liquibaseUpdate        # 执行迁移
  ./gradlew liquibaseRollback      # 回滚迁移
  ./gradlew liquibaseDiffChangeLog  # 生成差异脚本
  ```

## 数据库配置支持

- **PostgreSQL**: 主要生产环境，支持 JSON 字段和复杂查询
- **Oracle**: 企业级数据库，支持分页和事务处理
- **H2**: 测试环境，快速开发和验证

## 生成代码说明

- Hibernate 使用 Panache Next 自动生成查询方法
- `Entity_` 类提供类型安全的查询构建器
- `*_` 后缀的类是 Hibernate 生成的元数据类

## 测试规范

- **集成测试**: 使用 `@QuarkusTest` 和 Testcontainers
- **实体测试**: 验证字段映射、关系和约束
- **Repository测试**: 测试查询方法和事务行为
- **迁移测试**: 验证 Liquibase 脚本正确性

## 性能考虑

- **连接池**: Quarkus 自动配置 HikariCP
- **二级缓存**: 支持 Hazelcast 分布式缓存
- **查询优化**: 使用 Panache Criteria API 避免N+1问题
- **索引**: 在 Liquibase 中为常用查询字段创建索引