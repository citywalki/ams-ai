# 异常处理指南

## OVERVIEW
统一异常处理框架，提供结构化的错误码和异常信息。

## WHERE TO LOOK
- `BaseException`: 基础异常类，包含错误码(code)、消息(message)、原因(cause)
- `BusinessException`: 业务逻辑异常，默认错误码 `BUSINESS_ERROR`
- `ValidationException`: 数据验证异常，包含字段(field)和值(value)信息，默认错误码 `VALIDATION_ERROR`
- `NotFoundException`: 资源未找到异常，包含资源类型(resourceType)和ID(resourceId)，默认错误码 `NOT_FOUND`

## ANTI-PATTERNS
- ❌ 禁止空的catch块：必须处理或重新抛出异常
- ❌ 禁止直接抛出RuntimeException：使用自定义异常类
- ❌ 禁止硬编码错误消息：使用常量或配置
- ❌ 禁止忽略异常链：保留原始异常(cause)

## USAGE

### 抛出异常
```java
// 业务异常
throw new BusinessException("订单金额不能为负数");

// 验证异常（带字段信息）
throw new ValidationException("邮箱格式不正确", "email", user.getEmail());

// 资源未找到
throw new NotFoundException("User", userId.toString());

// 自定义错误码
throw new BusinessException("PAYMENT_FAILED", "支付处理失败");
```

### 异常构造模式
```java
// BaseException 构造器
new BaseException(code, message);
new BaseException(code, message, cause);
new BaseException(message); // 使用 DEFAULT_ERROR_CODE
new BaseException(message, cause);

// ValidationException 额外字段
new ValidationException(code, message, field, value);
new ValidationException(message, field, value); // 使用 VALIDATION_ERROR

// NotFoundException 资源信息
new NotFoundException(code, message, resourceType, resourceId);
new NotFoundException(resourceType, resourceId); // 自动生成消息
```

### 错误码约定
- `NOT_FOUND`: 资源不存在
- `VALIDATION_ERROR`: 数据验证失败
- `BUSINESS_ERROR`: 业务逻辑错误
- `INTERNAL_ERROR`: 系统内部错误（默认）

### 最佳实践
1. **服务层**：抛出具体的业务异常
2. **控制器层**：使用 `@Error` 注解处理异常，返回结构化错误响应
3. **验证层**：使用 ValidationException 提供详细的字段级错误信息
4. **资源访问**：使用 NotFoundException 明确标识缺失的资源
5. **异常链**：始终传递原始异常作为 cause 参数

### 错误响应格式
```json
{
  "code": "NOT_FOUND",
  "message": "User with id 123 not found",
  "details": {
    "resourceType": "User",
    "resourceId": "123"
  },
  "timestamp": "2024-01-23T10:30:00Z"
}
```