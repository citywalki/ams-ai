# AMS-AI Code Style Guide

> 代码风格和最佳实践指南

## Quick Reference

| 项目 | 规范 |
|------|------|
| **语言** | Java 21 (Backend), TypeScript 5 (Frontend) |
| **编码** | UTF-8 |
| **缩进** | 2 空格（无 Tab） |
| **行宽** | 120 字符 |
| **格式化** | google-java-format (Backend), Prettier (Frontend) |
| **包名** | `pro.walkin.ams.{module}.{layer}` |

---

## Backend (Java)

### File Organization

**包结构**：
```
pro.walkin.ams.{module}.{layer}
├── entity/          # 实体类
├── repository/      # Repository 接口（内嵌在 Entity 中）
├── service/         # 业务逻辑
├── controller/      # REST 控制器
├── config/          # 配置类
└── dto/             # 数据传输对象
```

**导入顺序**：
```java
// 1. Java 标准库
import java.util.List;
import java.util.Optional;

// 2. 第三方库
import jakarta.inject.Inject;
import jakarta.persistence.Entity;
import org.hibernate.annotations.Filter;

// 3. 项目内部
import pro.walkin.ams.persistence.entity.BaseEntity;
import pro.walkin.ams.common.exception.BusinessException;
```

### Naming Conventions

**类名**：`PascalCase`
```java
public class UserService { }
public class AlarmController { }
public interface UserGraphQLApi { }
```

**方法名**：`camelCase`
```java
public User findById(Long id) { }
public List<User> findAllUsers() { }
public void updateStatus(Long id, String status) { }
```

**变量名**：`camelCase`
```java
User user = ...;
List<Alarm> alarms = ...;
String tenantId = ...;
```

**常量名**：`UPPER_SNAKE_CASE`
```java
public static final String DEFAULT_STATUS = "ACTIVE";
public static final int MAX_RETRY_COUNT = 3;
```

**数据库字段名**：`snake_case`
```sql
tenant_id, created_at, updated_at, password_hash
```

### Entity 规范 (Panache Next)

**基础实体**：
```java
@Entity
@Table(name = "users")
@FilterDef(name = "tenant-filter", parameters = @ParamDef(name = "tenant", type = Long.class))
@Filter(name = "tenant-filter")
public class User extends BaseEntity {
    
    // public 字段（Panache 规范）
    @Column(name = "username", nullable = false, length = 64)
    public String username;
    
    @Column(name = "email")
    public String email;
    
    @Column(name = "password_hash", nullable = false)
    public String passwordHash;
    
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    public UserStatus status = UserStatus.ACTIVE;
    
    // JSON 字段
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "preferences", columnDefinition = "jsonb")
    public Map<String, Object> preferences;
    
    // 多对多关系
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    public Set<Role> roles = new HashSet<>();
    
    // 内嵌 Repository 接口
    public interface Repo extends PanacheRepository<User> {
        @Find
        Optional<User> findByUsername(String username);
        
        @Find
        Optional<User> findByEmail(String email);
        
        @Find
        Stream<User> findByTenant(Long tenant);
    }
}
```

**BaseEntity 模式**：
```java
@MappedSuperclass
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

**Repository 访问**：
```java
// 阻塞式访问
User user = User.Repo.managedBlocking().findByUsername("admin").orElseThrow();

// 响应式访问
Uni<User> userUni = User.Repo.managed().findByUsername("admin");
```

### Service 规范

**业务服务**：
```java
@ApplicationScoped
@Transactional
public class UserService {
    
    @Inject User.Repo userRepo;
    @Inject Role.Repo roleRepo;
    
    public User create(UserDto dto) {
        // 验证
        validateUserDto(dto);
        
        // 创建实体
        User user = new User();
        user.username = dto.getUsername();
        user.email = dto.getEmail();
        user.tenant = TenantContext.getCurrentTenantId();
        
        // 持久化
        userRepo.persist(user);
        
        return user;
    }
    
    public User update(Long id, UserUpdateDto dto) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("User not found"));
        
        user.email = dto.getEmail();
        return user;
    }
    
    private void validateUserDto(UserDto dto) {
        if (dto.getUsername() == null || dto.getUsername().isBlank()) {
            throw new ValidationException("Username is required");
        }
    }
}
```

### Controller 规范

**REST 控制器**：
```java
@Path("/api/system/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserController {
    
    @Inject UserService userService;
    
    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id) {
        User user = userService.findById(id);
        return Response.ok(user).build();
    }
    
    @POST
    @RequireRole("ADMIN")
    public Response create(@Valid UserDto request) {
        User user = userService.create(request);
        return Response.status(Response.Status.CREATED).entity(user).build();
    }
    
    @PUT
    @Path("/{id}")
    @RequireRole("ADMIN")
    public Response update(@PathParam("id") Long id, @Valid UserUpdateDto request) {
        User user = userService.update(id, request);
        return Response.ok(user).build();
    }
    
    @DELETE
    @Path("/{id}")
    @RequireRole("ADMIN")
    public Response delete(@PathParam("id") Long id) {
        userService.delete(id);
        return Response.noContent().build();
    }
}
```

### GraphQL API 规范

**GraphQL 查询**：
```java
@GraphQLApi
public class UserGraphQLApi {
    
    @Inject Session session;
    
    @Query("users")
    @Description("查询用户列表，支持动态过滤")
    @Transactional
    public UserConnection users(
        @Name("where") UserFilterInput where,
        @Name("orderBy") List<OrderByInput> orderBy,
        @DefaultValue("0") @Name("page") int page,
        @DefaultValue("20") @Name("size") int size) {
        
        CriteriaBuilder builder = session.getCriteriaBuilder();
        
        // 查询数据
        CriteriaQuery<User> query = UserCriteriaTranslator.translate(builder, where, orderBy);
        List<User> users = session.createQuery(query)
            .setFirstResult(page * size)
            .setMaxResults(size)
            .getResultList();
        
        // 查询总数
        CriteriaQuery<Long> countQuery = UserCriteriaTranslator.translateCount(builder, where);
        long total = session.createQuery(countQuery).getSingleResult();
        
        return new UserConnection(users, total, page, size);
    }
    
    // 批量加载关联数据（解决 N+1 问题）
    @Transactional
    public List<Set<Role>> roles(@Source List<User> users) {
        if (users.isEmpty()) {
            return List.of();
        }
        
        List<Long> userIds = users.stream().map(u -> u.id).toList();
        Map<Long, Set<Role>> rolesByUser = loadRolesByUserIds(userIds);
        
        return users.stream()
            .map(u -> rolesByUser.getOrDefault(u.id, Set.of()))
            .toList();
    }
}
```

### Exception Handling

**自定义异常**：
```java
// 基础异常
public abstract class BaseException extends RuntimeException {
    private final String code;
    
    public BaseException(String code, String message) {
        super(message);
        this.code = code;
    }
}

// 业务异常
public class BusinessException extends BaseException {
    public BusinessException(String message) {
        super("BUSINESS_ERROR", message);
    }
}

// 验证异常
public class ValidationException extends BaseException {
    public ValidationException(String message) {
        super("VALIDATION_ERROR", message);
    }
}

// 未找到异常
public class NotFoundException extends BaseException {
    public NotFoundException(String message) {
        super("NOT_FOUND", message);
    }
}
```

**全局异常处理**：
```java
@Provider
public class GlobalExceptionMapper implements ExceptionMapper<BaseException> {
    
    @Override
    public Response toResponse(BaseException exception) {
        return Response.status(getHttpStatus(exception))
            .entity(Map.of(
                "code", exception.getCode(),
                "message", exception.getMessage()
            ))
            .build();
    }
}
```

### Testing 规范

**单元测试**：
```java
@QuarkusComponentTest
class UserServiceTest {
    
    @Inject UserService userService;
    
    @InjectMock User.Repo userRepo;
    
    @BeforeEach
    void setUp() {
        TenantContext.setCurrentTenantId(100L);
    }
    
    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }
    
    @Test
    @DisplayName("should create user successfully")
    void shouldCreateUserSuccessfully() {
        // Given
        UserDto dto = new UserDto("testuser", "test@example.com");
        when(userRepo.findByUsername("testuser")).thenReturn(Optional.empty());
        
        // When
        User result = userService.create(dto);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.username).isEqualTo("testuser");
        verify(userRepo).persist(any(User.class));
    }
    
    @Test
    @DisplayName("should throw exception when username exists")
    void shouldThrowExceptionWhenUsernameExists() {
        // Given
        UserDto dto = new UserDto("existing", "test@example.com");
        User existing = new User();
        existing.username = "existing";
        when(userRepo.findByUsername("existing")).thenReturn(Optional.of(existing));
        
        // When & Then
        assertThatThrownBy(() -> userService.create(dto))
            .isInstanceOf(BusinessException.class)
            .hasMessage("Username already exists");
    }
}
```

**测试命名**：
- 测试类：`{被测类}Test` → `UserServiceTest`
- 测试方法：`should{行为}When{条件}` 或 `test{场景}_{预期}`

### Logging 规范

**日志级别**：
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class AlarmService {
    
    private static final Logger log = LoggerFactory.getLogger(AlarmService.class);
    
    public void processAlarm(Alarm alarm) {
        log.debug("Processing alarm: {}", alarm.id);
        
        try {
            // 业务逻辑
            log.info("Alarm processed successfully: {}", alarm.id);
        } catch (Exception e) {
            log.error("Failed to process alarm: {}", alarm.id, e);
            throw e;
        }
    }
}
```

### Annotation Usage

**常用注解**：
```java
// Quarkus
@ApplicationScoped    // 应用级单例
@RequestScoped        // 请求级作用域
@Inject              // 依赖注入
@Transactional       // 事务管理

// JAX-RS
@Path                // 路径
@GET @POST @PUT @DELETE  // HTTP 方法
@Produces @Consumes  // 媒体类型
@PathParam @QueryParam @HeaderParam  // 参数绑定

// Bean Validation
@NotNull @NotEmpty @NotBlank  // 非空验证
@Size @Min @Max              // 大小验证
@Email @Pattern              // 格式验证
@Valid                       // 嵌套验证

// Persistence
@Entity @Table       // 实体映射
@Column @Enumerated  // 字段映射
@ManyToMany @OneToMany  // 关系映射

// Security
@RequireRole         // 角色验证
@RequirePermission   // 权限验证
```

---

## Frontend (TypeScript/React)

### File Organization

**目录结构**：
```
app-web/src/
├── components/      # 通用组件
│   ├── antd/        # Ant Design 封装
│   ├── common/      # 业务通用组件
│   └── layout/      # 布局组件
├── features/        # 功能模块
├── pages/           # 页面组件
├── stores/          # Zustand 状态
├── services/        # API 服务
├── lib/             # 工具库
├── hooks/           # 自定义 Hooks
├── i18n/            # 国际化
└── types/           # TypeScript 类型
```

**路径别名**：
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// 使用
import { Button } from '@/components/antd';
import { useAuthStore } from '@/stores/authStore';
```

### Naming Conventions

**文件名**：`PascalCase.tsx` (组件), `camelCase.ts` (工具)
```
Button.tsx
UserList.tsx
useUsers.ts
apiClient.ts
```

**组件名**：`PascalCase`
```typescript
export function UserList() { }
export const UserCard: React.FC = () => { };
```

**Hook 名**：`use` 前缀
```typescript
export function useUsers() { }
export function useAlarms() { }
```

**变量名**：`camelCase`
```typescript
const userList = ...;
const isLoading = ...;
```

**常量名**：`UPPER_SNAKE_CASE`
```typescript
const API_BASE_URL = 'http://localhost:8080';
const MAX_RETRY_COUNT = 3;
```

### Component 规范

**函数组件**：
```typescript
import React from 'react';
import { Button, Table } from 'antd';
import { useUsers } from '@/hooks/useUsers';
import type { User } from '@/types';

interface UserListProps {
  readonly tenantId?: number;
  readonly onUserSelect?: (user: User) => void;
}

export function UserList({ tenantId, onUserSelect }: UserListProps) {
  const { users, isLoading, error } = useUsers(tenantId);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return (
    <Table 
      dataSource={users}
      columns={[
        { title: 'Username', dataIndex: 'username' },
        { title: 'Email', dataIndex: 'email' },
      ]}
      onRow={(record) => ({
        onClick: () => onUserSelect?.(record),
      })}
    />
  );
}
```

### State Management

**Zustand Store**：
```typescript
import { create } from 'zustand';
import { authApi, type User } from '@/services';

interface AuthState {
  readonly user: User | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
  
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const token = await authApi.login({ username, password });
      localStorage.setItem('access_token', token.accessToken);
      const user = await authApi.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      set({ 
        error: 'Login failed', 
        isLoading: false, 
        user: null, 
        isAuthenticated: false 
      });
      return false;
    }
  },
  
  logout: async () => {
    await authApi.logout();
    localStorage.removeItem('access_token');
    set({ user: null, isAuthenticated: false });
  },
  
  bootstrap: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    
    try {
      const user = await authApi.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('access_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  
  clearError: () => set({ error: null }),
}));
```

### Data Fetching

**React Query Hook**：
```typescript
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphqlClient';

const USERS_QUERY = `
  query Users($page: Int!, $size: Int!) {
    users(page: $page, size: $size) {
      content {
        id
        username
        email
      }
      totalElements
      totalPages
    }
  }
`;

export function useUsers(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['users', page, size],
    queryFn: () => graphqlClient.request(USERS_QUERY, { page, size }),
    staleTime: 5 * 60 * 1000, // 5 分钟
  });
}
```

### GraphQL Client

**配置**：
```typescript
import { GraphQLClient } from 'graphql-request';
import JSONBig from 'json-bigint';

// 配置 json-bigint 解析大整数（Snowflake ID）
const JSONBigString = JSONBig({ storeAsString: true, useNativeBigInt: false });

const getAuthToken = () => localStorage.getItem('access_token');

export const graphqlClient = new GraphQLClient('/graphql', {
  headers: () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  // 自定义 fetch 使用 json-bigint
  fetch: async (input, init) => {
    const response = await fetch(input, init);
    const text = await response.text();
    const data = JSONBigString.parse(text);
    return { ...response, json: () => Promise.resolve(data) };
  },
});
```

### TypeScript 规范

**严格模式**：
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**接口定义**：
```typescript
// 使用 readonly 修饰不可变属性
interface User {
  readonly id: number;
  readonly username: string;
  readonly email: string;
  readonly roles: readonly Role[];
}

// Props 接口
interface UserCardProps {
  readonly user: User;
  readonly onEdit?: (user: User) => void;
  readonly onDelete?: (userId: number) => void;
}
```

**类型导入**：
```typescript
import type { User, Role } from '@/types';  // 类型导入
import { UserService } from '@/services';    // 值导入
```

### Testing 规范

**Playwright E2E**：
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test('should create new user', async ({ page }) => {
    await page.goto('/admin/users');
    
    // 点击创建按钮
    await page.click('button:has-text("Create User")');
    
    // 填写表单
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'test@example.com');
    
    // 提交
    await page.click('button:has-text("Submit")');
    
    // 验证
    await expect(page.locator('.ant-message-success')).toBeVisible();
  });
});
```

---

## Database

### Table Naming

**表名**：`snake_case`，复数形式
```sql
users, roles, permissions, alarms, alert_sources
```

**字段名**：`snake_case`
```sql
tenant_id, created_at, updated_at, password_hash
```

### Liquibase Migration

**迁移文件**：
```yaml
# db/changelog/tables/02_user_table.yaml
databaseChangeLog:
  - changeSet:
      id: create-user-table
      author: developer
      changes:
        - createTable:
            tableName: users
            columns:
              - column:
                  name: id
                  type: bigint
                  constraints:
                    primaryKey: true
                    nullable: false
              - column:
                  name: tenant_id
                  type: bigint
                  constraints:
                    nullable: false
              - column:
                  name: username
                  type: varchar(64)
                  constraints:
                    nullable: false
                    unique: true
```

---

## Git Commit Convention

**提交消息格式**：
```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型**：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链

**示例**：
```
feat(admin): add user management page

- Implement user list with pagination
- Add user create/update forms
- Integrate with GraphQL API

Closes #123
```

---

## Code Quality

### Linting

**后端**：
```bash
./gradlew spotlessCheck   # 检查格式
./gradlew spotlessApply   # 自动格式化
./gradlew spotbugsMain    # SpotBugs 分析
```

**前端**：
```bash
cd app-web
pnpm lint               # ESLint 检查
```

### Code Review Checklist

**后端**：
- [ ] 实体类使用 `public` 字段
- [ ] Repository 内嵌在实体类中
- [ ] Service 方法标记 `@Transactional`
- [ ] 使用 `TenantContext` 获取租户
- [ ] 异常继承 `BaseException`
- [ ] 测试覆盖核心逻辑

**前端**：
- [ ] 组件使用函数式 + Hooks
- [ ] Props 使用 `readonly` 修饰
- [ ] 使用 React Query 管理服务器状态
- [ ] 使用 Zustand 管理客户端状态
- [ ] 路径使用 `@/` 别名
- [ ] TypeScript 严格模式

---

## Anti-Patterns (禁止使用)

### 后端

❌ **禁止**：微服务拆分（保持单体集群）
```java
// ❌ 错误
@MicroService
public class UserService { }
```

❌ **禁止**：直接数据库访问（必须通过 Repository）
```java
// ❌ 错误
String sql = "SELECT * FROM users";
entityManager.createNativeQuery(sql);

// ✅ 正确
User.Repo.managedBlocking().findById(id);
```

❌ **禁止**：跨租户数据访问
```java
// ❌ 错误
List<User> allUsers = User.Repo.managedBlocking().findAll().list();

// ✅ 正确（自动租户过滤）
Long tenantId = TenantContext.getCurrentTenantId();
List<User> tenantUsers = User.Repo.managedBlocking().findByTenant(tenantId).toList();
```

❌ **禁止**：跳过数据库迁移
```java
// ❌ 错误：直接修改数据库
 jdbcTemplate.execute("ALTER TABLE users ADD COLUMN new_field VARCHAR(100)");

// ✅ 正确：使用 Liquibase
// 创建迁移文件 db/changelog/tables/xx_user_add_field.yaml
```

❌ **禁止**：使用 Lombok（与 Panache 不兼容）
```java
// ❌ 错误
@Data
@Entity
public class User extends BaseEntity {
    private String username;
}

// ✅ 正确
@Entity
public class User extends BaseEntity {
    public String username;
}
```

### 前端

❌ **禁止**：类组件（使用函数组件）
```typescript
// ❌ 错误
class UserList extends React.Component { }

// ✅ 正确
function UserList() { }
```

❌ **禁止**：直接修改状态（使用 setState 或 Zustand）
```typescript
// ❌ 错误
user.name = 'new name';

// ✅ 正确
setUser({ ...user, name: 'new name' });
```

❌ **禁止**：硬编码 API URL
```typescript
// ❌ 错误
fetch('http://localhost:8080/api/users');

// ✅ 正确（使用代理或环境变量）
fetch('/api/users');
```

---

## Do's and Don'ts

### ✅ Do's

**后端**：
- ✅ 使用 Panache Next Repository 模式
- ✅ 实体类继承 `BaseEntity`
- ✅ 字段使用 `public` 修饰
- ✅ 内嵌 Repository 接口
- ✅ 使用 `@Transactional` 管理事务
- ✅ 使用 `TenantContext` 获取租户
- ✅ 自定义异常继承 `BaseException`
- ✅ 使用 Liquibase 管理数据库迁移

**前端**：
- ✅ 使用函数组件 + Hooks
- ✅ 使用 React Query 管理服务器状态
- ✅ 使用 Zustand 管理客户端状态
- ✅ 使用 `@/` 路径别名
- ✅ Props 使用 `readonly` 修饰
- ✅ 使用 TypeScript 严格模式
- ✅ 使用 GraphQL 查询，REST 命令

### ❌ Don'ts

**后端**：
- ❌ 使用 Lombok
- ❌ 直接数据库访问
- ❌ 跨租户数据访问
- ❌ 跳过数据库迁移
- ❌ 微服务拆分

**前端**：
- ❌ 使用类组件
- ❌ 直接修改状态
- ❌ 硬编码 API URL
- ❌ 使用 `any` 类型
- ❌ 忽略 ESLint 警告

---

*Last Updated: 2026-03-01*
