# feature-admin 管理后台功能

**Generated:** 2026-02-24 11:36
**Commit:** (当前Git提交)

## OVERVIEW

feature-admin 提供 AMS-AI 的管理后台功能，包含用户、角色、权限、菜单等系统管理功能，采用 RESTful API 设计和 React 前端界面。

## WHERE TO LOOK

- `controller/` - 管理控制器：用户、角色、权限、菜单 CRUD
- `service/` - 业务服务：用户管理、角色管理、权限检查
- `entity/` - 业务实体：扩展基础实体的业务方法
- `web/` - 前端页面：React 组件和管理界面

## STRUCTURE

```
feature-admin/
├── src/main/java/pro/walkin/ams/admin/system/
│   ├── controller/
│   │   ├── UserController.java         # 用户管理控制器
│   │   ├── RoleController.java         # 角色管理控制器
│   │   ├── PermissionController.java   # 权限管理控制器
│   │   └── MenuController.java         # 菜单管理控制器
│   ├── service/
│   │   ├── UserService.java            # 用户管理服务
│   │   ├── RoleService.java            # 角色管理服务
│   │   ├── PermissionService.java     # 权限管理服务
│   │   └── MenuService.java            # 菜单管理服务
│   ├── entity/
│   │   ├── User.java                   # 用户实体（扩展）
│   │   ├── Role.java                   # 角色实体（扩展）
│   │   └── Permission.java             # 权限实体（扩展）
│   └── dto/                           # 数据传输对象
│       ├── user/
│       │   ├── UserCreateRequest.java
│       │   ├── UserUpdateRequest.java
│       │   └── UserResponse.java
│       ├── role/
│       │   ├── RoleCreateRequest.java
│       │   ├── RoleUpdateRequest.java
│       │   └── RoleResponse.java
│       └── permission/
│           ├── PermissionCreateRequest.java
│           ├── PermissionUpdateRequest.java
│           └── PermissionResponse.java
└── src/main/resources/
    └── application-admin.yml          # 管理功能配置
```

## CONVENTIONS

- **手动租户过滤**: 所有查询方法必须使用 `TenantContext.getCurrentTenantId()` 过滤
- **异常处理**: 使用 `BaseException` 子类和全局异常处理器
- **权限验证**: 在控制器级别进行权限检查，确保数据安全
- **RESTful 设计**: 遵循 REST 规范，使用标准 HTTP 方法

## API 端点

### 用户管理

```bash
GET    /api/system/users              # 分页查询用户
GET    /api/system/users/{id}          # 获取用户详情
POST   /api/system/users              # 创建用户
PUT    /api/system/users/{id}          # 更新用户
DELETE /api/system/users/{id}          # 删除用户
PUT    /api/system/users/{id}/status  # 启用/禁用用户
PUT    /api/system/users/{id}/reset-password # 重置密码
```

### 角色管理

```bash
GET    /api/system/roles              # 分页查询角色
GET    /api/system/roles/{id}          # 获取角色详情
POST   /api/system/roles              # 创建角色
PUT    /api/system/roles/{id}          # 更新角色
DELETE /api/system/roles/{id}          # 删除角色
PUT    /api/system/roles/{id}/permissions # 分配权限
```

### 权限管理

```bash
GET    /api/system/permissions        # 查询所有权限
GET    /api/system/permissions/{id}  # 获取权限详情
POST   /api/system/permissions        # 创建权限
PUT    /api/system/permissions/{id}  # 更新权限
DELETE /api/system/permissions/{id}  # 删除权限
GET    /api/system/permissions/user   # 获取用户权限
```

### 菜单管理

```bash
GET    /api/system/menus              # 查询菜单树
GET    /api/system/menus/{id}          # 获取菜单详情
POST   /api/system/menus              # 创建菜单
PUT    /api/system/menus/{id}          # 更新菜单
DELETE /api/system/menus/{id}          # 删除菜单
PUT    /api/system/menus/{id}/sort     # 调整菜单排序
```

## 租户过滤实现

### 正确的租户过滤模式

```java
@Service
@ApplicationScoped
public class UserService {
    
    @Inject
    User.Repo userRepo;
    
    @Inject
    TenantContext tenantContext;
    
    // 正确：手动租户过滤
    public List<User> findAll() {
        Long tenantId = tenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }
        return userRepo.list("tenant", tenantId);
    }
    
    // 正确：分页查询带租户过滤
    public PageResponse<User> findUsers(PageRequest pageRequest) {
        Long tenantId = tenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return PageResponse.empty();
        }
        
        PanacheQuery<User> query = userRepo.find("tenant", tenantId);
        long total = query.count();
        List<User> users = query.page(pageRequest.getPageNum(), pageRequest.getPageSize())
                               .list();
        
        return PageResponse.of(users, total, pageRequest.getPageNum(), pageRequest.getPageSize());
    }
}
```

### 错误的租户过滤示例

```java
// 错误：缺少租户过滤
public List<User> findAll() {
    return userRepo.findAll().list();  // 会查询所有租户的数据
}
```

## 权限管理功能

### 权限分配

```java
@Service
public class PermissionService {
    
    @Inject
    RolePermission.Repo rolePermissionRepo;
    
    @Transactional
    public void assignPermissions(Long roleId, Set<Long> permissionIds) {
        // 删除原有权限分配
        rolePermissionRepo.deleteByRoleId(roleId);
        
        // 添加新的权限分配
        for (Long permissionId : permissionIds) {
            RolePermission rp = new RolePermission();
            rp.setRoleId(roleId);
            rp.setPermissionId(permissionId);
            rolePermissionRepo.persist(rp);
        }
    }
    
    @Transactional
    public void removePermissions(Long roleId, Set<Long> permissionIds) {
        rolePermissionRepo.deleteByRoleIdAndPermissionIds(roleId, permissionIds);
    }
}
```

### 用户权限检查

```java
@Service
public class UserService {
    
    @Inject
    RbacService rbacService;
    
    @Inject
    TenantContext tenantContext;
    
    public boolean hasUserPermission(Long userId, String permissionCode) {
        Set<String> userPermissions = rbacService.getUserPermissions(
            userId, 
            tenantContext.getCurrentTenantId()
        );
        return userPermissions.contains(permissionCode);
    }
}
```

## 前端组件结构

### 用户管理页面

```typescript
// app-web/src/pages/admin/user-management.tsx
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await systemApi.getUsers();
      setUsers(response.data);
    } catch (error) {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreate = async (user: UserCreateRequest) => {
    await systemApi.createUser(user);
    message.success('创建用户成功');
    loadUsers();
  };
  
  const handleUpdate = async (id: number, user: UserUpdateRequest) => {
    await systemApi.updateUser(id, user);
    message.success('更新用户成功');
    loadUsers();
  };
  
  const handleDelete = async (id: number) => {
    await systemApi.deleteUser(id);
    message.success('删除用户成功');
    loadUsers();
  };
  
  return (
    <div className="user-management">
      <UserForm onSubmit={handleCreate} />
      <UserTable 
        users={users} 
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
};
```

## 安全注意事项

1. **租户隔离**: 确保所有查询操作都包含租户过滤
2. **权限验证**: 在控制器和业务层进行双重权限检查
3. **数据验证**: 使用 Jakarta Validation 验证输入数据
4. **异常处理**: 统一异常处理，避免敏感信息泄露
5. **操作日志**: 记录关键操作，便于审计和追踪

## 测试规范

- **集成测试**: 使用 `@QuarkusTest` 测试控制器端点
- **服务测试**: 测试业务逻辑和租户过滤
- **权限测试**: 验证不同角色的访问权限
- **前端测试**: 使用 React Testing Library 测试组件行为
- **API测试**: 使用 Postman 或 REST assured 测试 API 端点

## 前端权限控制

```typescript
// app-web/src/hooks/usePermission.ts
export const usePermission = (permission: string) => {
  const { permissions } = usePermissions();
  return permissions.includes(permission);
};

// 使用示例
const UserManagement: React.FC = () => {
  const hasUserCreatePermission = usePermission('admin:users:create');
  const hasUserDeletePermission = usePermission('admin:users:delete');
  
  return (
    <div>
      {hasUserCreatePermission && <UserCreateForm />}
      {hasUserDeletePermission && <DeleteButton />}
    </div>
  );
};
```

## 性能优化

1. **分页查询**: 所有列表查询都支持分页
2. **缓存策略**: 权限信息使用缓存减少数据库查询
3. **批量操作**: 支持批量用户操作提高效率
4. **懒加载**: 前端组件按需加载减少首屏时间