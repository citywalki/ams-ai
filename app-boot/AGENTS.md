# app-boot 启动模块

**模块特定约束**

### 启动约定

- 开发模式: `./gradlew :app-boot:quarkusDev`
- 集成测试: `./gradlew :app-boot:test -PrunIntegrationTests`
- 默认排除 `**/it/**` 集成测试（需显式开启）

### 集成测试

```bash
# 运行集成测试
./gradlew :app-boot:test -PrunIntegrationTests
```
