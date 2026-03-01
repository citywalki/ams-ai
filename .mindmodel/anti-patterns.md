# 反模式（必须避免）

## 架构反模式

### ❌ 1. 微服务拆分

```java
// ❌ 错误：拆分成微服务
// ams-user-service/
// ams-alarm-service/
// ams-notification-service/

// ✅ 正确：保持单体集群架构
// ams-ai/
//   ├── feature-admin/
//   ├── feature-core/
//   ├── feature-notification/
//   └── app-boot/  (单一部署单元)
```

**原因**：
- 晶圆厂告警系统要求低延迟
- 单体架构简化部署和运维
- 避免分布式系统复杂性

### ❌ 2. 直接数据库访问

```java
// ❌ 错误：直接使用 EntityManager
@ApplicationScoped
public class UserService {
    @Inject
    EntityManager em;
    
    public User getUser(Long id) {
        return em.createQuery("SELECT u FROM User u WHERE u.id = :id", User.class)
                 .setParameter("id", id)
                 .getSingleResult();
    }
}

// ✅ 正确：通过 Repository 访问
@ApplicationScoped
public class UserService {
    public User getUser(Long id) {
        return User_.managed().findById(id);
    }
}
```

**原因**：
- Repository 提供类型安全
- 简化测试
- 统一数据访问模式

### ❌ 3. 绕过数据库迁移

```java
// ❌ 错误：手动执行 DDL
@Transactional
public void createTable() {
    em.createNativeQuery("CREATE TABLE temp_data (...)").executeUpdate();
}

// ✅ 正确：使用 Liquibase
// src/main/resources/db/changelog/changes/001_create_temp_table.yaml
databaseChangeLog:
  - changeSet:
      id: 001-create-temp-table
      changes:
        - createTable:
            tableName: temp_data
            columns: [...]
```

**原因**：
- 版本控制
- 可追溯性
- 环境一致性

## 代码反模式

### ❌ 4. 使用 Lombok

```java
// ❌ 错误：使用 Lombok
@Data
@Entity
public class User {
    private String username;
}

// ✅ 正确：Panache public 字段
@Entity
public class User extends BaseEntity {
    public String username;
}
```

**原因**：
- Lombok 与 Panache 不兼容
- Panache 要求 public 字段
- 避免字节码增强冲突

### ❌ 5. 实体使用 private 字段

```java
// ❌ 错误：private 字段 + getter/setter
@Entity
public class User {
    private String username;
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}

// ✅ 正确：public 字段
@Entity
public class User extends BaseEntity {
    public String username;
}
```

**原因**：
- Panache 要求 public 字段直接访问
- 简化代码
- 符合 Panache 约定

### ❌ 6. 实体中写复杂业务逻辑

```java
// ❌ 错误：实体中复杂业务逻辑
@Entity
public class Alarm extends BaseEntity {
    public void processAndNotify() {
        // 大量业务逻辑
        // 调用外部服务
        // 发送通知
        // 更新多个实体
    }
}

// ✅ 正确：实体只包含简单域行为
@Entity
public class Alarm extends BaseEntity {
    public void updateSeverity(Severity newSeverity) {
        this.severity = newSeverity;
    }
}

// 业务逻辑在 Service 层
@ApplicationScoped
public class AlarmService {
    public void processAlarm(Long alarmId) {
        Alarm alarm = Alarm_.managed().findById(alarmId);
        // 复杂业务逻辑
        // 调用其他服务
        // 事务管理
    }
}
```

**原因**：
- 保持实体简单（贫血模型）
- 业务逻辑集中在 Service 层
- 便于测试和维护

### ❌ 7. Service 层绕过事务

```java
// ❌ 错误：没有 @Transactional
@ApplicationScoped
public class UserService {
    public User createUser(UserDto dto) {
        User user = new User();
        user.persist();  // 可能不在事务中
        return user;
    }
}

// ✅ 正确：明确的事务边界
@ApplicationScoped
@Transactional
public class UserService {
    public User createUser(UserDto dto) {
        User user = new User();
        user.persist();
        return user;
    }
}
```

**原因**：
- 确保数据一致性
- 避免部分更新
- 明确的事务边界

## 多租户反模式

### ❌ 8. 跨租户数据访问

```java
// ❌ 错误：没有租户过滤
public List<User> getAllUsers() {
    return User_.managed().listAll();  // 返回所有租户用户
}

// ✅ 正确：租户过滤
public List<User> getTenantUsers(Long tenantId) {
    return User_.managed()
        .find("tenant", tenantId)
        .list();
}
```

**原因**：
- 数据安全
- 租户隔离
- 合规要求

### ❌ 9. 忘记设置 tenant_id

```java
// ❌ 错误：创建实体不设置租户
public User createUser(UserDto dto) {
    User user = new User();
    user.username = dto.username();
    // 忘记设置 user.tenant
    user.persist();  // 插入时 tenant_id 为 NULL
    return user;
}

// ✅ 正确：明确设置租户
public User createUser(UserDto dto, Long tenantId) {
    Objects.requireNonNull(tenantId, "租户ID不能为空");
    
    User user = new User();
    user.username = dto.username();
    user.tenant = tenantId;
    user.persist();
    return user;
}
```

**原因**：
- tenant_id 不允许为 NULL
- 避免数据归属混乱
- 确保租户隔离

### ❌ 10. 全局唯一性约束不考虑租户

```java
// ❌ 错误：全局唯一，但应该在租户内唯一
@Table(name = "users")
@Entity
public class User {
    @Column(name = "username", unique = true)  // 全局唯一
    public String username;
}

// ✅ 正确：租户内唯一
@Table(name = "users", 
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"tenant_id", "username"}))
@Entity
public class User {
    @Column(name = "username")
    public String username;
}
```

**原因**：
- 不同租户可能有相同的 username
- 租户隔离要求
- 业务需求

## 前端反模式

### ❌ 11. 使用 Class 组件

```typescript
// ❌ 错误：Class 组件
class UserList extends React.Component {
  render() {
    return <div>...</div>;
  }
}

// ✅ 正确：函数组件 + Hooks
const UserList: React.FC<UserListProps> = () => {
  return <div>...</div>;
};
```

**原因**：
- React 推荐函数组件
- Hooks 更灵活
- 代码更简洁

### ❌ 12. 使用 any 类型

```typescript
// ❌ 错误：any 类型
const user: any = fetchUser();

// ✅ 正确：明确类型
interface User {
  id: number;
  username: string;
}

const user: User = fetchUser();
```

**原因**：
- 失去类型安全
- 运行时错误
- 难以重构

### ❌ 13. 前端直接操作数据库

```typescript
// ❌ 错误：前端直接查询
const users = await db.query('SELECT * FROM users');

// ✅ 正确：通过 API
const users = await api.get<UserResponse>('/api/users');
```

**原因**：
- 安全风险
- 业务逻辑泄露
- 无法控制权限

## 测试反模式

### ❌ 14. 测试不带租户隔离

```java
// ❌ 错误：测试不验证租户隔离
@Test
void testCreateUser() {
    User user = userService.createUser(dto);
    assertThat(user).isNotNull();
}

// ✅ 正确：验证租户隔离
@Test
void testCreateUserWithTenantIsolation() {
    User user1 = userService.createUser(dto1, tenantId1);
    User user2 = userService.createUser(dto2, tenantId2);
    
    // 验证租户隔离
    List<User> tenant1Users = userService.listUsers(tenantId1, 0, 10);
    assertThat(tenant1Users).containsExactly(user1);
    
    List<User> tenant2Users = userService.listUsers(tenantId2, 0, 10);
    assertThat(tenant2Users).containsExactly(user2);
}
```

**原因**：
- 多租户是核心功能
- 必须验证隔离性
- 避免数据泄露

### ❌ 15. 测试使用生产数据库

```java
// ❌ 错误：使用生产数据库
@Test
void testCreateUser() {
    // 连接生产数据库
    User user = userService.createUser(dto);
}

// ✅ 正确：使用 Testcontainers
@QuarkusTest
@Testcontainers
class UserServiceTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");
    
    @Test
    void testCreateUser() {
        // 使用测试容器
    }
}
```

**原因**：
- 避免污染生产数据
- 可重复性
- 隔离性

## 安全反模式

### ❌ 16. 硬编码密码

```java
// ❌ 错误：硬编码密码
public class DatabaseConfig {
    private String password = "admin123";
}

// ✅ 正确：使用配置文件
// application.yaml
quarkus:
  datasource:
    password: ${DB_PASSWORD}
```

**原因**：
- 安全风险
- 代码泄露
- 无法动态配置

### ❌ 17. 明文存储密码

```java
// ❌ 错误：明文存储
user.password = dto.password();

// ✅ 正确：哈希存储
user.passwordHash = passwordService.hashPassword(dto.password());
```

**原因**：
- 数据泄露风险
- 合规要求
- 用户隐私

### ❌ 18. 跳过权限检查

```java
// ❌ 错误：没有权限检查
@GET
@Path("/users/{id}")
public User getUser(@PathParam("id") Long id) {
    return userService.getUser(id);
}

// ✅ 正确：权限检查
@GET
@Path("/users/{id}")
@RequirePermission("user:read")
public User getUser(@PathParam("id") Long id) {
    Long tenantId = TenantContext.getCurrentTenantId();
    return userService.getUser(id, tenantId);
}
```

**原因**：
- 数据安全
- 权限控制
- 合规要求

## 性能反模式

### ❌ 19. N+1 查询问题

```java
// ❌ 错误：N+1 查询
List<Alarm> alarms = Alarm_.managed().listAll();
alarms.forEach(alarm -> {
    Equipment equipment = Equipment_.managed().findById(alarm.equipmentId);
    // 每个告警都查询一次设备
});

// ✅ 正确：JOIN FETCH
List<Alarm> alarms = Alarm_.managed()
    .find("SELECT a FROM Alarm a JOIN FETCH a.equipment")
    .list();
```

**原因**：
- 性能问题
- 数据库压力
- 响应延迟

### ❌ 20. 不分页的大数据集

```java
// ❌ 错误：加载所有数据
List<Alarm> alarms = Alarm_.managed().listAll();  // 可能数百万条

// ✅ 正确：分页查询
List<Alarm> alarms = Alarm_.managed()
    .find("tenant", tenantId)
    .page(0, 20)
    .list();
```

**原因**：
- 内存溢出
- 响应慢
- 用户体验差

## 总结

### 核心反模式（必须避免）

1. ❌ **微服务拆分** → ✅ 保持单体
2. ❌ **直接数据库访问** → ✅ 通过 Repository
3. ❌ **绕过数据库迁移** → ✅ 使用 Liquibase
4. ❌ **使用 Lombok** → ✅ Panache public 字段
5. ❌ **跨租户数据访问** → ✅ 租户过滤
6. ❌ **忘记设置 tenant_id** → ✅ 明确租户参数
7. ❌ **前端使用 any** → ✅ 明确类型
8. ❌ **硬编码密码** → ✅ 配置文件
9. ❌ **N+1 查询** → ✅ JOIN FETCH
10. ❌ **不分页查询** → ✅ 分页

### 检查清单

在代码审查时，确保：
- [ ] 所有实体继承 BaseEntity
- [ ] 所有 Service 使用 @Transactional
- [ ] 所有查询包含租户过滤
- [ ] 所有表结构通过 Liquibase
- [ ] 没有使用 Lombok
- [ ] 没有硬编码密码
- [ ] 没有跨租户访问
- [ ] 大数据集使用分页
- [ ] TypeScript 使用明确类型
- [ ] 测试验证租户隔离
