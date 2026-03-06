# lib-common 异常处理与多租户

**模块特定约束**

## 异常处理

### 异常类

- `BaseException` - 基础异常类
- `BusinessException` - 业务异常
- `ValidationException` - 验证异常
- `NotFoundException` - 资源未找到异常

### 使用示例

```java
// 业务异常
throw new BusinessException("订单金额不能为负数");

// 验证异常（带字段信息）
throw new ValidationException("邮箱格式不正确", "email", user.getEmail());

// 资源未找到
throw new NotFoundException("User", userId.toString());
```

### 禁止

- ❌ 禁止直接抛出 RuntimeException
- ❌ 禁止空的 catch 块
- ❌ 禁止硬编码错误消息

## 多租户支持

### 核心组件

- `TenantContext` - 租户上下文管理（ThreadLocal）
- `TenantHibernateFilter` - Hibernate 过滤器
- `JwtAuthFilter` - JWT 认证过滤器

### 使用示例

```java
// 获取当前租户
Long tenantId = TenantContext.getCurrentTenantId();

// 设置租户
TenantContext.setCurrentTenantId(100L);

// 清除租户
TenantContext.clear();
```

### 禁止

- ❌ 禁止在业务代码中硬编码租户 ID
