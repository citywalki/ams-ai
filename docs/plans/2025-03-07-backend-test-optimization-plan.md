# 后端测试代码优化实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 19 个测试类按照新的分层架构进行重构，消除硬编码、测试依赖，统一断言风格

**Architecture:** 
- lib-* 模块: 纯 JUnit 单元测试
- feature-* 模块: Mockito 单元测试 + @QuarkusComponentTest 组件测试
- app-boot 模块: @QuarkusTest 集成测试

**Tech Stack:** Quarkus 3.31.2, JUnit 5, AssertJ, Mockito, RestAssured

---

## Phase 1: 创建测试基础设施

### Task 1.1: 创建测试常量类

**Files:**
- Create: `app-boot/src/test/java/pro/walkin/ams/boot/support/TestConstants.java`

**Step 1: 编写常量类**

```java
package pro.walkin.ams.boot.support;

public final class TestConstants {
  private TestConstants() {}

  // 默认测试租户
  public static final Long DEFAULT_TENANT_ID = 1L;
  public static final String DEFAULT_TENANT_CODE = "default";

  // 测试用户
  public static final String TEST_USERNAME = "test_user";
  public static final String TEST_PASSWORD = "test_password";
  public static final String TEST_EMAIL = "test@example.com";

  // 管理员用户
  public static final String ADMIN_USERNAME = "admin";
  public static final String ADMIN_PASSWORD = "admin123";

  // JWT 测试配置
  public static final String JWT_SIGN_KEY_LOCATION = "privateKey.jwk";
}
```

**Step 2: 提交**

```bash
git add app-boot/src/test/java/pro/walkin/ams/boot/support/TestConstants.java
git commit -m "feat(test): add TestConstants for centralized test configuration"
```

---

### Task 1.2: 创建测试数据构造器

**Files:**
- Create: `app-boot/src/test/java/pro/walkin/ams/boot/support/TestDataBuilder.java`

**Step 1: 编写 Builder 类**

```java
package pro.walkin.ams.boot.support;

import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;

import java.util.Set;
import java.util.UUID;

public class TestDataBuilder {

  private TestDataBuilder() {}

  public static UserBuilder user() {
    return new UserBuilder();
  }

  public static RoleBuilder role() {
    return new RoleBuilder();
  }

  public static PermissionBuilder permission() {
    return new PermissionBuilder();
  }

  public static String uniqueCode(String prefix) {
    return prefix + "_" + UUID.randomUUID().toString().substring(0, 8);
  }

  public static class UserBuilder {
    private Long id = System.currentTimeMillis();
    private String username = TestConstants.TEST_USERNAME;
    private String email = TestConstants.TEST_EMAIL;
    private String passwordHash = "hashed_password";
    private Long tenant = TestConstants.DEFAULT_TENANT_ID;
    private Set<Role> roles = Set.of();

    public UserBuilder withId(Long id) {
      this.id = id;
      return this;
    }

    public UserBuilder withUsername(String username) {
      this.username = username;
      return this;
    }

    public UserBuilder withEmail(String email) {
      this.email = email;
      return this;
    }

    public UserBuilder withTenant(Long tenant) {
      this.tenant = tenant;
      return this;
    }

    public UserBuilder withRoles(Set<Role> roles) {
      this.roles = roles;
      return this;
    }

    public User build() {
      User user = new User();
      user.id = id;
      user.username = username;
      user.email = email;
      user.passwordHash = passwordHash;
      user.tenant = tenant;
      user.roles = roles;
      return user;
    }
  }

  public static class RoleBuilder {
    private Long id = System.currentTimeMillis();
    private String code = "TEST_ROLE";
    private String name = "Test Role";
    private Long tenant = TestConstants.DEFAULT_TENANT_ID;
    private Set<Permission> permissions = Set.of();

    public RoleBuilder withId(Long id) {
      this.id = id;
      return this;
    }

    public RoleBuilder withCode(String code) {
      this.code = code;
      return this;
    }

    public RoleBuilder withName(String name) {
      this.name = name;
      return this;
    }

    public RoleBuilder withTenant(Long tenant) {
      this.tenant = tenant;
      return this;
    }

    public RoleBuilder withPermissions(Set<Permission> permissions) {
      this.permissions = permissions;
      return this;
    }

    public Role build() {
      Role role = new Role();
      role.id = id;
      role.code = code;
      role.name = name;
      role.tenant = tenant;
      role.permissions = permissions;
      return role;
    }
  }

  public static class PermissionBuilder {
    private Long id = System.currentTimeMillis();
    private String code = "test:permission";
    private String name = "Test Permission";
    private String resourceType = "TEST";

    public PermissionBuilder withId(Long id) {
      this.id = id;
      return this;
    }

    public PermissionBuilder withCode(String code) {
      this.code = code;
      return this;
    }

    public PermissionBuilder withName(String name) {
      this.name = name;
      return this;
    }

    public Permission build() {
      Permission permission = new Permission();
      permission.id = id;
      permission.code = code;
      permission.name = name;
      permission.resourceType = resourceType;
      return permission;
    }
  }
}
```

**Step 2: 提交**

```bash
git add app-boot/src/test/java/pro/walkin/ams/boot/support/TestDataBuilder.java
git commit -m "feat(test): add TestDataBuilder for fluent test data creation"
```

---

### Task 1.3: 更新 E2ETestBase 使用真实认证

**Files:**
- Modify: `app-boot/src/test/java/pro/walkin/ams/boot/support/E2ETestBase.java`

**Step 1: 重构 E2ETestBase**

```java
package pro.walkin.ams.boot.support;

import io.quarkus.test.common.http.TestHTTPResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;

import java.net.URI;

import static io.restassured.RestAssured.given;

@QuarkusTest
public abstract class E2ETestBase {

  @TestHTTPResource("/api")
  protected URI baseUri;

  @Inject protected EntityManager entityManager;

  protected Long testTenantId;
  protected String authToken;

  @BeforeEach
  @Transactional
  protected void baseSetUp() {
    testTenantId = TestConstants.DEFAULT_TENANT_ID;
    authToken = authenticateAsAdmin();
  }

  private String authenticateAsAdmin() {
    return given()
        .contentType("application/json")
        .body("{\"username\": \"" + TestConstants.ADMIN_USERNAME + "\", \"password\": \"" + TestConstants.ADMIN_PASSWORD + "\"}")
        .when()
        .post("/api/auth/login")
        .then()
        .statusCode(200)
        .extract()
        .path("accessToken");
  }

  @Transactional
  protected void cleanTestData(String tableName, Long tenantId) {
    entityManager
        .createNativeQuery("DELETE FROM " + tableName + " WHERE tenant_id = ?1")
        .setParameter(1, tenantId)
        .executeUpdate();
  }

  protected String getAuthHeader() {
    return "Bearer " + authToken;
  }
}
```

**Step 2: 运行测试验证**

```bash
./gradlew :app-boot:test --tests "pro.walkin.ams.boot.TenantRoleFilterTest"
```

Expected: 测试通过

**Step 3: 提交**

```bash
git add app-boot/src/test/java/pro/walkin/ams/boot/support/E2ETestBase.java
git commit -m "feat(test): refactor E2ETestBase to use real authentication flow"
```

---

## Phase 2: 优化 feature-admin 单元测试

### Task 2.1: 优化 TokenServiceTest

**Files:**
- Modify: `feature-admin/src/test/java/pro/walkin/ams/admin/auth/service/TokenServiceTest.java`

**Step 1: 重构测试类**

```java
package pro.walkin.ams.admin.auth.service;

import io.quarkus.test.component.QuarkusComponentTest;
import io.quarkus.test.component.TestConfigProperty;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;

import java.util.Set;

import static org.assertj.core.api.Assertions.*;

@QuarkusComponentTest
@TestConfigProperty(key = "smallrye.jwt.sign.key.location", value = "privateKey.jwk")
@DisplayName("TokenService Tests")
class TokenServiceTest {

  @Inject TokenService tokenService;

  private User testUser;

  @BeforeEach
  void setUp() {
    testUser = createTestUser();
  }

  private User createTestUser() {
    User user = new User();
    user.id = 1L;
    user.username = "testuser";
    user.tenant = 100L;

    Role role = new Role();
    role.code = "USER";
    role.tenant = 100L;

    Permission permission = new Permission();
    permission.code = "view:dashboard";
    role.permissions = Set.of(permission);

    user.roles = Set.of(role);
    return user;
  }

  @Nested
  @DisplayName("generateAccessToken")
  class GenerateAccessToken {

    @Test
    @DisplayName("should generate valid JWT token with 3 parts")
    void shouldGenerateValidToken() {
      String token = tokenService.generateAccessToken(testUser);

      assertThat(token)
          .isNotNull()
          .isNotEmpty();
      assertThat(token.split("\\."))
          .hasSize(3);
    }

    @ParameterizedTest
    @CsvSource({"user1, 100", "admin, 200", "test, 300"})
    @DisplayName("should generate token for different users")
    void shouldGenerateTokenForDifferentUsers(String username, Long tenantId) {
      User user = new User();
      user.id = System.currentTimeMillis();
      user.username = username;
      user.tenant = tenantId;
      user.roles = Set.of();

      String token = tokenService.generateAccessToken(user);

      assertThat(token).isNotNull();
      assertThat(token.split("\\.")).hasSize(3);
    }
  }

  @Nested
  @DisplayName("generateRefreshToken")
  class GenerateRefreshToken {

    @Test
    @DisplayName("should generate valid refresh token with 3 parts")
    void shouldGenerateValidRefreshToken() {
      String refreshToken = tokenService.generateRefreshToken(testUser);

      assertThat(refreshToken)
          .isNotNull()
          .isNotEmpty();
      assertThat(refreshToken.split("\\."))
          .hasSize(3);
    }
  }

  @Nested
  @DisplayName("Service Injection")
  class Injection {

    @Test
    @DisplayName("should be injectable")
    void shouldBeInjectable() {
      assertThat(tokenService).isNotNull();
    }
  }
}
```

**Step 2: 运行测试**

```bash
./gradlew :feature-admin:test --tests "pro.walkin.ams.admin.auth.service.TokenServiceTest"
```

Expected: 所有测试通过

**Step 3: 提交**

```bash
git add feature-admin/src/test/java/pro/walkin/ams/admin/auth/service/TokenServiceTest.java
git commit -m "refactor(test): optimize TokenServiceTest with parameterized tests"
```

---

### Task 2.2: 优化 RbacServiceTest

**Files:**
- Modify: `feature-admin/src/test/java/pro/walkin/ams/admin/system/service/RbacServiceTest.java`

**Step 1: 重构测试类**

```java
package pro.walkin.ams.admin.system.service;

import io.quarkus.test.component.QuarkusComponentTest;
import io.quarkus.test.component.TestConfigProperty;
import jakarta.inject.Inject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import pro.walkin.ams.common.security.TenantContext;

import static org.assertj.core.api.Assertions.*;

@QuarkusComponentTest
@TestConfigProperty(key = "smallrye.jwt.sign.key.location", value = "privateKey.jwk")
@DisplayName("RbacService Tests")
class RbacServiceTest {

  @Inject RbacService rbacService;

  @Nested
  @DisplayName("Service Injection")
  class Injection {

    @Test
    @DisplayName("should be injectable")
    void shouldBeInjectable() {
      assertThat(rbacService).isNotNull();
    }
  }

  @Nested
  @DisplayName("hasPermission")
  class HasPermission {

    @Test
    @DisplayName("should return false when no tenant context")
    void shouldReturnFalseWhenNoTenantContext() {
      // Ensure no tenant context is set
      TenantContext.clear();

      boolean result = rbacService.hasPermission(1L, "view:dashboard");

      assertThat(result).isFalse();
    }

    @Test
    @DisplayName("should return false for non-existent permission")
    void shouldReturnFalseForNonExistentPermission() {
      TenantContext.setCurrentTenant(1L);

      try {
        boolean result = rbacService.hasPermission(999L, "non:existent");
        assertThat(result).isFalse();
      } finally {
        TenantContext.clear();
      }
    }
  }

  @Nested
  @DisplayName("hasRole")
  class HasRole {

    @Test
    @DisplayName("should return false when no tenant context")
    void shouldReturnFalseWhenNoTenantContext() {
      TenantContext.clear();

      boolean result = rbacService.hasRole(1L, "USER");

      assertThat(result).isFalse();
    }

    @Test
    @DisplayName("should return false for non-existent role")
    void shouldReturnFalseForNonExistentRole() {
      TenantContext.setCurrentTenant(1L);

      try {
        boolean result = rbacService.hasRole(999L, "NON_EXISTENT");
        assertThat(result).isFalse();
      } finally {
        TenantContext.clear();
      }
    }
  }
}
```

**Step 2: 运行测试**

```bash
./gradlew :feature-admin:test --tests "pro.walkin.ams.admin.system.service.RbacServiceTest"
```

Expected: 所有测试通过

**Step 3: 提交**

```bash
git add feature-admin/src/test/java/pro/walkin/ams/admin/system/service/RbacServiceTest.java
git commit -m "refactor(test): optimize RbacServiceTest with better tenant context handling"
```

---

### Task 2.3: 优化 MenuServiceTest 使用参数化测试

**Files:**
- Modify: `feature-admin/src/test/java/pro/walkin/ams/admin/system/service/MenuServiceTest.java`

**Step 1: 重构测试类**

```java
package pro.walkin.ams.admin.system.service;

import io.quarkus.test.component.QuarkusComponentTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import pro.walkin.ams.common.dto.MenuDto;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

@QuarkusComponentTest
@DisplayName("MenuService Tests")
class MenuServiceTest {

  @Inject MenuService menuService;

  @Nested
  @DisplayName("Service Injection")
  class Injection {

    @Test
    @DisplayName("should be injectable")
    void shouldBeInjectable() {
      assertThat(menuService).isNotNull();
    }
  }

  @Nested
  @DisplayName("createMenu Validation")
  class CreateMenuValidation {

    @ParameterizedTest(name = "should throw NullPointerException when {0} is null")
    @CsvSource({
        "dto, true, 1",
        "tenantId, false, null"
    })
    void shouldThrowWhenParameterIsNull(String paramName, String dtoNotNull, String tenantIdStr) {
      MenuDto dto = "true".equals(dtoNotNull) 
          ? new MenuDto("test-key", "Test Menu", "/test", null, null, 1, true, "MENU", List.of(), Map.of())
          : null;
      Long tenantId = "null".equals(tenantIdStr) ? null : Long.parseLong(tenantIdStr);

      assertThatThrownBy(() -> menuService.createMenu(dto, tenantId))
          .isInstanceOf(NullPointerException.class)
          .satisfies(ex -> {
            if (dto == null) {
              assertThat(ex.getMessage()).contains("菜单数据不能为空");
            } else {
              assertThat(ex.getMessage()).contains("租户ID不能为空");
            }
          });
    }
  }

  @Nested
  @DisplayName("getMenuById Validation")
  class GetMenuByIdValidation {

    @ParameterizedTest(name = "should throw NullPointerException when {0} is null")
    @CsvSource({
        "id, null, 1",
        "tenantId, 1, null"
    })
    void shouldThrowWhenParameterIsNull(String paramName, String idStr, String tenantIdStr) {
      Long id = "null".equals(idStr) ? null : Long.parseLong(idStr);
      Long tenantId = "null".equals(tenantIdStr) ? null : Long.parseLong(tenantIdStr);

      assertThatThrownBy(() -> menuService.getMenuById(id, tenantId))
          .isInstanceOf(NullPointerException.class)
          .satisfies(ex -> {
            if (id == null) {
              assertThat(ex.getMessage()).contains("菜单ID不能为空");
            } else {
              assertThat(ex.getMessage()).contains("租户ID不能为空");
            }
          });
    }
  }

  @Nested
  @DisplayName("deleteMenu Validation")
  class DeleteMenuValidation {

    @ParameterizedTest(name = "should throw NullPointerException when {0} is null")
    @CsvSource({
        "id, null, 1",
        "tenantId, 1, null"
    })
    void shouldThrowWhenParameterIsNull(String paramName, String idStr, String tenantIdStr) {
      Long id = "null".equals(idStr) ? null : Long.parseLong(idStr);
      Long tenantId = "null".equals(tenantIdStr) ? null : Long.parseLong(tenantIdStr);

      assertThatThrownBy(() -> menuService.deleteMenu(id, tenantId))
          .isInstanceOf(NullPointerException.class)
          .satisfies(ex -> {
            if (id == null) {
              assertThat(ex.getMessage()).contains("菜单ID不能为空");
            } else {
              assertThat(ex.getMessage()).contains("租户ID不能为空");
            }
          });
    }
  }
}
```

**Step 2: 运行测试**

```bash
./gradlew :feature-admin:test --tests "pro.walkin.ams.admin.system.service.MenuServiceTest"
```

Expected: 所有测试通过

**Step 3: 提交**

```bash
git add feature-admin/src/test/java/pro/walkin/ams/admin/system/service/MenuServiceTest.java
git commit -m "refactor(test): optimize MenuServiceTest with parameterized tests"
```

---

## Phase 3: 重构 app-boot 集成测试

### Task 3.1: 重构 UserController 集成测试

**Files:**
- Create: `app-boot/src/test/java/pro/walkin/ams/boot/integration/UserControllerIntegrationTest.java`
- Delete: `app-boot/src/test/java/pro/walkin/ams/boot/it/system/UserControllerE2EIT.java`

**Step 1: 创建新的集成测试类**

```java
package pro.walkin.ams.boot.integration;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import pro.walkin.ams.boot.client.AuthApiClient;
import pro.walkin.ams.boot.client.GraphQLClient;
import pro.walkin.ams.boot.client.UserApiClient;
import pro.walkin.ams.boot.support.TestConstants;
import pro.walkin.ams.boot.support.TestDataBuilder;

import java.util.Map;

import static org.assertj.core.api.Assertions.*;

@QuarkusTest
@DisplayName("用户管理集成测试")
class UserControllerIntegrationTest {

  @Inject @RestClient AuthApiClient authApi;

  @Inject @RestClient UserApiClient userApi;

  @Inject @RestClient GraphQLClient graphQLClient;

  private String authToken;

  @BeforeEach
  void setUp() {
    var loginResponse = authApi.login(
        Map.of("username", TestConstants.ADMIN_USERNAME, "password", TestConstants.ADMIN_PASSWORD));
    @SuppressWarnings("unchecked")
    Map<String, Object> body = loginResponse.readEntity(Map.class);
    authToken = "Bearer " + body.get("accessToken");
  }

  @Test
  @DisplayName("USER-INT-01: 创建用户并查询成功")
  void shouldCreateUserAndRetrieveSuccessfully() {
    // Given
    String uniqueCode = TestDataBuilder.uniqueCode("USER");
    Map<String, Object> userData = Map.of(
        "username", uniqueCode,
        "email", uniqueCode + "@test.com",
        "password", "password123",
        "status", "ACTIVE");

    // When - Create user
    var createResponse = userApi.createUser(authToken, String.valueOf(TestConstants.DEFAULT_TENANT_ID), userData);

    // Then - Verify creation
    assertThat(createResponse.getStatus()).isEqualTo(201);
    @SuppressWarnings("unchecked")
    Map<String, Object> createdUser = createResponse.readEntity(Map.class);
    assertThat(createdUser).containsKeys("id", "username", "email");
    assertThat(createdUser.get("username")).isEqualTo(uniqueCode);
  }

  @Test
  @DisplayName("USER-INT-02: 创建重复用户应失败")
  void shouldFailToCreateDuplicateUser() {
    // Given - Create first user
    String username = TestDataBuilder.uniqueCode("USER");
    Map<String, Object> userData = Map.of(
        "username", username,
        "email", username + "@test.com",
        "password", "password123",
        "status", "ACTIVE");

    var firstResponse = userApi.createUser(authToken, String.valueOf(TestConstants.DEFAULT_TENANT_ID), userData);
    assertThat(firstResponse.getStatus()).isEqualTo(201);

    // When/Then - Try to create duplicate
    assertThatThrownBy(() -> userApi.createUser(authToken, String.valueOf(TestConstants.DEFAULT_TENANT_ID), userData))
        .isInstanceOf(jakarta.ws.rs.WebApplicationException.class)
        .satisfies(ex -> {
          jakarta.ws.rs.WebApplicationException wae = (jakarta.ws.rs.WebApplicationException) ex;
          assertThat(wae.getResponse().getStatus()).isEqualTo(400);
        });
  }
}
```

**Step 2: 运行测试**

```bash
./gradlew :app-boot:test --tests "pro.walkin.ams.boot.integration.UserControllerIntegrationTest"
```

Expected: 所有测试通过

**Step 3: 删除旧文件并提交**

```bash
rm app-boot/src/test/java/pro/walkin/ams/boot/it/system/UserControllerE2EIT.java
git add app-boot/src/test/java/pro/walkin/ams/boot/integration/
git add app-boot/src/test/java/pro/walkin/ams/boot/it/system/UserControllerE2EIT.java
git commit -m "refactor(test): migrate UserControllerE2EIT to UserControllerIntegrationTest

- Remove @Order dependencies
- Use TestConstants and TestDataBuilder
- Simplify test flow"
```

---

## Phase 4: 清理和验证

### Task 4.1: 运行所有测试验证

**Step 1: 运行全量测试**

```bash
./gradlew clean test
```

Expected: 所有测试通过

**Step 2: 代码格式化**

```bash
./gradlew spotlessApply
```

**Step 3: 静态分析**

```bash
./gradlew spotbugsMain spotbugsTest
```

Expected: 无新增警告

**Step 4: 提交**

```bash
git add -A
git commit -m "chore(test): complete test optimization phase 4

- All tests passing
- Code formatted
- Static analysis clean"
```

---

## 验证清单

- [ ] TestConstants 类已创建
- [ ] TestDataBuilder 类已创建
- [ ] E2ETestBase 使用真实认证
- [ ] TokenServiceTest 使用参数化测试
- [ ] RbacServiceTest 优化完成
- [ ] MenuServiceTest 使用参数化测试
- [ ] UserControllerE2EIT 已迁移并移除 @Order
- [ ] 所有测试独立运行通过
- [ ] `./gradlew clean test` 全量通过
- [ ] `./gradlew spotlessCheck` 通过
- [ ] 无新增的 SpotBugs 警告

## 注意事项

1. **依赖注入**：使用 `@QuarkusComponentTest` 的测试需要确保依赖已正确注入
2. **租户上下文**：涉及多租户的测试需要正确设置和清理 TenantContext
3. **数据库状态**：集成测试使用真实数据库，确保每个测试后清理数据
4. **JWT 密钥**：Token 相关测试需要 `privateKey.jwk` 文件存在
