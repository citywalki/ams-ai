# Testcontainers 测试修复方案

日期：2026-03-07  
主题：app-boot 模块测试修复  
状态：已批准 ✅

## 背景

app-boot 模块的测试存在以下问题：
- `TenantRoleFilterTest` 失败：使用 Testcontainers 启动 PostgreSQL，但网络超时无法拉取镜像
- 测试分类混乱，部分使用 H2，部分使用 PostgreSQL
- 本地开发和 CI 环境行为不一致

## 设计决策

### 1. 统一使用 PostgreSQL + Testcontainers

**决策**：所有测试统一使用 Testcontainers PostgreSQL，移除 H2 回退逻辑。

**理由**：
- 保持测试环境与生产环境一致
- 避免 H2 与 PostgreSQL 的行为差异导致的隐蔽 bug
- 简化测试配置，降低维护成本

### 2. 优化 Testcontainers 配置

配置参数：
```properties
docker.image.pull.timeout=120
docker.container.start.timeout=180
testcontainers.reuse.enable=true
```

**说明**：
- 增加镜像拉取超时时间至 120 秒
- 容器启动超时 180 秒
- 启用容器重用，加速后续测试运行

### 3. 移除 H2 依赖

从 `app-boot/build.gradle.kts` 移除：
```kotlin
testImplementation("io.quarkus:quarkus-jdbc-h2")
```

同时简化 `PostgresTestResource`，移除 H2 回退逻辑。

### 4. CI/CD 配置

GitHub Actions workflow：
```yaml
- name: Run all tests
  run: ./gradlew :app-boot:test -PrunIntegrationTests
  env:
    TESTCONTAINERS_RYUK_DISABLED: true
    TESTCONTAINERS_REUSE_ENABLE: true
```

环境变量说明：
- `TESTCONTAINERS_RYUK_DISABLED=true`：禁用 Ryuk 资源清理守护进程，加速 CI
- `TESTCONTAINERS_REUSE_ENABLE=true`：启用容器重用

## 测试运行命令

```bash
# 本地开发（必须开启 Docker）
./gradlew :app-boot:test

# 包含集成测试
./gradlew :app-boot:test -PrunIntegrationTests

# 单个测试类
./gradlew :app-boot:test --tests "TenantRoleFilterTest"

# 单个测试方法
./gradlew :app-boot:test --tests "TenantRoleFilterTest.shouldOnlyReturnRolesOfCurrentTenant"
```

## 验收标准

- [ ] `TenantRoleFilterTest` 通过
- [ ] 所有集成测试通过（`./gradlew :app-boot:test -PrunIntegrationTests`）
- [ ] GitHub Actions CI 通过
- [ ] 本地无 Docker 环境时测试明确报错（而非静默回退）

## 依赖

- Docker 环境（本地和 CI 都必须）
- 网络访问（拉取 postgres:16-alpine 镜像）

## 注意事项

1. **本地开发**：确保 Docker Desktop 或其他 Docker 环境已启动
2. **首次运行**：可能需要较长时间拉取镜像
3. **网络限制**：如果处于受限网络环境，可能需要配置 Docker 镜像代理
