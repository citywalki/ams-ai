# AMS 测试指南

## 测试架构

本项目采用三层测试架构：

1. **单元测试** - 快速、隔离的组件测试
2. **E2E 测试** - 完整链路集成测试
3. **契约测试** - API 兼容性验证

## 快速开始

### 运行单元测试

```bash
./gradlew test
```

### 运行 E2E 测试

```bash
# 后端 E2E（需要 Docker）
./gradlew :app-boot:test -PrunIntegrationTests

# 前端 E2E
cd app-web && pnpm e2e
```

### 运行契约测试

```bash
# 后端 Provider 验证
./gradlew :app-boot:test --tests "*PactProviderTest"

# 前端 Consumer 生成契约
cd app-web && pnpm e2e
```

## 目录结构

```
feature-*/src/test/
├── java/pro/walkin/ams/.../
│   ├── handler/           # Command Handler 测试
│   │   ├── CreateXxxHandlerTest.java
│   │   ├── UpdateXxxHandlerTest.java
│   │   └── DeleteXxxHandlerTest.java
│   ├── query/             # Query 测试
│   │   ├── XxxQueryTest.java
│   │   └── YyyQueryTest.java
│   └── ...

app-boot/src/test/
├── it/                    # E2E 测试
│   ├── auth/
│   ├── system/
│   └── graphql/
└── pacts/                 # 契约验证

app-web/e2e/
├── specs/                 # Playwright 测试
├── pages/                 # Page Objects
└── pacts/                 # 契约文件
```

## CQRS 测试模式

本项目采用 CQRS 架构，测试分为 **Command 测试** 和 **Query 测试** 两类。

### Command Handler 测试

Command Handler 负责写操作，使用 `@QuarkusComponentTest` 进行单元测试。

```java
@QuarkusComponentTest
class CreateRoleHandlerTest {

  @Inject CreateRoleHandler createRoleHandler;

  @InjectMock Role.Repo roleRepo;

  @Nested
  @DisplayName("handle")
  class Handle {

    @Test
    @DisplayName("should create role successfully when code is unique")
    void shouldCreateRoleSuccessfully() {
      CreateRoleCommand cmd =
          new CreateRoleCommand("OPERATOR", "Operator Role", "description", 100L);

      when(roleRepo.findByCode("OPERATOR")).thenReturn(Optional.empty());

      Role result = createRoleHandler.handle(cmd);

      assertThat(result).isNotNull();
      assertThat(result.code).isEqualTo("OPERATOR");
      verify(roleRepo).persist(result);
    }

    @Test
    @DisplayName("should fail when duplicate code exists")
    void shouldFailWhenDuplicateCodeExists() {
      CreateRoleCommand cmd =
          new CreateRoleCommand("ADMIN", "Admin Role", "description", 100L);

      Role existingRole = new Role();
      existingRole.code = "ADMIN";

      when(roleRepo.findByCode("ADMIN")).thenReturn(Optional.of(existingRole));

      assertThatThrownBy(() -> createRoleHandler.handle(cmd))
          .isInstanceOf(BusinessException.class)
          .hasMessageContaining("Role code already exists");

      verify(roleRepo, never()).persist(any(Role.class));
    }
  }
}
```

#### Command 测试要点

1. **使用 `@QuarkusComponentTest`** - 启用 Quarkus 组件测试
2. **Mock Repository** - 使用 `@InjectMock` 模拟数据访问层
3. **验证业务规则** - 测试正常流程和异常场景
4. **验证无副用** - 失败时确保没有持久化操作
5. **多租户测试** - 验证跨租户数据隔离

### Query 测试

Query 类负责读操作，同样使用 `@QuarkusComponentTest` 测试。

```java
@QuarkusComponentTest
class RoleQueryTest {

  @Inject RoleQuery roleQuery;

  @InjectMock Role.Repo roleRepo;

  @BeforeEach
  void setUp() {
    TenantContext.clear();
  }

  @AfterEach
  void tearDown() {
    TenantContext.clear();
  }

  @Nested
  @DisplayName("findByCode")
  class FindByCode {

    @Test
    @DisplayName("should return role when code exists")
    void shouldReturnRoleWhenCodeExists() {
      String code = "ADMIN";
      Role role = new Role();
      role.id = 1L;
      role.code = code;

      when(roleRepo.find("code", code).firstResultOptional())
          .thenReturn(Optional.of(role));

      Optional<Role> result = roleQuery.findByCode(code);

      assertThat(result).isPresent();
      assertThat(result.get().code).isEqualTo(code);
    }
  }

  @Nested
  @DisplayName("listByTenant")
  class ListByTenant {

    @Test
    @DisplayName("should return list of roles for tenant")
    void shouldReturnListOfRolesForTenant() {
      Long tenantId = 100L;

      when(roleRepo.find("tenant", tenantId).page(0, 10).list())
          .thenReturn(List.of(role1, role2));

      List<Role> result = roleQuery.listByTenant(tenantId, 0, 10);

      assertThat(result).hasSize(2);
    }
  }
}
```

#### Query 测试要点

1. **租户上下文清理** - 使用 `@BeforeEach` 和 `@AfterEach` 清理 `TenantContext`
2. **测试各种查询场景** - 按 ID、按 code、列表查询、分页、计数
3. **验证空结果处理** - 无数据时的行为
4. **Mock Panache 方法** - `find()`, `findByIdOptional()`, `count()` 等

### E2E 测试

#### REST E2E 测试

```java
@QuarkusTest
class MyApiE2EIT extends E2ETestBase {
    @Inject @RestClient MyApiClient client;

    @Test
    void shouldDoSomething() {
        var response = client.doSomething();
        assertThat(response.getStatus()).isEqualTo(200);
    }
}
```

#### GraphQL E2E 测试

```java
@QuarkusTest
class MyGraphQLApiE2EIT extends GraphQLTestBase {
    @Test
    void shouldQuerySomething() {
        String query = "query { something { id } }";
        var response = graphQLClient.executeQuery(authToken, createQuery(query, null));
        assertThat(response.getStatus()).isEqualTo(200);
    }
}
```

### 前端 E2E 测试

```typescript
test('should do something', async ({ page }) => {
    const myPage = new MyPage(page);
    await myPage.goto();
    await myPage.doSomething();
    await expect(page).toHaveURL(/.*success.*/);
});
```

## 测试命名规范

| 类型 | 命名模式 | 示例 |
|------|----------|------|
| Command Handler 测试 | `{Action}{Entity}HandlerTest` | `CreateRoleHandlerTest` |
| Query 测试 | `{Entity}QueryTest` | `RoleQueryTest`, `UserQueryTest` |
| E2E 测试 | `{Feature}E2EIT` | `AuthE2EIT` |

## 最佳实践

1. **测试独立性** - 每个测试独立设置数据，不依赖其他测试
2. **使用 Nested 类** - 按方法分组测试，提高可读性
3. **描述性命名** - 测试方法名清晰描述测试场景
4. **清理数据** - 测试后清理测试数据，特别是 TenantContext
5. **明确断言** - 使用具体值而非模糊匹配
6. **契约优先** - API 变更前更新契约
7. **Mock 外部依赖** - 单元测试中 Mock Repository，不访问真实数据库

## 常用测试工具

- **JUnit 5** - 测试框架
- **AssertJ** - 流式断言
- **Mockito** - Mock 框架
- **QuarkusComponentTest** - Quarkus 组件测试
- **@QuarkusTest** - Quarkus 集成测试
- **@InjectMock** - 自动 Mock 注入
