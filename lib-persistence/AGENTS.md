# lib-persistence 数据持久层

**模块特定约束**

## 实体规范

- 所有实体必须继承 `BaseEntity`（已包含 tenant 字段）
- 实体字段使用 `public`（不使用 Lombok）
- Repository 内嵌在实体中: `public interface Repo extends PanacheRepository<Entity>`

### 实体示例

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
    }
}
```

## Repository 访问模式

```java
// 阻塞式调用
List<Alarm> alarms = Alarm_.managedBlocking()
    .find("tenant = ?1 AND status = ?2", tenantId, "ACTIVE")
    .list();

// 响应式调用
Uni<List<Alarm>> alarms = Alarm_.managed()
    .find("tenant = ?1", tenantId)
    .list();
```

## Liquibase 数据库迁移

- 入口: `lib-persistence/src/main/resources/db/changelog/db.changelog-master.yaml`
- 格式: YAML
- 变更文件放在 `db/changelog/tables/`

### 命令

```bash
./gradlew liquibaseUpdate        # 执行迁移
./gradlew liquibaseRollback      # 回滚迁移
./gradlew liquibaseDiffChangeLog # 生成差异脚本
```

## 禁止

- ❌ 禁止使用 Lombok
- ❌ 禁止裸 `EntityManager` / 直连 SQL
