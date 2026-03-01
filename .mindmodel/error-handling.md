# 错误处理模式 (Error Handling Pattern)

## 概述

AMS-AI 使用自定义异常体系，通过全局异常处理器统一处理错误响应。

## 异常体系

### BaseException

```java
package pro.walkin.ams.common.exception;

/**
 * 基础业务异常类
 */
public class BaseException extends RuntimeException {
    
    private final String code;
    
    public static final String DEFAULT_ERROR_CODE = "INTERNAL_ERROR";
    
    public BaseException(String code, String message) {
        super(message);
        this.code = code;
    }
    
    public BaseException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
    
    public BaseException(String message) {
        this(DEFAULT_ERROR_CODE, message);
    }
    
    public BaseException(String message, Throwable cause) {
        this(DEFAULT_ERROR_CODE, message, cause);
    }
    
    public String getCode() {
        return code;
    }
}
```

### BusinessException

```java
package pro.walkin.ams.common.exception;

/**
 * 业务逻辑异常
 * 用于业务规则校验失败
 */
public class BusinessException extends BaseException {
    
    public BusinessException(String code, String message) {
        super(code, message);
    }
    
    public BusinessException(String message) {
        super(message);
    }
    
    public BusinessException(String code, String message, Throwable cause) {
        super(code, message, cause);
    }
}
```

### ValidationException

```java
package pro.walkin.ams.common.exception;

/**
 * 数据验证异常
 * 用于输入参数验证失败
 */
public class ValidationException extends BaseException {
    
    private final String field;
    private final Object rejectedValue;
    
    public ValidationException(String message) {
        super("VALIDATION_ERROR", message);
        this.field = null;
        this.rejectedValue = null;
    }
    
    public ValidationException(String message, String field, Object rejectedValue) {
        super("VALIDATION_ERROR", message);
        this.field = field;
        this.rejectedValue = rejectedValue;
    }
    
    public String getField() {
        return field;
    }
    
    public Object getRejectedValue() {
        return rejectedValue;
    }
}
```

### NotFoundException

```java
package pro.walkin.ams.common.exception;

/**
 * 资源未找到异常
 */
public class NotFoundException extends BaseException {
    
    private final String resourceType;
    private final String resourceId;
    
    public NotFoundException(String resourceType, String resourceId) {
        super("NOT_FOUND", 
              String.format("%s not found: %s", resourceType, resourceId));
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }
    
    public String getResourceType() {
        return resourceType;
    }
    
    public String getResourceId() {
        return resourceId;
    }
}
```

## 使用示例

### Service 层抛出异常

```java
@ApplicationScoped
public class UserService {
    
    public User getUserById(Long id, Long tenantId) {
        // 参数验证
        Objects.requireNonNull(id, "用户ID不能为空");
        Objects.requireNonNull(tenantId, "租户ID不能为空");
        
        // 查询用户
        User user = User_.managed().findById(id);
        
        // 资源未找到
        if (user == null) {
            throw new NotFoundException("User", id.toString());
        }
        
        // 租户隔离检查
        if (!tenantId.equals(user.tenant)) {
            throw new ValidationException("数据不属于当前租户", "tenantId", tenantId);
        }
        
        // 业务规则检查
        if ("INACTIVE".equals(user.status)) {
            throw new BusinessException("USER_001", "用户已被禁用");
        }
        
        return user;
    }
    
    public User createUser(UserDto dto, Long tenantId) {
        // 参数验证
        Objects.requireNonNull(dto, "用户数据不能为空");
        
        // 业务规则：用户名唯一性
        if (User_.managed().count("username = ?1 and tenant = ?2", 
                                  dto.username(), tenantId) > 0) {
            throw new ValidationException("用户名已存在", "username", dto.username());
        }
        
        // 业务规则：邮箱唯一性
        if (dto.email() != null && 
            User_.managed().count("email", dto.email()) > 0) {
            throw new ValidationException("邮箱已被注册", "email", dto.email());
        }
        
        User user = new User();
        user.username = dto.username();
        user.email = dto.email();
        user.tenant = tenantId;
        user.persist();
        
        return user;
    }
}
```

## 全局异常处理

### ErrorResponse DTO

```java
package pro.walkin.ams.common.dto;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
    Instant timestamp,
    int status,
    String error,
    String code,
    String message,
    String path,
    Map<String, Object> details
) {
    public static ErrorResponse of(
        int status, 
        String error, 
        String code, 
        String message, 
        String path
    ) {
        return new ErrorResponse(
            Instant.now(),
            status,
            error,
            code,
            message,
            path,
            null
        );
    }
    
    public static ErrorResponse of(
        int status,
        String error,
        String code,
        String message,
        String path,
        Map<String, Object> details
    ) {
        return new ErrorResponse(
            Instant.now(),
            status,
            error,
            code,
            message,
            path,
            details
        );
    }
}
```

### GlobalExceptionMapper

```java
package pro.walkin.ams.common.exception.mapper;

import jakarta.inject.Inject;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.dto.ErrorResponse;
import pro.walkin.ams.common.exception.*;

import java.util.HashMap;
import java.util.Map;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Exception> {
    
    private static final Logger LOG = LoggerFactory.getLogger(GlobalExceptionMapper.class);
    
    @Context
    UriInfo uriInfo;
    
    @Override
    public Response toResponse(Exception exception) {
        String path = uriInfo.getRequestUri().getPath();
        
        if (exception instanceof NotFoundException) {
            return handleNotFoundException((NotFoundException) exception, path);
        }
        
        if (exception instanceof ValidationException) {
            return handleValidationException((ValidationException) exception, path);
        }
        
        if (exception instanceof BusinessException) {
            return handleBusinessException((BusinessException) exception, path);
        }
        
        if (exception instanceof BaseException) {
            return handleBaseException((BaseException) exception, path);
        }
        
        if (exception instanceof NullPointerException) {
            return handleNullPointerException((NullPointerException) exception, path);
        }
        
        if (exception instanceof IllegalArgumentException) {
            return handleIllegalArgumentException((IllegalArgumentException) exception, path);
        }
        
        // 未知异常
        return handleUnknownException(exception, path);
    }
    
    private Response handleNotFoundException(NotFoundException e, String path) {
        LOG.warn("Resource not found: {} - {}", e.getResourceType(), e.getResourceId());
        
        ErrorResponse response = ErrorResponse.of(
            404,
            "Not Found",
            e.getCode(),
            e.getMessage(),
            path
        );
        
        return Response.status(404)
            .entity(response)
            .build();
    }
    
    private Response handleValidationException(ValidationException e, String path) {
        LOG.warn("Validation failed: {}", e.getMessage());
        
        Map<String, Object> details = new HashMap<>();
        if (e.getField() != null) {
            details.put("field", e.getField());
        }
        if (e.getRejectedValue() != null) {
            details.put("rejectedValue", e.getRejectedValue());
        }
        
        ErrorResponse response = ErrorResponse.of(
            400,
            "Bad Request",
            e.getCode(),
            e.getMessage(),
            path,
            details.isEmpty() ? null : details
        );
        
        return Response.status(400)
            .entity(response)
            .build();
    }
    
    private Response handleBusinessException(BusinessException e, String path) {
        LOG.warn("Business rule violation: {} - {}", e.getCode(), e.getMessage());
        
        ErrorResponse response = ErrorResponse.of(
            422,
            "Unprocessable Entity",
            e.getCode(),
            e.getMessage(),
            path
        );
        
        return Response.status(422)
            .entity(response)
            .build();
    }
    
    private Response handleBaseException(BaseException e, String path) {
        LOG.error("Base exception: {} - {}", e.getCode(), e.getMessage());
        
        ErrorResponse response = ErrorResponse.of(
            500,
            "Internal Server Error",
            e.getCode(),
            e.getMessage(),
            path
        );
        
        return Response.status(500)
            .entity(response)
            .build();
    }
    
    private Response handleNullPointerException(NullPointerException e, String path) {
        LOG.error("Null pointer exception at {}", path, e);
        
        ErrorResponse response = ErrorResponse.of(
            400,
            "Bad Request",
            "NULL_POINTER",
            "参数不能为空",
            path
        );
        
        return Response.status(400)
            .entity(response)
            .build();
    }
    
    private Response handleIllegalArgumentException(IllegalArgumentException e, String path) {
        LOG.error("Illegal argument at {}", path, e);
        
        ErrorResponse response = ErrorResponse.of(
            400,
            "Bad Request",
            "ILLEGAL_ARGUMENT",
            e.getMessage() != null ? e.getMessage() : "参数错误",
            path
        );
        
        return Response.status(400)
            .entity(response)
            .build();
    }
    
    private Response handleUnknownException(Exception e, String path) {
        LOG.error("Unknown exception at {}", path, e);
        
        ErrorResponse response = ErrorResponse.of(
            500,
            "Internal Server Error",
            "INTERNAL_ERROR",
            "服务器内部错误",
            path
        );
        
        return Response.status(500)
            .entity(response)
            .build();
    }
}
```

## REST API 错误响应

### 标准 HTTP 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功（无返回内容） |
| 400 | Bad Request | 参数验证失败 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如唯一性冲突） |
| 422 | Unprocessable Entity | 业务规则校验失败 |
| 500 | Internal Server Error | 服务器错误 |

### 错误响应示例

```json
{
  "timestamp": "2026-03-01T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "用户名已存在",
  "path": "/api/users",
  "details": {
    "field": "username",
    "rejectedValue": "admin"
  }
}
```

```json
{
  "timestamp": "2026-03-01T12:00:00Z",
  "status": 404,
  "error": "Not Found",
  "code": "NOT_FOUND",
  "message": "User not found: 123",
  "path": "/api/users/123"
}
```

```json
{
  "timestamp": "2026-03-01T12:00:00Z",
  "status": 422,
  "error": "Unprocessable Entity",
  "code": "USER_001",
  "message": "用户已被禁用",
  "path": "/api/users/123"
}
```

## 最佳实践

### ✅ 必须遵守

1. **使用自定义异常体系**
2. **所有异常继承 BaseException**
3. **明确异常类型和错误码**
4. **全局异常处理器统一处理**
5. **记录异常日志**
6. **返回标准错误响应格式**
7. **区分验证异常和业务异常**

### ❌ 禁止做法

1. **直接抛出 RuntimeException**
2. **异常信息包含敏感数据**
3. **吞掉异常不处理**
4. **返回不统一的错误格式**
5. **使用 HTTP 状态码表示业务错误**
6. **异常信息暴露系统细节**
