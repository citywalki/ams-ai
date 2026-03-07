# 修复集成测试以符合 API 规范

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复失败的集成测试，使其符合 "查询使用 GraphQL，更新使用 REST" 的 API 规范

**Architecture:** 将查询类测试从 REST 改为 GraphQL，保留更新操作为 REST。使用现有的 `GraphQLTestBase` 作为基础。

**Tech Stack:** Java 21, Quarkus, GraphQL, REST, JUnit 5, Testcontainers

---

## 背景

根据 API 规范：
- **查询** → 使用 GraphQL
- **更新**（创建、修改、删除）→ 使用 REST

当前失败的测试：
- `UserControllerE2EIT` (6 个失败) - 使用 REST 查询用户列表和详情
- `RoleControllerE2EIT` (4 个失败) - 使用 REST 查询角色列表和详情  
- `UserGraphQLApiE2EIT` (1 个失败) - 初始化错误
- `AuthPactProviderTest` (2 个失败) - 令牌格式匹配问题
- `AuthFlowE2EIT` (1 个失败) - 认证流程问题
- 其他 (2 个失败)

---

## Task 1: 分析 UserControllerE2EIT

**Files:**
- Read: `app-boot/src/test/java/pro/walkin/ams/boot/it/system/UserControllerE2EIT.java`
- Read: `app-boot/src/test/java/pro/walkin/ams/boot/support/GraphQLTestBase.java`

**Step 1: 读取 UserControllerE2EIT**

查看哪些测试方法是查询操作（应该改为 GraphQL），哪些是更新操作（应该保留 REST）。

**Step 2: 读取 GraphQLTestBase**

了解如何编写 GraphQL 测试。

**Step 3: 规划修复策略**

对于每个测试方法：
- 如果是查询（GET 请求）→ 改为 GraphQL 查询
- 如果是更新（POST/PUT/DELETE）→ 保留 REST，但可能需要调整

**Step 4: 提交分析结果**

```bash
git add -A
git commit -m "docs: analyze UserControllerE2EIT test structure"
```

---

## Task 2: 修复 UserControllerE2EIT 查询测试

**Files:**
- Modify: `app-boot/src/test/java/pro/walkin/ams/boot/it/system/UserControllerE2EIT.java`

**Step 1: 将 REST 查询改为 GraphQL**

修改以下测试方法（假设它们是查询）：
- `shouldListUsers` → 改为 GraphQL 查询 users
- `shouldGetUserById` → 改为 GraphQL 查询 user(id)

**示例代码：**
```java
@Test
@DisplayName("should list users via GraphQL")
void shouldListUsers() {
  String query = """
      query {
        users {
          id
          username
          email
        }
      }
      """;
  
  Response response = executeGraphQL(query);
  
  assertThat(response.statusCode()).isEqualTo(200);
  // 验证返回的用户列表
}
```

**Step 2: 保留 REST 更新操作**

以下测试保留 REST（如果是更新）：
- `shouldCreateUser` - POST
- `shouldUpdateUser` - PUT
- `shouldDeleteUser` - DELETE

**Step 3: 运行测试验证**

```bash
./gradlew :app-boot:test --tests "UserControllerE2EIT" 2>&1 | tail -30
```
Expected: BUILD SUCCESSFUL

**Step 4: 提交**

```bash
./gradlew spotlessApply
git add -A
git commit -m "test: fix UserControllerE2EIT to use GraphQL for queries"
```

---

## Task 3: 修复 RoleControllerE2EIT

**Files:**
- Modify: `app-boot/src/test/java/pro/walkin/ams/boot/it/system/RoleControllerE2EIT.java`

**Step 1: 将 REST 查询改为 GraphQL**

类似 Task 2，将查询操作改为 GraphQL。

**Step 2: 保留 REST 更新操作**

保留创建、更新、删除角色的 REST 调用。

**Step 3: 运行测试**

```bash
./gradlew :app-boot:test --tests "RoleControllerE2EIT" 2>&1 | tail -30
```

**Step 4: 提交**

```bash
./gradlew spotlessApply
git add -A
git commit -m "test: fix RoleControllerE2EIT to use GraphQL for queries"
```

---

## Task 4: 修复 UserGraphQLApiE2EIT 初始化错误

**Files:**
- Modify: `app-boot/src/test/java/pro/walkin/ams/boot/it/graphql/UserGraphQLApiE2EIT.java`

**Step 1: 诊断初始化错误**

运行测试查看错误信息：
```bash
./gradlew :app-boot:test --tests "UserGraphQLApiE2EIT" 2>&1 | grep -A20 "FAILED"
```

**Step 2: 修复初始化问题**

根据错误信息修复，可能是：
- 缺少测试数据
- 配置问题
- 依赖注入问题

**Step 3: 运行测试验证**

```bash
./gradlew :app-boot:test --tests "UserGraphQLApiE2EIT" 2>&1 | tail -20
```

**Step 4: 提交**

```bash
./gradlew spotlessApply
git add -A
git commit -m "test: fix UserGraphQLApiE2EIT initialization error"
```

---

## Task 5: 修复 AuthPactProviderTest

**Files:**
- Read: `app-boot/src/test/java/pro/walkin/ams/boot/pacts/AuthPactProviderTest.java`
- Read: `app-boot/src/test/resources/pacts/`

**Step 1: 诊断 Pact 测试失败**

运行测试查看详细错误：
```bash
./gradlew :app-boot:test --tests "AuthPactProviderTest" 2>&1 | tail -50
```

**Step 2: 修复令牌格式匹配问题**

可能是：
- JWT 令牌格式不匹配
- 过期时间不匹配
- 响应字段不匹配

**Step 3: 更新 Pact 契约或实现**

确保实现与契约一致，或更新契约以反映实际实现。

**Step 4: 运行测试**

```bash
./gradlew :app-boot:test --tests "AuthPactProviderTest" 2>&1 | tail -20
```

**Step 5: 提交**

```bash
./gradlew spotlessApply
git add -A
git commit -m "test: fix AuthPactProviderTest token format matching"
```

---

## Task 6: 修复 AuthFlowE2EIT

**Files:**
- Modify: `app-boot/src/test/java/pro/walkin/ams/boot/it/auth/AuthFlowE2EIT.java`

**Step 1: 诊断认证流程问题**

运行测试：
```bash
./gradlew :app-boot:test --tests "AuthFlowE2EIT" 2>&1 | tail -50
```

**Step 2: 修复问题**

根据错误类型修复：
- 登录流程问题
- Token 验证问题
- 会话管理问题

**Step 3: 运行测试**

```bash
./gradlew :app-boot:test --tests "AuthFlowE2EIT" 2>&1 | tail -20
```

**Step 4: 提交**

```bash
./gradlew spotlessApply
git add -A
git commit -m "test: fix AuthFlowE2EIT authentication flow"
```

---

## Task 7: 修复剩余测试

**Files:**
- Check: `app-boot/src/test/java/pro/walkin/ams/boot/it/system/PermissionControllerE2EIT.java`
- Check: `app-boot/src/test/java/pro/walkin/ams/boot/it/system/MenuControllerE2EIT.java`

**Step 1: 运行所有剩余测试**

```bash
./gradlew :app-boot:test -PrunIntegrationTests 2>&1 | grep "FAILED"
```

**Step 2: 逐个修复**

对于每个失败的测试：
1. 如果是查询 → 改为 GraphQL
2. 如果是更新 → 检查 REST 调用是否正确

**Step 3: 运行全量测试验证**

```bash
./gradlew :app-boot:test -PrunIntegrationTests 2>&1 | tail -30
```

**Step 4: 提交**

```bash
./gradlew spotlessApply
git add -A
git commit -m "test: fix remaining integration tests for API spec compliance"
```

---

## Task 8: 最终验证

**Step 1: 运行所有集成测试**

```bash
./gradlew :app-boot:test -PrunIntegrationTests 2>&1 | tail -30
```
Expected: BUILD SUCCESSFUL, 所有测试通过

**Step 2: 代码质量检查**

```bash
./gradlew spotlessCheck
./gradlew :app-boot:spotbugsMain 2>&1 | tail -10
```

**Step 3: 查看提交历史**

```bash
git log --oneline -10
```

**Step 4: 最终提交（如果需要）**

```bash
./gradlew spotlessApply
git add -A
git commit -m "test: all integration tests pass with API spec compliance"
```

---

## 验收标准

- [ ] UserControllerE2EIT 所有测试通过
- [ ] RoleControllerE2EIT 所有测试通过
- [ ] UserGraphQLApiE2EIT 通过
- [ ] AuthPactProviderTest 通过
- [ ] AuthFlowE2EIT 通过
- [ ] 其他控制器测试通过
- [ ] 全量集成测试通过（`./gradlew :app-boot:test -PrunIntegrationTests`）
- [ ] Spotless 检查通过
- [ ] SpotBugs 无严重问题

---

## 技术参考

### GraphQL 测试示例

```java
@QuarkusTest
class UserGraphQLApiE2EIT extends GraphQLTestBase {
  
  @Test
  void shouldQueryUsers() {
    String query = """
        query {
          users {
            id
            username
          }
        }
        """;
    
    Response response = executeGraphQL(query);
    assertThat(response.statusCode()).isEqualTo(200);
  }
}
```

### REST 更新示例

```java
@Test
void shouldCreateUser() {
  CreateUserRequest request = new CreateUserRequest("username", "password", "email");
  
  given()
    .contentType(ContentType.JSON)
    .body(request)
  .when()
    .post("/api/system/users")
  .then()
    .statusCode(201)
    .body("username", equalTo("username"));
}
```
