# 测试模式 (Testing Pattern)

## 概述

AMS-AI 使用 JUnit 5 + Testcontainers + AssertJ 进行测试，所有测试必须验证租户隔离和权限控制。

## 测试框架

- **JUnit 5**: 5.10.2
- **Testcontainers**: 2.0.3（数据库测试）
- **AssertJ**: 3.25.3（流式断言）
- **Mockito**: Mock 框架
- **Quarkus Test**: @QuarkusTest

## 测试结构

### 测试类命名

```
{被测类名}Test
```

示例：
- `UserService` → `UserServiceTest`
- `AlarmService` → `AlarmServiceTest`
- `MenuResource` → `MenuResourceTest`

### 测试方法命名

```java
// 方式 1：test{场景}_{预期}
@Test
void testCreateUser_Success() { }

@Test
void testCreateUser_DuplicateUsername_ThrowsException() { }

// 方式 2：should{行为}When{条件}
@Test
void shouldThrowExceptionWhenUsernameExists() { }

@Test
void shouldReturnUserWhenIdExists() { }
```

## 单元测试

### Service 层测试

```java
package pro.walkin.ams.admin.system.service;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pro.walkin.ams.common.dto.MenuDto;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.Menu;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

@QuarkusTest
class MenuServiceTest {
    
    @Inject
    MenuService menuService;
    
    @InjectMock
    RbacService rbacService;
    
    private static final Long TENANT_ID = 1L;
    
    @BeforeEach
    void setUp() {
        // 清理测试数据
        Menu_.managed().deleteAll();
    }
    
    @Test
    void testCreateMenu_Success() {
        // Given
        MenuDto dto = new MenuDto(
            "user-management",
            "用户管理",
            "/users",
            null,
            "UserOutlined",
            1,
            true
        );
        
        // When
        var response = menuService.createMenu(dto, TENANT_ID);
        
        // Then
        assertThat(response).isNotNull();
        assertThat(response.id()).isNotNull();
        assertThat(response.key()).isEqualTo("user-management");
        assertThat(response.label()).isEqualTo("用户管理");
        assertThat(response.tenant()).isEqualTo(TENANT_ID);
    }
    
    @Test
    void testCreateMenu_DuplicateKey_ThrowsValidationException() {
        // Given
        MenuDto dto1 = new MenuDto("users", "用户", "/users", null, null, 1, true);
        menuService.createMenu(dto1, TENANT_ID);
        
        MenuDto dto2 = new MenuDto("users", "用户管理", "/users", null, null, 2, true);
        
        // When & Then
        assertThatThrownBy(() -> menuService.createMenu(dto2, TENANT_ID))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("菜单标识符已存在");
    }
    
    @Test
    void testCreateMenu_NullDto_ThrowsNullPointerException() {
        // When & Then
        assertThatThrownBy(() -> menuService.createMenu(null, TENANT_ID))
            .isInstanceOf(NullPointerException.class)
            .hasMessageContaining("菜单数据不能为空");
    }
    
    @Test
    void testUpdateMenu_Success() {
        // Given
        MenuDto createDto = new MenuDto("users", "用户", "/users", null, null, 1, true);
        var created = menuService.createMenu(createDto, TENANT_ID);
        
        MenuDto updateDto = new MenuDto(
            "users",
            "用户管理（已更新）",
            "/users-management",
            null,
            "UserSwitchOutlined",
            2,
            true
        );
        
        // When
        var updated = menuService.updateMenu(created.id(), updateDto, TENANT_ID);
        
        // Then
        assertThat(updated.label()).isEqualTo("用户管理（已更新）");
        assertThat(updated.route()).isEqualTo("/users-management");
        assertThat(updated.sortOrder()).isEqualTo(2);
    }
    
    @Test
    void testDeleteMenu_Success() {
        // Given
        MenuDto dto = new MenuDto("users", "用户", "/users", null, null, 1, true);
        var created = menuService.createMenu(dto, TENANT_ID);
        
        // When
        menuService.deleteMenu(created.id(), TENANT_ID);
        
        // Then
        Menu deleted = Menu_.managed().findById(created.id());
        assertThat(deleted).isNull();
    }
    
    @Test
    void testDeleteMenu_HasChildren_ThrowsValidationException() {
        // Given
        MenuDto parentDto = new MenuDto("system", "系统", null, null, null, 1, true);
        var parent = menuService.createMenu(parentDto, TENANT_ID);
        
        MenuDto childDto = new MenuDto("users", "用户", "/users", parent.id(), null, 1, true);
        menuService.createMenu(childDto, TENANT_ID);
        
        // When & Then
        assertThatThrownBy(() -> menuService.deleteMenu(parent.id(), TENANT_ID))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("请先删除子菜单");
    }
}
```

### Repository 层测试

```java
package pro.walkin.ams.persistence.entity;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pro.walkin.ams.persistence.entity.system.User;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@QuarkusTest
class UserRepositoryTest {
    
    @BeforeEach
    @Transactional
    void setUp() {
        User_.managed().deleteAll();
        
        // 创建测试数据
        createUser("user1", "user1@example.com", 1L);
        createUser("user2", "user2@example.com", 1L);
        createUser("user3", "user3@example.com", 2L);
    }
    
    @Test
    @Transactional
    void testFindByUsername() {
        // When
        Optional<User> user = User_.managed().findByUsername("user1");
        
        // Then
        assertThat(user).isPresent();
        assertThat(user.get().username).isEqualTo("user1");
        assertThat(user.get().email).isEqualTo("user1@example.com");
    }
    
    @Test
    @Transactional
    void testFindByUsername_NotFound() {
        // When
        Optional<User> user = User_.managed().findByUsername("nonexistent");
        
        // Then
        assertThat(user).isEmpty();
    }
    
    @Test
    @Transactional
    void testListByTenant() {
        // When
        List<User> tenant1Users = User_.managed().listByTenant(1L, 0, 10);
        List<User> tenant2Users = User_.managed().listByTenant(2L, 0, 10);
        
        // Then
        assertThat(tenant1Users).hasSize(2);
        assertThat(tenant2Users).hasSize(1);
    }
    
    private void createUser(String username, String email, Long tenantId) {
        User user = new User();
        user.username = username;
        user.email = email;
        user.passwordHash = "hashed";
        user.tenant = tenantId;
        user.status = "ACTIVE";
        user.persist();
    }
}
```

## 集成测试

### REST API 测试

```java
package pro.walkin.ams.admin.system;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class MenuResourceTest {
    
    @Test
    @TestSecurity(user = "admin", roles = {"ADMIN"})
    void testListMenus() {
        given()
            .contentType(ContentType.JSON)
            .header("X-Tenant-Id", "1")
        .when()
            .get("/api/menus")
        .then()
            .statusCode(200)
            .body("size()", greaterThan(0));
    }
    
    @Test
    @TestSecurity(user = "admin", roles = {"ADMIN"})
    void testCreateMenu() {
        String menuJson = """
            {
                "key": "test-menu",
                "label": "测试菜单",
                "route": "/test",
                "icon": "TestOutlined",
                "sortOrder": 1,
                "isVisible": true
            }
            """;
        
        given()
            .contentType(ContentType.JSON)
            .header("X-Tenant-Id", "1")
            .body(menuJson)
        .when()
            .post("/api/menus")
        .then()
            .statusCode(201)
            .body("key", equalTo("test-menu"))
            .body("label", equalTo("测试菜单"));
    }
    
    @Test
    void testCreateMenu_Unauthorized() {
        String menuJson = "{}";
        
        given()
            .contentType(ContentType.JSON)
            .body(menuJson)
        .when()
            .post("/api/menus")
        .then()
            .statusCode(401);
    }
    
    @Test
    @TestSecurity(user = "user", roles = {"USER"})
    void testCreateMenu_Forbidden() {
        String menuJson = "{}";
        
        given()
            .contentType(ContentType.JSON)
            .header("X-Tenant-Id", "1")
            .body(menuJson)
        .when()
            .post("/api/menus")
        .then()
            .statusCode(403);
    }
}
```

## 租户隔离测试

```java
package pro.walkin.ams.admin.system;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pro.walkin.ams.common.dto.MenuDto;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.Menu;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

@QuarkusTest
class TenantIsolationTest {
    
    @Inject
    MenuService menuService;
    
    @BeforeEach
    @Transactional
    void setUp() {
        Menu_.managed().deleteAll();
    }
    
    @Test
    @Transactional
    void testTenantIsolation_List() {
        // Given: 创建不同租户的数据
        createMenu("menu1", 1L);
        createMenu("menu2", 1L);
        createMenu("menu3", 2L);
        
        // When: 查询租户1的菜单
        List<Menu> tenant1Menus = Menu_.managed()
            .find("tenant", 1L)
            .list();
        
        // Then: 只返回租户1的菜单
        assertThat(tenant1Menus).hasSize(2);
        assertThat(tenant1Menus).allMatch(menu -> menu.tenant.equals(1L));
    }
    
    @Test
    @Transactional
    void testTenantIsolation_Update() {
        // Given: 创建租户1的菜单
        Long menuId = createMenu("menu1", 1L);
        
        // When & Then: 租户2尝试更新租户1的菜单
        MenuDto updateDto = new MenuDto("menu1", "更新", null, null, null, 1, true);
        
        assertThatThrownBy(() -> menuService.updateMenu(menuId, updateDto, 2L))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("不属于当前租户");
    }
    
    @Test
    @Transactional
    void testTenantIsolation_Delete() {
        // Given: 创建租户1的菜单
        Long menuId = createMenu("menu1", 1L);
        
        // When & Then: 租户2尝试删除租户1的菜单
        assertThatThrownBy(() -> menuService.deleteMenu(menuId, 2L))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("不属于当前租户");
    }
    
    private Long createMenu(String key, Long tenantId) {
        MenuDto dto = new MenuDto(key, "菜单", "/" + key, null, null, 1, true);
        var response = menuService.createMenu(dto, tenantId);
        return response.id();
    }
}
```

## Testcontainers 配置

```java
package pro.walkin.ams;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@QuarkusTest
@Testcontainers
@QuarkusTestResource(PostgresTestResource.class)
class ApplicationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("ams_test")
        .withUsername("test")
        .withPassword("test");
    
    @Test
    void testDatabaseConnection() {
        // 测试数据库连接
        assertThat(postgres.isRunning()).isTrue();
    }
}
```

### PostgresTestResource

```java
package pro.walkin.ams;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Map;

public class PostgresTestResource implements QuarkusTestResourceLifecycleManager {
    
    private static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("ams_test")
        .withUsername("test")
        .withPassword("test");
    
    @Override
    public Map<String, String> start() {
        postgres.start();
        
        return Map.of(
            "quarkus.datasource.jdbc.url", postgres.getJdbcUrl(),
            "quarkus.datasource.username", postgres.getUsername(),
            "quarkus.datasource.password", postgres.getPassword(),
            "quarkus.datasource.driver", postgres.getDriverClassName()
        );
    }
    
    @Override
    public void stop() {
        postgres.stop();
    }
}
```

## AssertJ 最佳实践

```java
import static org.assertj.core.api.Assertions.*;

// 对象断言
assertThat(user).isNotNull();
assertThat(user.getUsername()).isEqualTo("admin");

// 集合断言
assertThat(users).hasSize(2);
assertThat(users).extracting("username").containsExactly("user1", "user2");
assertThat(users).allMatch(u -> u.getStatus().equals("ACTIVE"));

// Optional 断言
assertThat(optionalUser).isPresent();
assertThat(optionalUser).contains(user);

// 异常断言
assertThatThrownBy(() -> service.createUser(null))
    .isInstanceOf(NullPointerException.class)
    .hasMessageContaining("不能为空");

// 字符串断言
assertThat(username).startsWith("admin");
assertThat(username).endsWith("123");
assertThat(username).containsIgnoringCase("MIN");

// 数字断言
assertThat(count).isGreaterThan(0);
assertThat(count).isBetween(1, 100);

// Map 断言
assertThan(map).containsKey("key");
assertThan(map).containsEntry("key", "value");
```

## 测试数据构建

### Builder 模式

```java
public class UserTestDataBuilder {
    
    private String username = "testuser";
    private String email = "test@example.com";
    private String passwordHash = "hashed";
    private Long tenant = 1L;
    private String status = "ACTIVE";
    
    public static UserTestDataBuilder aUser() {
        return new UserTestDataBuilder();
    }
    
    public UserTestDataBuilder withUsername(String username) {
        this.username = username;
        return this;
    }
    
    public UserTestDataBuilder withEmail(String email) {
        this.email = email;
        return this;
    }
    
    public UserTestDataBuilder withTenant(Long tenant) {
        this.tenant = tenant;
        return this;
    }
    
    public User build() {
        User user = new User();
        user.username = username;
        user.email = email;
        user.passwordHash = passwordHash;
        user.tenant = tenant;
        user.status = status;
        return user;
    }
}

// 使用
User user = UserTestDataBuilder.aUser()
    .withUsername("admin")
    .withTenant(1L)
    .build();
```

## 最佳实践

### ✅ 必须遵守

1. **所有测试必须使用 Testcontainers**
2. **所有测试必须验证租户隔离**
3. **所有测试必须清理数据**
4. **使用 AssertJ 流式断言**
5. **测试方法命名清晰**
6. **测试覆盖正常和异常场景**
7. **集成测试验证 API 契约**

### ❌ 禁止做法

1. **使用生产数据库测试**
2. **测试不清理数据**
3. **测试硬编码依赖**
4. **跳过权限测试**
5. **跳过租户隔离测试**
6. **测试没有断言**
7. **测试依赖执行顺序**
