# Testcontainers 测试修复实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复 app-boot 模块的测试，统一使用 Testcontainers PostgreSQL，移除 H2 回退逻辑。

**Architecture:** 简化 `PostgresTestResource`，移除 H2 回退；添加 `.testcontainers.properties` 优化配置；更新 CI workflow；验证所有测试通过。

**Tech Stack:** Java 21, Quarkus 3.31.2, Testcontainers, PostgreSQL, Gradle, GitHub Actions

---

## 前置检查

**检查 Docker 可用性：**
```bash
docker ps
```
Expected: Docker 守护进程运行中，无错误

**检查当前测试状态：**
```bash
./gradlew :app-boot:test 2>&1 | tail -20
```
Expected: 显示 TenantRoleFilterTest 失败（镜像拉取超时）

---

## Task 1: 移除 H2 依赖

**Files:**
- Modify: `app-boot/build.gradle.kts:49`

**Step 1: 移除 H2 依赖**

删除以下行：
```kotlin
testImplementation("io.quarkus:quarkus-jdbc-h2")
```

**Step 2: 验证修改**

查看文件确认 H2 依赖已移除：
```bash
grep -n "quarkus-jdbc-h2" app-boot/build.gradle.kts
```
Expected: 无输出（未找到）

**Step 3: 提交**

```bash
git add app-boot/build.gradle.kts
git commit -m "chore: remove H2 dependency from app-boot tests"
```

---

## Task 2: 简化 PostgresTestResource

**Files:**
- Modify: `app-boot/src/test/java/pro/walkin/ams/boot/it/PostgresTestResource.java`

**Step 1: 重写 PostgresTestResource**

将文件内容替换为：

```java
package pro.walkin.ams.boot.it;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Map;

public class PostgresTestResource implements QuarkusTestResourceLifecycleManager {

  private PostgreSQLContainer<?> postgres;

  @Override
  public Map<String, String> start() {
    postgres =
        new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("ams_test")
            .withUsername("test")
            .withPassword("test");
    postgres.start();
    return Map.of(
        "quarkus.datasource.jdbc.url", postgres.getJdbcUrl(),
        "quarkus.datasource.username", postgres.getUsername(),
        "quarkus.datasource.password", postgres.getPassword(),
        "quarkus.datasource.db-kind", "postgresql");
  }

  @Override
  public void stop() {
    if (postgres != null) {
      postgres.stop();
    }
  }
}
```

**Step 2: 验证编译通过**

```bash
./gradlew :app-boot:compileTestJava 2>&1 | tail -10
```
Expected: BUILD SUCCESSFUL

**Step 3: 提交**

```bash
git add app-boot/src/test/java/pro/walkin/ams/boot/it/PostgresTestResource.java
git commit -m "refactor: simplify PostgresTestResource, remove H2 fallback"
```

---

## Task 3: 添加 Testcontainers 配置

**Files:**
- Create: `app-boot/src/test/resources/.testcontainers.properties`

**Step 1: 创建配置文件**

```properties
# Testcontainers 配置
# 镜像拉取超时（秒）
docker.image.pull.timeout=120
# 容器启动超时（秒）
docker.container.start.timeout=180
# 重用容器（加速后续测试）
testcontainers.reuse.enable=true
```

**Step 2: 验证文件创建**

```bash
cat app-boot/src/test/resources/.testcontainers.properties
```
Expected: 显示上述配置内容

**Step 3: 提交**

```bash
git add app-boot/src/test/resources/.testcontainers.properties
git commit -m "chore: add testcontainers configuration for better stability"
```

---

## Task 4: 创建 GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/test.yml`

**Step 1: 创建工作流目录**

```bash
mkdir -p .github/workflows
```

**Step 2: 创建 workflow 文件**

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          
      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v3
        
      - name: Run tests
        run: ./gradlew :app-boot:test -PrunIntegrationTests
        env:
          TESTCONTAINERS_RYUK_DISABLED: true
          TESTCONTAINERS_REUSE_ENABLE: true
```

**Step 3: 验证 workflow 语法**

```bash
cat .github/workflows/test.yml | head -30
```
Expected: 显示正确的 YAML 格式

**Step 4: 提交**

```bash
git add .github/workflows/test.yml
git commit -m "ci: add GitHub Actions workflow for running tests"
```

---

## Task 5: 验证 TenantRoleFilterTest

**Files:**
- Test: `app-boot/src/test/java/pro/walkin/ams/boot/TenantRoleFilterTest.java`

**Step 1: 运行单个测试**

```bash
./gradlew :app-boot:test --tests "TenantRoleFilterTest" 2>&1 | tail -30
```
Expected: 
- 如果镜像已缓存：BUILD SUCCESSFUL
- 如果需拉取镜像：显示拉取进度，最终 BUILD SUCCESSFUL

**Step 2: 检查测试报告**

```bash
cat app-boot/build/reports/tests/test/classes/pro.walkin.ams.boot.TenantRoleFilterTest.html | grep -A5 "successRate"
```
Expected: 显示 "100%" 或 "successful"

**Step 3: 提交（如果测试通过）**

如果测试通过：
```bash
./gradlew spotlessApply
git add -A
git commit -m "test: verify TenantRoleFilterTest passes with Testcontainers"
```

---

## Task 6: 运行所有集成测试

**Files:**
- Test: `app-boot/src/test/java/pro/walkin/ams/boot/it/**/*`

**Step 1: 运行包含集成测试的全量测试**

```bash
./gradlew :app-boot:test -PrunIntegrationTests 2>&1 | tail -50
```
Expected: BUILD SUCCESSFUL，显示所有测试通过

**Step 2: 检查测试报告汇总**

```bash
cat app-boot/build/reports/tests/test/index.html | grep -E "(tests|failures|successRate)" | head -10
```
Expected: 
- tests: 显示总测试数
- failures: 0
- successRate: 100%

**Step 3: 提交（如果全部通过）**

```bash
./gradlew spotlessApply
git add -A
git commit -m "test: verify all integration tests pass"
```

---

## Task 7: 最终验证和清理

**Step 1: 运行代码质量检查**

```bash
./gradlew spotlessCheck
```
Expected: BUILD SUCCESSFUL

**Step 2: 验证 SpotBugs**

```bash
./gradlew :app-boot:spotbugsMain 2>&1 | tail -10
```
Expected: 生成报告，无阻塞错误（ignoreFailures=true）

**Step 3: 最终提交**

```bash
git log --oneline -5
```
Expected: 显示所有提交记录

---

## 潜在问题及解决方案

### 问题1: 镜像拉取仍然超时

**解决方案：**
```bash
# 手动预拉镜像
docker pull postgres:16-alpine
# 然后重新运行测试
./gradlew :app-boot:test
```

### 问题2: 端口冲突

**解决方案：**
Testcontainers 会自动分配端口，通常不会冲突。如果遇到：
```bash
# 清理残留容器
docker ps -a | grep postgres | awk '{print $1}' | xargs docker rm -f
```

### 问题3: 磁盘空间不足

**解决方案：**
```bash
# 清理 Docker 缓存
docker system prune -f
```

---

## 验收清单

- [ ] H2 依赖已从 `app-boot/build.gradle.kts` 移除
- [ ] `PostgresTestResource` 已简化，无 H2 回退逻辑
- [ ] `.testcontainers.properties` 已创建并配置
- [ ] GitHub Actions workflow 已创建
- [ ] `TenantRoleFilterTest` 通过
- [ ] 所有集成测试通过（`./gradlew :app-boot:test -PrunIntegrationTests`）
- [ ] Spotless 检查通过
- [ ] 代码已提交到 Git

---

## 后续行动

1. 推送分支到 GitHub
2. 创建 Pull Request
3. 验证 GitHub Actions 通过
4. 合并到主分支
