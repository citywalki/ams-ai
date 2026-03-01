# 编码约定

## 通用约定

### 文件组织
```
pro.walkin.ams.{module}.{layer}
├── entity/          # 实体类
├── repository/      # Repository 接口 (内嵌在实体中)
├── service/         # 业务逻辑
├── controller/      # REST/GraphQL 控制器
├── dto/             # 数据传输对象
├── config/          # 配置类
└── exception/       # 异常处理
```

### 导入顺序
1. Java 标准库 (java.*, javax.*)
2. 第三方库 (jakarta.*, org.*, io.*)
3. 项目内部导入 (pro.walkin.ams.*)
4. 静态导入

### 编码格式
- **字符集**: UTF-8
- **缩进**: 2 空格 (无 Tab)
- **行宽**: 120 字符
- **格式化**: Google Java Format
- **换行**: Unix 风格 (LF)

## 命名约定

### Java

#### 类/接口
- **格式**: PascalCase
- **示例**: `AlarmService`, `UserRepository`, `NotFoundException`
- **后缀约定**:
  - Entity: 无特殊后缀 (如 `User`, `Alarm`)
  - Repository: `Repo` (内嵌接口)
  - Service: `Service`
  - Controller: `Resource` 或 `Controller`
  - DTO: `Dto` 或 `Request`/`Response`
  - Exception: `Exception`
  - Test: `Test`

#### 方法
- **格式**: camelCase
- **示例**: `getAlarmById`, `createUser`, `deleteMenu`
- **命名模式**:
  - 查询: `get*`, `find*`, `list*`, `count*`
  - 创建: `create*`
  - 更新: `update*`
  - 删除: `delete*`
  - 验证: `validate*`, `check*`
  - 转换: `mapTo*`, `convertTo*`

#### 变量
- **格式**: camelCase
- **示例**: `alarmId`, `userName`, `menuList`
- **集合变量**: 复数形式 (`users`, `alarms`, `menus`)

#### 常量
- **格式**: UPPER_SNAKE_CASE
- **位置**: 嵌套静态类 `Constants`
- **示例**:
```java
public class Constants {
    public static class Alarm {
        public static final String STATUS_NEW = "NEW";
        public static final String STATUS_ACKNOWLEDGED = "ACKNOWLEDGED";
    }
}
```

#### 数据库字段
- **格式**: snake_case
- **示例**: `tenant_id`, `created_at`, `user_name`

### TypeScript

#### 文件
- **组件**: PascalCase.tsx (`UserList.tsx`)
- **工具**: camelCase.ts (`apiClient.ts`)
- **类型**: PascalCase.ts (`UserTypes.ts`)

#### 变量/函数
- **格式**: camelCase
- **示例**: `fetchUsers`, `handleSubmit`, `userList`

#### 组件
- **格式**: PascalCase
- **示例**: `UserList`, `AlarmDetail`, `MenuTree`

#### 接口/类型
- **格式**: PascalCase
- **示例**: `User`, `AlarmResponse`, `MenuProps`
- **Props 后缀**: `*Props`
- **State 后缀**: `*State`

#### 常量
- **格式**: UPPER_SNAKE_CASE
- **示例**: `API_BASE_URL`, `DEFAULT_PAGE_SIZE`

## 注释规范

### Java

#### 类注释
```java
/**
 * 用户实体
 *
 * <p>对应数据库表: users
 */
@Entity
@Table(name = "users")
public class User extends BaseEntity {
```

#### 字段注释
```java
/*
 * 用户名
 */
@Column(name = "username", nullable = false)
public String username;
```

#### 方法注释
```java
/**
 * 更新告警严重程度
 *
 * @param newSeverity 新的严重程度
 */
public void updateAlarmSeverity(Constants.Alarm.Severity newSeverity) {
```

#### 公共 API 必须有 Javadoc
- 所有 public 方法
- 所有 REST 端点
- 所有 GraphQL 查询/变更

### TypeScript

#### 组件注释
```typescript
/**
 * 用户列表组件
 * 显示系统中所有用户，支持搜索和过滤
 */
export const UserList: React.FC<UserListProps> = () => {
```

#### 函数注释
```typescript
/**
 * 获取用户列表
 * @param page 页码
 * @param size 每页大小
 * @returns 用户列表响应
 */
const fetchUsers = async (page: number, size: number): Promise<UserResponse> => {
```

## 代码组织

### Java 类结构
```java
// 1. 包声明
package pro.walkin.ams.admin.service;

// 2. 导入
import io.quarkus.hibernate.panache.PanacheRepository;
import jakarta.persistence.*;
import java.time.Instant;

// 3. 类注释
/**
 * 用户服务
 */
// 4. 类注解
@ApplicationScoped
@Transactional
// 5. 类声明
public class UserService {
    
    // 6. 常量
    private static final Logger LOG = LoggerFactory.getLogger(UserService.class);
    private static final int MAX_RETRY = 3;
    
    // 7. 依赖注入
    @Inject
    User.Repo userRepo;
    
    // 8. 公共方法
    public User getUserById(Long id) {
        // ...
    }
    
    // 9. 私有方法
    private void validateUser(User user) {
        // ...
    }
    
    // 10. 内部类
    public static class UserDto {
        // ...
    }
}
```

### React 组件结构
```typescript
// 1. 导入
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/userApi';

// 2. 类型定义
interface UserListProps {
  tenantId: number;
}

// 3. 组件定义
export const UserList: React.FC<UserListProps> = ({ tenantId }) => {
  // 3.1 Hooks
  const [page, setPage] = useState(0);
  const { data, isLoading } = useQuery(['users', tenantId, page], 
    () => userApi.getUsers(tenantId, page)
  );
  
  // 3.2 事件处理
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  // 3.3 渲染
  if (isLoading) {
    return <Loading />;
  }
  
  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
};
```

## 最佳实践

### 依赖注入
```java
// ✅ 正确
@Inject
User.Repo userRepo;

// ❌ 错误
User.Repo userRepo = new User.Repo();
```

### 空值检查
```java
// ✅ 正确
Objects.requireNonNull(id, "ID不能为空");
if (user == null) {
    throw new NotFoundException("User", id.toString());
}

// ❌ 错误
if (id != null) {
    // 没有抛出异常
}
```

### 集合初始化
```java
// ✅ 正确
public Set<Role> roles = new HashSet<>();
public List<Permission> permissions = new ArrayList<>();

// ❌ 错误
public Set<Role> roles; // 未初始化
```

### 日志规范
```java
// ✅ 正确
LOG.debug("创建用户成功: id={}, username={}", user.id, user.username);
LOG.error("创建用户失败: tenantId={}", tenantId, e);

// ❌ 错误
System.out.println("创建用户成功"); // 不使用 System.out
LOG.info("用户: " + user); // 不使用字符串拼接
```
