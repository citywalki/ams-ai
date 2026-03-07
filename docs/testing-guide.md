# AMS 测试指南

## 测试架构

本项目采用三层测试架构：

1. **单元测试** - 快速、隔离
2. **E2E 测试** - 完整链路
3. **契约测试** - API 兼容性

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

## 编写新测试

### REST E2E 测试

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

### GraphQL E2E 测试

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

## 最佳实践

1. **测试独立性** - 每个测试独立设置数据
2. **清理数据** - 测试后清理测试数据
3. **明确断言** - 使用具体值而非模糊匹配
4. **契约优先** - API 变更前更新契约
