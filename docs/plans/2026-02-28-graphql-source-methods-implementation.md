# GraphQL Source Methods 批量加载实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 使用 `@Source` 注解重构所有懒加载字段，实现批量数据加载避免 N+1 问题

**Architecture:** 在 GraphQL API 中为每个懒加载关联字段添加批量 Source Method，使用单次 JOIN 查询替代 N+1 单独查询

**Tech Stack:** SmallRye GraphQL, Quarkus Hibernate Panache, JPA Criteria API

---

## Task 1: User 实体添加 @Ignore 注解

**Files:**
- Modify: `lib-persistence/src/main/java/pro/walkin/ams/persistence/entity/system/User.java:59-64`

**Step 1: 修改 User.java 的 roles 字段**

在 `@ManyToMany` 注解下方添加 `@Ignore` 注解：

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

**Step 2: 验证编译**

Run: `./gradlew :lib-persistence:compileJava`
Expected: BUILD SUCCESSFUL

**Step 3: Commit**

```bash
git add lib-persistence/src/main/java/pro/walkin/ams/persistence/entity/system/User.java
git commit -m "feat(persistence): add @Ignore to User.roles for GraphQL"
```

---

## Task 2: Role 实体添加 @Ignore 注解

**Files:**
- Modify: `lib-persistence/src/main/java/pro/walkin/ams/persistence/entity/system/Role.java:47-53`

**Step 1: 修改 Role.java 的 permissions 字段**

```java
  /*
   * 角色拥有的权限集合
   */
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "role_permissions",
      joinColumns = @JoinColumn(name = "role_id"),
      inverseJoinColumns = @JoinColumn(name = "permission_id"))
  @Ignore
  public Set<Permission> permissions = new HashSet<>();
```

**Step 2: 验证编译**

Run: `./gradlew :lib-persistence:compileJava`
Expected: BUILD SUCCESSFUL

**Step 3: Commit**

```bash
git add lib-persistence/src/main/java/pro/walkin/ams/persistence/entity/system/Role.java
git commit -m "feat(persistence): add @Ignore to Role.permissions for GraphQL"
```

---

## Task 3: Menu 实体添加 @Ignore 注解

**Files:**
- Modify: `lib-persistence/src/main/java/pro/walkin/ams/persistence/entity/system/Menu.java:102-116`

**Step 1: 修改 Menu.java 的三个懒加载字段**

```java
  /*
   * 子菜单列表
   */
  @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  @Ignore
  public List<Menu> children = new ArrayList<>();

  /*
   * 父菜单引用
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parent_id", insertable = false, updatable = false)
  @Ignore
  public Menu parent;

  /*
   * 菜单下的按钮权限列表
   */
  @OneToMany(mappedBy = "menu", fetch = FetchType.LAZY)
  @Ignore
  public List<Permission> buttonPermissions = new ArrayList<>();
```

**Step 2: 验证编译**

Run: `./gradlew :lib-persistence:compileJava`
Expected: BUILD SUCCESSFUL

**Step 3: Commit**

```bash
git add lib-persistence/src/main/java/pro/walkin/ams/persistence/entity/system/Menu.java
git commit -m "feat(persistence): add @Ignore to Menu lazy fields for GraphQL"
```

---

## Task 4: Permission 实体添加 @Ignore 注解

**Files:**
- Modify: `lib-persistence/src/main/java/pro/walkin/ams/persistence/entity/system/Permission.java:47-50`

**Step 1: 修改 Permission.java 的 menu 字段**

```java
  /*
   * 所属菜单（按钮权限挂在菜单下）
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "menu_id")
  @Ignore
  public Menu menu;
```

**Step 2: 验证编译**

Run: `./gradlew :lib-persistence:compileJava`
Expected: BUILD SUCCESSFUL

**Step 3: Commit**

```bash
git add lib-persistence/src/main/java/pro/walkin/ams/persistence/entity/system/Permission.java
git commit -m "feat(persistence): add @Ignore to Permission.menu for GraphQL"
```

---

## Task 5: UserGraphQLApi 添加批量 roles Source Method

**Files:**
- Modify: `feature-graphql/src/main/java/pro/walkin/ams/graphql/entity/user/UserGraphQLApi.java`

**Step 1: 添加必要的 import 和批量加载方法**

完整修改后的文件：

```java
package pro.walkin.ams.graphql.entity.user;

import jakarta.inject.Inject;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.graphql.DefaultValue;
import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Name;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.graphql.Source;
import org.hibernate.Session;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.graphql.connection.UserConnection;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

    CriteriaQuery<User> query = UserCriteriaTranslator.translate(builder, where, orderBy);
    List<User> users =
        session.createQuery(query).setFirstResult(page * size).setMaxResults(size).getResultList();

    CriteriaQuery<Long> countQuery = UserCriteriaTranslator.translateCount(builder, where);
    long total = session.createQuery(countQuery).getSingleResult();

    return new UserConnection(users, total, page, size);
  }

  @Transactional
  public List<Set<Role>> roles(@Source List<User> users) {
    if (users.isEmpty()) {
      return List.of();
    }

    List<Long> userIds = users.stream().map(u -> u.id).toList();
    Map<Long, Set<Role>> rolesByUser = loadRolesByUserIds(userIds);

    return users.stream().map(u -> rolesByUser.getOrDefault(u.id, Set.of())).toList();
  }

  private Map<Long, Set<Role>> loadRolesByUserIds(List<Long> userIds) {
    String jpql = "SELECT u.id, r FROM User u JOIN u.roles r WHERE u.id IN :userIds";

    List<Object[]> results =
        session.createQuery(jpql, Object[].class)
            .setParameter("userIds", userIds)
            .getResultList();

    Map<Long, Set<Role>> map = new HashMap<>();
    for (Object[] row : results) {
      Long userId = (Long) row[0];
      Role role = (Role) row[1];
      map.computeIfAbsent(userId, k -> new HashSet<>()).add(role);
    }

    for (Long userId : userIds) {
      map.putIfAbsent(userId, Set.of());
    }

    return map;
  }
}
```

**Step 2: 验证编译**

Run: `./gradlew :feature-graphql:compileJava`
Expected: BUILD SUCCESSFUL

**Step 3: Commit**

```bash
git add feature-graphql/src/main/java/pro/walkin/ams/graphql/entity/user/UserGraphQLApi.java
git commit -m "feat(graphql): add batch roles Source Method to UserGraphQLApi"
```

---

## Task 6: RoleGraphQLApi 添加批量 permissions Source Method

**Files:**
- Modify: `feature-graphql/src/main/java/pro/walkin/ams/graphql/entity/role/RoleGraphQLApi.java`

**Step 1: 添加必要的 import 和批量加载方法**

完整修改后的文件：

```java
package pro.walkin.ams.graphql.entity.role;

import jakarta.inject.Inject;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.graphql.DefaultValue;
import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Name;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.graphql.Source;
import org.hibernate.Session;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.graphql.connection.RoleConnection;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Role;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@GraphQLApi
public class RoleGraphQLApi {

  @Inject Session session;

  @Query("roles")
  @Description("查询角色列表，支持动态过滤")
  @Transactional
  public RoleConnection roles(
      @Name("where") RoleFilterInput where,
      @Name("orderBy") List<OrderByInput> orderBy,
      @DefaultValue("0") @Name("page") int page,
      @DefaultValue("20") @Name("size") int size) {

    CriteriaBuilder builder = session.getCriteriaBuilder();

    CriteriaQuery<Role> query = RoleCriteriaTranslator.translate(builder, where, orderBy);
    List<Role> roles =
        session.createQuery(query).setFirstResult(page * size).setMaxResults(size).getResultList();

    CriteriaQuery<Long> countQuery = RoleCriteriaTranslator.translateCount(builder, where);
    long total = session.createQuery(countQuery).getSingleResult();

    return new RoleConnection(roles, total, page, size);
  }

  @Transactional
  public List<Set<Permission>> permissions(@Source List<Role> roles) {
    if (roles.isEmpty()) {
      return List.of();
    }

    List<Long> roleIds = roles.stream().map(r -> r.id).toList();
    Map<Long, Set<Permission>> permsByRole = loadPermissionsByRoleIds(roleIds);

    return roles.stream().map(r -> permsByRole.getOrDefault(r.id, Set.of())).toList();
  }

  private Map<Long, Set<Permission>> loadPermissionsByRoleIds(List<Long> roleIds) {
    String jpql = "SELECT r.id, p FROM Role r JOIN r.permissions p WHERE r.id IN :roleIds";

    List<Object[]> results =
        session.createQuery(jpql, Object[].class)
            .setParameter("roleIds", roleIds)
            .getResultList();

    Map<Long, Set<Permission>> map = new HashMap<>();
    for (Object[] row : results) {
      Long roleId = (Long) row[0];
      Permission perm = (Permission) row[1];
      map.computeIfAbsent(roleId, k -> new HashSet<>()).add(perm);
    }

    for (Long roleId : roleIds) {
      map.putIfAbsent(roleId, Set.of());
    }

    return map;
  }
}
```

**Step 2: 验证编译**

Run: `./gradlew :feature-graphql:compileJava`
Expected: BUILD SUCCESSFUL

**Step 3: Commit**

```bash
git add feature-graphql/src/main/java/pro/walkin/ams/graphql/entity/role/RoleGraphQLApi.java
git commit -m "feat(graphql): add batch permissions Source Method to RoleGraphQLApi"
```

---

## Task 7: MenuGraphQLApi 添加三个批量 Source Method

**Files:**
- Modify: `feature-graphql/src/main/java/pro/walkin/ams/graphql/entity/menu/MenuGraphQLApi.java`

**Step 1: 添加 children, parent, buttonPermissions 方法**

完整修改后的文件：

```java
package pro.walkin.ams.graphql.entity.menu;

import jakarta.inject.Inject;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.graphql.DefaultValue;
import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Name;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.graphql.Source;
import org.hibernate.Session;
import pro.walkin.ams.graphql.connection.MenuConnection;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.persistence.entity.system.Menu;
import pro.walkin.ams.persistence.entity.system.Permission;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@GraphQLApi
public class MenuGraphQLApi {

  @Inject Session session;

  @Query("menus")
  @Description("查询菜单列表，支持动态过滤")
  @Transactional
  public MenuConnection menus(
      @Name("where") MenuFilterInput where,
      @Name("orderBy") List<OrderByInput> orderBy,
      @DefaultValue("0") @Name("page") int page,
      @DefaultValue("20") @Name("size") int size) {

    CriteriaBuilder builder = session.getCriteriaBuilder();

    CriteriaQuery<Menu> query = MenuCriteriaTranslator.translate(builder, where, orderBy);
    List<Menu> menus =
        session.createQuery(query).setFirstResult(page * size).setMaxResults(size).getResultList();

    CriteriaQuery<Long> countQuery = MenuCriteriaTranslator.translateCount(builder, where);
    long total = session.createQuery(countQuery).getSingleResult();

    return new MenuConnection(menus, total, page, size);
  }

  @Transactional
  public List<List<Menu>> children(@Source List<Menu> menus) {
    if (menus.isEmpty()) {
      return List.of();
    }

    List<Long> menuIds = menus.stream().map(m -> m.id).toList();
    Map<Long, List<Menu>> childrenByMenu = loadChildrenByParentIds(menuIds);

    return menus.stream().map(m -> childrenByMenu.getOrDefault(m.id, List.of())).toList();
  }

  @Transactional
  public List<Menu> parent(@Source List<Menu> menus) {
    if (menus.isEmpty()) {
      return List.of();
    }

    List<Long> parentIds =
        menus.stream().map(m -> m.parentId).filter(id -> id != null).distinct().toList();

    if (parentIds.isEmpty()) {
      return menus.stream().map(m -> (Menu) null).toList();
    }

    Map<Long, Menu> parentMap = loadMenusByIds(parentIds);

    return menus.stream().map(m -> m.parentId != null ? parentMap.get(m.parentId) : null).toList();
  }

  @Transactional
  public List<List<Permission>> buttonPermissions(@Source List<Menu> menus) {
    if (menus.isEmpty()) {
      return List.of();
    }

    List<Long> menuIds = menus.stream().map(m -> m.id).toList();
    Map<Long, List<Permission>> permsByMenu = loadButtonPermissionsByMenuIds(menuIds);

    return menus.stream().map(m -> permsByMenu.getOrDefault(m.id, List.of())).toList();
  }

  private Map<Long, List<Menu>> loadChildrenByParentIds(List<Long> parentIds) {
    String jpql = "SELECT m.parent.id, m FROM Menu m WHERE m.parent.id IN :parentIds";

    List<Object[]> results =
        session.createQuery(jpql, Object[].class)
            .setParameter("parentIds", parentIds)
            .getResultList();

    Map<Long, List<Menu>> map = new HashMap<>();
    for (Object[] row : results) {
      Long parentId = (Long) row[0];
      Menu child = (Menu) row[1];
      map.computeIfAbsent(parentId, k -> new ArrayList<>()).add(child);
    }

    for (Long parentId : parentIds) {
      map.putIfAbsent(parentId, List.of());
    }

    return map;
  }

  private Map<Long, Menu> loadMenusByIds(List<Long> menuIds) {
    if (menuIds.isEmpty()) {
      return Map.of();
    }

    List<Menu> menus = session.byId(Menu.class).loadMulti(menuIds);
    Map<Long, Menu> map = new HashMap<>();
    for (Menu menu : menus) {
      map.put(menu.id, menu);
    }
    return map;
  }

  private Map<Long, List<Permission>> loadButtonPermissionsByMenuIds(List<Long> menuIds) {
    String jpql = "SELECT p.menu.id, p FROM Permission p WHERE p.menu.id IN :menuIds";

    List<Object[]> results =
        session.createQuery(jpql, Object[].class)
            .setParameter("menuIds", menuIds)
            .getResultList();

    Map<Long, List<Permission>> map = new HashMap<>();
    for (Object[] row : results) {
      Long menuId = (Long) row[0];
      Permission perm = (Permission) row[1];
      map.computeIfAbsent(menuId, k -> new ArrayList<>()).add(perm);
    }

    for (Long menuId : menuIds) {
      map.putIfAbsent(menuId, List.of());
    }

    return map;
  }
}
```

**Step 2: 验证编译**

Run: `./gradlew :feature-graphql:compileJava`
Expected: BUILD SUCCESSFUL

**Step 3: Commit**

```bash
git add feature-graphql/src/main/java/pro/walkin/ams/graphql/entity/menu/MenuGraphQLApi.java
git commit -m "feat(graphql): add batch children/parent/buttonPermissions Source Methods to MenuGraphQLApi"
```

---

## Task 8: PermissionGraphQLApi 添加 menu Source Method

**Files:**
- Modify: `feature-graphql/src/main/java/pro/walkin/ams/graphql/entity/permission/PermissionGraphQLApi.java`

**Step 1: 添加 menu 方法**

完整修改后的文件：

```java
package pro.walkin.ams.graphql.entity.permission;

import jakarta.inject.Inject;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.graphql.DefaultValue;
import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Name;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.graphql.Source;
import org.hibernate.Session;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.graphql.connection.PermissionConnection;
import pro.walkin.ams.persistence.entity.system.Menu;
import pro.walkin.ams.persistence.entity.system.Permission;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@GraphQLApi
public class PermissionGraphQLApi {

  @Inject Session session;

  @Query("permissions")
  @Description("查询权限列表，支持动态过滤")
  @Transactional
  public PermissionConnection permissions(
      @Name("where") PermissionFilterInput where,
      @Name("orderBy") List<OrderByInput> orderBy,
      @DefaultValue("0") @Name("page") int page,
      @DefaultValue("20") @Name("size") int size) {

    CriteriaBuilder builder = session.getCriteriaBuilder();

    CriteriaQuery<Permission> query =
        PermissionCriteriaTranslator.translate(builder, where, orderBy);
    List<Permission> permissions =
        session.createQuery(query).setFirstResult(page * size).setMaxResults(size).getResultList();

    CriteriaQuery<Long> countQuery = PermissionCriteriaTranslator.translateCount(builder, where);
    long total = session.createQuery(countQuery).getSingleResult();

    return new PermissionConnection(permissions, total, page, size);
  }

  @Transactional
  public List<Menu> menu(@Source List<Permission> permissions) {
    if (permissions.isEmpty()) {
      return List.of();
    }

    List<Long> menuIds =
        permissions.stream().map(p -> p.menu != null ? p.menu.id : null).filter(id -> id != null).distinct().toList();

    if (menuIds.isEmpty()) {
      return permissions.stream().map(p -> (Menu) null).toList();
    }

    Map<Long, Menu> menuMap = loadMenusByIds(menuIds);

    return permissions.stream()
        .map(p -> p.menu != null ? menuMap.get(p.menu.id) : null)
        .toList();
  }

  private Map<Long, Menu> loadMenusByIds(List<Long> menuIds) {
    if (menuIds.isEmpty()) {
      return Map.of();
    }

    List<Menu> menus = session.byId(Menu.class).loadMulti(menuIds);
    Map<Long, Menu> map = new HashMap<>();
    for (Menu menu : menus) {
      map.put(menu.id, menu);
    }
    return map;
  }
}
```

**Step 2: 验证编译**

Run: `./gradlew :feature-graphql:compileJava`
Expected: BUILD SUCCESSFUL

**Step 3: Commit**

```bash
git add feature-graphql/src/main/java/pro/walkin/ams/graphql/entity/permission/PermissionGraphQLApi.java
git commit -m "feat(graphql): add batch menu Source Method to PermissionGraphQLApi"
```

---

## Task 9: 完整构建验证

**Files:**
- N/A (验证任务)

**Step 1: 完整构建**

Run: `./gradlew build -x test`
Expected: BUILD SUCCESSFUL

**Step 2: 检查 GraphQL Schema**

Run: `./gradlew quarkusDev` (in background)
Then: `curl http://localhost:8080/graphql/schema.graphql`

验证 schema 中包含新字段：
- `User.roles: [Role!]!`
- `Role.permissions: [Permission!]!`
- `Menu.children: [Menu!]!`
- `Menu.parent: Menu`
- `Menu.buttonPermissions: [Permission!]!`
- `Permission.menu: Menu`

**Step 3: 停止开发服务器**

Run: Ctrl+C

**Step 4: Commit (如果需要)**

```bash
git add -A
git commit -m "chore: verify GraphQL schema changes"
```

---

## Task 10: 集成测试验证

**Files:**
- Create: `feature-graphql/src/test/java/pro/walkin/ams/graphql/SourceMethodIntegrationTest.java`

**Step 1: 创建测试文件**

```java
package pro.walkin.ams.graphql;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class SourceMethodIntegrationTest {

  @Test
  void testUserRolesSourceMethod() {
    String query =
        """
        {
          users(page: 0, size: 10) {
            items {
              id
              username
              roles {
                id
                code
                name
              }
            }
          }
        }
        """;

    given()
        .contentType(ContentType.JSON)
        .body("{\"query\":\"" + query.replace("\n", " ") + "\"}")
        .when()
        .post("/graphql")
        .then()
        .statusCode(200)
        .body("data.users.items", notNullValue());
  }

  @Test
  void testRolePermissionsSourceMethod() {
    String query =
        """
        {
          roles(page: 0, size: 10) {
            items {
              id
              code
              name
              permissions {
                id
                code
                name
              }
            }
          }
        }
        """;

    given()
        .contentType(ContentType.JSON)
        .body("{\"query\":\"" + query.replace("\n", " ") + "\"}")
        .when()
        .post("/graphql")
        .then()
        .statusCode(200)
        .body("data.roles.items", notNullValue());
  }

  @Test
  void testMenuChildrenSourceMethod() {
    String query =
        """
        {
          menus(page: 0, size: 100) {
            items {
              id
              key
              label
              children {
                id
                key
                label
              }
            }
          }
        }
        """;

    given()
        .contentType(ContentType.JSON)
        .body("{\"query\":\"" + query.replace("\n", " ") + "\"}")
        .when()
        .post("/graphql")
        .then()
        .statusCode(200)
        .body("data.menus.items", notNullValue());
  }

  @Test
  void testPermissionMenuSourceMethod() {
    String query =
        """
        {
          permissions(page: 0, size: 10) {
            items {
              id
              code
              name
              menu {
                id
                key
                label
              }
            }
          }
        }
        """;

    given()
        .contentType(ContentType.JSON)
        .body("{\"query\":\"" + query.replace("\n", " ") + "\"}")
        .when()
        .post("/graphql")
        .then()
        .statusCode(200)
        .body("data.permissions.items", notNullValue());
  }
}
```

**Step 2: 运行测试**

Run: `./gradlew :feature-graphql:test --tests "*SourceMethodIntegrationTest*"`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add feature-graphql/src/test/java/pro/walkin/ams/graphql/SourceMethodIntegrationTest.java
git commit -m "test(graphql): add Source Method integration tests"
```

---

## 验证清单

- [ ] User.roles 通过 @Source 方法加载
- [ ] Role.permissions 通过 @Source 方法加载
- [ ] Menu.children 通过 @Source 方法加载
- [ ] Menu.parent 通过 @Source 方法加载
- [ ] Menu.buttonPermissions 通过 @Source 方法加载
- [ ] Permission.menu 通过 @Source 方法加载
- [ ] 所有实体懒加载字段添加 @Ignore 注解
- [ ] 集成测试通过
- [ ] GraphQL UI 验证查询成功
- [ ] 无 LazyInitializationException 错误
