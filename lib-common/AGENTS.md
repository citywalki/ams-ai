# lib-common 异常处理与通用工具

**Generated:** 2026-02-24 11:36
**Commit:** (当前Git提交)

## OVERVIEW

lib-common 是 AMS-AI 的核心基础库，提供异常处理框架、数据传输对象（DTO）、常量定义和通用工具类。

## WHERE TO LOOK

- `exception/` - 异常处理框架：BaseException 及其子类
- `dto/` - 数据传输对象：用户、角色、权限等相关 DTO
- `Constants.java` - 常量定义：权限码、错误码、业务常量

## STRUCTURE

```
lib-common/
├── src/main/java/pro/walkin/ams/common/
│   ├── exception/                    # 异常处理框架
│   │   ├── BaseException.java
│   │   ├── BusinessException.java
│   │   ├── ValidationException.java
│   │   └── NotFoundException.java
│   ├── dto/                          # 数据传输对象
│   │   ├── user/
│   │   │   ├── UserCreateRequest.java
│   │   │   ├── UserUpdateRequest.java
│   │   │   └── UserResponse.java
│   │   ├── system/
│   │   │   ├── RoleCreateRequest.java
│   │   │   ├── RoleUpdateRequest.java
│   │   │   ├── PermissionCreateRequest.java
│   │   │   └── MenuCreateRequest.java
│   │   └── common/
│   │       ├── PageRequest.java
│   │       └── ApiResponse.java
│   └── Constants.java               # 常量定义
└── src/main/resources/
    └── messages/                     # 国际化消息
```

## CONVENTIONS

- **异常类**: 继承 `BaseException`，使用 `ErrorCode` 枚举定义错误码
- **DTO**: 使用 Jakarta Validation 注解，实现 `Serializable`
- **常量**: 使用嵌套静态类组织，如 `Constants.Auth.PERMISSION_*`
- **错误码**: 前缀区分领域，如 `AUTH_`、`SYSTEM_`、`VALIDATION_`

## ANTI-PATTERNS (此项目)

- ❌ 禁止直接抛出 RuntimeException：使用自定义异常类
- ❌ 禁止空的 catch 块：必须处理或重新抛出异常
- ❌ 禁止硬编码错误消息：使用常量或配置文件
- ❌ 禁止忽略异常链：保留原始异常(cause)

## 错误处理模式

### 异常构造

```java
// 业务异常
throw new BusinessException("订单金额不能为负数");

// 验证异常（带字段信息）
throw new ValidationException("邮箱格式不正确", "email", user.getEmail());

// 资源未找到
throw new NotFoundException("User", userId.toString());
```

### 异常处理器集成

- 使用 `GlobalExceptionHandler` 自动处理所有异常
- 返回结构化的 `ErrorResponse` 对象
- 支持字段级错误验证和业务逻辑错误

## 权限常量

前端使用的权限码必须在此定义：

```java
public static final String PERMISSION_VIEW_DASHBOARD = "view:dashboard";
public static final String PERMISSION_VIEW_ALERTS = "view:alerts";
public static final String PERMISSION_VIEW_SETTINGS = "view:settings";
public static final String PERMISSION_ADMIN_MENUS = "admin:menus";
public static final String PERMISSION_ADMIN_ROLES = "admin:roles";
public static final String PERMISSION_ADMIN_PERMISSIONS = "admin:permissions";
```

## 使用示例

```java
// 抛出异常
public User createUser(UserCreateRequest request) {
    // 验证逻辑
    if (request.getEmail() == null) {
        throw new ValidationException("邮箱不能为空", "email", request.getEmail());
    }
    
    // 业务逻辑检查
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new BusinessException("邮箱已存在");
    }
    
    // 创建用户
    User user = new User();
    BeanUtils.copyProperties(request, user);
    user.setPassword(passwordService.encode(request.getPassword()));
    userRepo.persist(user);
    
    return user;
}
```

## 测试规范

- **异常测试**: 使用 `assertThatThrownBy` 验证异常类型和消息
- **DTO验证**: 测试 @NotNull、@Size 等注解的有效性
- **常量测试**: 确保权限码与前端一致