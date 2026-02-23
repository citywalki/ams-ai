# 用户管理功能实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现完整的用户管理功能，包括后端CRUD API和前端管理页面

**Architecture:** 后端使用Quarkus Panache Repository模式，前端使用React + Ant Design，遵循现有角色管理页面的设计模式

**Tech Stack:** Java 25 + Quarkus 3.31.2 + Panache Next, React 18 + TypeScript 5 + Ant Design 6

---

## Task 1: 创建DTO类

**Files:**
- Create: `lib-common/src/main/java/pro/walkin/ams/common/dto/UserCreateRequest.java`
- Create: `lib-common/src/main/java/pro/walkin/ams/common/dto/UserUpdateRequest.java`
- Create: `lib-common/src/main/java/pro/walkin/ams/common/dto/UserResponse.java`

**Step 1: 创建UserCreateRequest**

```java
package pro.walkin.ams.common.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Set;

public class UserCreateRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度3-50字符")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "用户名只能包含字母、数字和下划线")
    public String username;

    @Email(message = "邮箱格式不正确")
    public String email;

    @NotBlank(message = "密码不能为空")
    @Size(min = 8, max = 100, message = "密码长度8-100字符")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", message = "密码必须包含大小写字母和数字")
    public String password;

    public Set<Long> roleIds;

    @NotBlank(message = "状态不能为空")
    public String status;
}
```

**Step 2: 创建UserUpdateRequest**

```java
package pro.walkin.ams.common.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.util.Set;

public class UserUpdateRequest {
    @Size(min = 3, max = 50, message = "用户名长度3-50字符")
    public String username;

    @Email(message = "邮箱格式不正确")
    public String email;

    public Set<Long> roleIds;

    public String status;
}
```

**Step 3: 创建UserResponse**

```java
package pro.walkin.ams.common.dto;

import java.time.Instant;
import java.util.List;

public class UserResponse {
    public Long id;
    public String username;
    public String email;
    public String status;
    public List<RoleInfo> roles;
    public Instant createdAt;
    public Instant updatedAt;

    public static class RoleInfo {
        public Long id;
        public String code;
        public String name;
    }
}
```

---

## Task 2: 扩展User Repository

**Files:**
- Modify: `lib-persistence/src/main/java/pro/walkin/ams/persistence/entity/system/User.java`

**Step 1: 添加Repository方法**

在User.Repo接口中添加：

```java
@Find
List<User> findByUsernameContaining(String username);

@Find
List<User> findByEmailContaining(String email);

@Find
List<User> findByStatus(String status);

@Find
List<User> findByTenant(Long tenant);

default List<User> findByFilters(Long tenantId, String username, String email, String status, int page, int size) {
    StringBuilder query = new StringBuilder("tenant = :tenantId");
    java.util.Map<String, Object> params = new java.util.HashMap<>();
    params.put("tenantId", tenantId);
    
    if (username != null && !username.isBlank()) {
        query.append(" and username like :username");
        params.put("username", "%" + username + "%");
    }
    if (email != null && !email.isBlank()) {
        query.append(" and email like :email");
        params.put("email", "%" + email + "%");
    }
    if (status != null && !status.isBlank()) {
        query.append(" and status = :status");
        params.put("status", status);
    }
    
    return find(query.toString(), params).page(page, size).list();
}

default long countByFilters(Long tenantId, String username, String email, String status) {
    StringBuilder query = new StringBuilder("tenant = :tenantId");
    java.util.Map<String, Object> params = new java.util.HashMap<>();
    params.put("tenantId", tenantId);
    
    if (username != null && !username.isBlank()) {
        query.append(" and username like :username");
        params.put("username", "%" + username + "%");
    }
    if (email != null && !email.isBlank()) {
        query.append(" and email like :email");
        params.put("email", "%" + email + "%");
    }
    if (status != null && !status.isBlank()) {
        query.append(" and status = :status");
        params.put("status", status);
    }
    
    return count(query.toString(), params);
}
```

---

## Task 3: 创建UserService

**Files:**
- Create: `feature-admin/src/main/java/pro/walkin/ams/admin/system/UserService.java`

**Step 1: 创建UserService类**

```java
package pro.walkin.ams.admin.system;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import pro.walkin.ams.common.dto.UserCreateRequest;
import pro.walkin.ams.common.dto.UserResponse;
import pro.walkin.ams.common.dto.UserUpdateRequest;
import pro.walkin.ams.common.exception.BusinessException;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;
import pro.walkin.ams.security.PasswordService;
import pro.walkin.ams.security.TenantContext;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@ApplicationScoped
public class UserService {

    @Inject
    User.Repo userRepo;

    @Inject
    Role.Repo roleRepo;

    @Inject
    PasswordService passwordService;

    public List<UserResponse> findAll(String username, String email, String status, int page, int size) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }

        List<User> users = userRepo.findByFilters(tenantId, username, email, status, page, size);
        return users.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long count(String username, String email, String status) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return 0;
        }
        return userRepo.countByFilters(tenantId, username, email, status);
    }

    public UserResponse findById(Long id) {
        User user = userRepo.findByIdOptional(id)
            .orElseThrow(() -> new NotFoundException("用户不存在"));
        return toResponse(user);
    }

    @Transactional
    public UserResponse create(@Valid UserCreateRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new BusinessException("租户信息缺失");
        }

        if (userRepo.findByUsername(request.username).isPresent()) {
            throw new BusinessException("用户名已存在");
        }

        User user = new User();
        user.username = request.username;
        user.email = request.email;
        user.passwordHash = passwordService.hashPassword(request.password);
        user.status = request.status;
        user.tenant = tenantId;

        if (request.roleIds != null && !request.roleIds.isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (Long roleId : request.roleIds) {
                Role role = roleRepo.findByIdOptional(roleId)
                    .orElseThrow(() -> new NotFoundException("角色不存在: " + roleId));
                roles.add(role);
            }
            user.roles = roles;
        }

        userRepo.persist(user);
        return toResponse(user);
    }

    @Transactional
    public UserResponse update(Long id, @Valid UserUpdateRequest request) {
        User user = userRepo.findByIdOptional(id)
            .orElseThrow(() -> new NotFoundException("用户不存在"));

        if (request.username != null && !request.username.equals(user.username)) {
            if (userRepo.findByUsername(request.username).isPresent()) {
                throw new BusinessException("用户名已存在");
            }
            user.username = request.username;
        }

        if (request.email != null) {
            user.email = request.email;
        }

        if (request.status != null) {
            user.status = request.status;
        }

        if (request.roleIds != null) {
            Set<Role> roles = new HashSet<>();
            for (Long roleId : request.roleIds) {
                Role role = roleRepo.findByIdOptional(roleId)
                    .orElseThrow(() -> new NotFoundException("角色不存在: " + roleId));
                roles.add(role);
            }
            user.roles = roles;
        }

        return toResponse(user);
    }

    @Transactional
    public void delete(Long id) {
        User user = userRepo.findByIdOptional(id)
            .orElseThrow(() -> new NotFoundException("用户不存在"));
        userRepo.delete(user);
    }

    @Transactional
    public void updateStatus(Long id, String status) {
        User user = userRepo.findByIdOptional(id)
            .orElseThrow(() -> new NotFoundException("用户不存在"));
        user.status = status;
    }

    @Transactional
    public void resetPassword(Long id, String newPassword) {
        User user = userRepo.findByIdOptional(id)
            .orElseThrow(() -> new NotFoundException("用户不存在"));
        user.passwordHash = passwordService.hashPassword(newPassword);
    }

    private UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.id = user.id;
        response.username = user.username;
        response.email = user.email;
        response.status = user.status;
        response.createdAt = user.createdAt;
        response.updatedAt = user.updatedAt;

        response.roles = user.roles.stream()
            .map(role -> {
                UserResponse.RoleInfo info = new UserResponse.RoleInfo();
                info.id = role.id;
                info.code = role.code;
                info.name = role.name;
                return info;
            })
            .collect(Collectors.toList());

        return response;
    }
}
```

---

## Task 4: 扩展UserController

**Files:**
- Modify: `feature-admin/src/main/java/pro/walkin/ams/admin/system/UserController.java`

**Step 1: 替换整个Controller**

```java
package pro.walkin.ams.admin.system;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.common.dto.UserCreateRequest;
import pro.walkin.ams.common.dto.UserResponse;
import pro.walkin.ams.common.dto.UserUpdateRequest;
import pro.walkin.ams.security.util.SecurityUtils;

import java.util.List;
import java.util.Map;

@Path("/api/system/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserController {

    @Inject
    UserService userService;

    @GET
    public Response findAll(
        @QueryParam("page") @DefaultValue("0") int page,
        @QueryParam("size") @DefaultValue("20") int size,
        @QueryParam("username") String username,
        @QueryParam("email") String email,
        @QueryParam("status") String status
    ) {
        List<UserResponse> users = userService.findAll(username, email, status, page, size);
        long totalCount = userService.count(username, email, status);
        long totalPages = (long) Math.ceil((double) totalCount / size);
        return ResponseBuilder.page(users, totalCount, totalPages, page, size);
    }

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id) {
        return ResponseBuilder.of(userService.findById(id));
    }

    @POST
    public Response create(@Valid UserCreateRequest request) {
        UserResponse user = userService.create(request);
        return Response.status(Response.Status.CREATED).entity(user).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, @Valid UserUpdateRequest request) {
        return ResponseBuilder.of(userService.update(id, request));
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId != null && currentUserId.equals(id)) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("message", "不能删除自己"))
                .build();
        }
        userService.delete(id);
        return Response.noContent().build();
    }

    @PUT
    @Path("/{id}/status")
    public Response updateStatus(@PathParam("id") Long id, Map<String, String> body) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId != null && currentUserId.equals(id)) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("message", "不能禁用自己"))
                .build();
        }
        String status = body.get("status");
        userService.updateStatus(id, status);
        return Response.ok().build();
    }

    @PUT
    @Path("/{id}/reset-password")
    public Response resetPassword(@PathParam("id") Long id, Map<String, String> body) {
        String newPassword = body.get("password");
        if (newPassword == null || newPassword.length() < 8) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("message", "密码长度至少8位"))
                .build();
        }
        userService.resetPassword(id, newPassword);
        return Response.ok().build();
    }
}
```

---

## Task 5: 添加用户管理菜单（Liquibase）

**Files:**
- Create: `lib-persistence/src/main/resources/db/changelog/tables/25_user_management_menu.yaml`

**Step 1: 创建Liquibase迁移**

```yaml
databaseChangeLog:
  - changeSet:
      id: 25-user-management-menu
      author: system
      changes:
        - insert:
            tableName: menus
            columns:
              - column:
                  name: id
                  valueNumeric: 7
              - column:
                  name: key
                  value: "admin:users"
              - column:
                  name: label
                  value: "用户管理"
              - column:
                  name: route
                  value: "/admin/users"
              - column:
                  name: icon
                  value: "UserOutlined"
              - column:
                  name: sort_order
                  valueNumeric: 40
              - column:
                  name: is_visible
                  valueBoolean: true
              - column:
                  name: menu_type
                  value: "MENU"
              - column:
                  name: parent_id
                  valueNumeric: 4
              - column:
                  name: tenant_id
                  valueNumeric: 1
              - column:
                  name: created_at
                  valueDate: "2026-02-23T10:00:00"
              - column:
                  name: updated_at
                  valueDate: "2026-02-23T10:00:00"

        - insert:
            tableName: permissions
            columns:
              - column:
                  name: code
                  value: "admin:users"
              - column:
                  name: name
                  value: "用户管理"
              - column:
                  name: description
                  value: "管理系统用户"
              - column:
                  name: menu_id
                  valueNumeric: 7
              - column:
                  name: sort_order
                  valueNumeric: 1
              - column:
                  name: tenant_id
                  valueNumeric: 1
              - column:
                  name: created_at
                  valueDate: "2026-02-23T10:00:00"
              - column:
                  name: updated_at
                  valueDate: "2026-02-23T10:00:00"
```

**Step 2: 更新changelog主文件**

在 `lib-persistence/src/main/resources/db/changelog/tables/tables.yaml` 添加：

```yaml
  - include:
      file: 25_user_management_menu.yaml
      relativeToChangelogFile: true
```

---

## Task 6: 前端API定义

**Files:**
- Modify: `app-web/src/utils/api.ts`

**Step 1: 添加User类型和API**

在文件末尾添加：

```typescript
export interface User {
    id: number
    username: string
    email?: string
    status: string
    roles: Array<{
        id: number
        code: string
        name: string
    }>
    createdAt?: string
    updatedAt?: string
}

export interface UserCreateRequest {
    username: string
    email?: string
    password: string
    roleIds?: number[]
    status: string
}

export interface UserUpdateRequest {
    username?: string
    email?: string
    roleIds?: number[]
    status?: string
}

export interface UserQueryParams {
    page?: number
    size?: number
    username?: string
    email?: string
    status?: string
}

// 在 systemApi 对象中添加以下方法:
export const systemApi = {
    // ... 现有方法 ...

    getUsers: (params?: UserQueryParams) =>
        apiClient.get<User[]>('/system/users', {params}),

    getUserById: (id: number) =>
        apiClient.get<User>(`/system/users/${id}`),

    createUser: (data: UserCreateRequest) =>
        apiClient.post<User>('/system/users', data),

    updateUser: (id: number, data: UserUpdateRequest) =>
        apiClient.put<User>(`/system/users/${id}`, data),

    deleteUser: (id: number) =>
        apiClient.delete(`/system/users/${id}`),

    updateUserStatus: (id: number, status: string) =>
        apiClient.put(`/system/users/${id}/status`, {status}),

    resetUserPassword: (id: number, password: string) =>
        apiClient.put(`/system/users/${id}/reset-password`, {password}),

    getRoles: (params?: any) =>
        apiClient.get<Role[]>('/system/roles', {params}),
}
```

---

## Task 7: 创建前端用户管理页面

**Files:**
- Create: `app-web/src/pages/admin/user-management.tsx`

**Step 1: 创建用户管理页面**

```tsx
import {useEffect, useState} from 'react'
import type {TableProps, FormInstance} from 'antd'
import {
    Button,
    Card,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    Radio,
} from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    KeyOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import {Role, User, UserCreateRequest, UserUpdateRequest, systemApi} from '@/utils/api'

export default function UserManagement() {
    const [form] = Form.useForm()
    const [passwordForm] = Form.useForm()
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [passwordModalVisible, setPasswordModalVisible] = useState(false)
    const [editingRecord, setEditingRecord] = useState<User | null>(null)
    const [passwordUserId, setPasswordUserId] = useState<number | null>(null)

    const [searchParams, setSearchParams] = useState({
        username: '',
        email: '',
        status: '',
    })

    const loadUsers = async () => {
        setLoading(true)
        try {
            const params: any = {}
            if (searchParams.username) params.username = searchParams.username
            if (searchParams.email) params.email = searchParams.email
            if (searchParams.status) params.status = searchParams.status

            const response = await systemApi.getUsers(params)
            setUsers(response.data || [])
        } catch (error) {
            message.error('加载用户失败')
        } finally {
            setLoading(false)
        }
    }

    const loadRoles = async () => {
        try {
            const response = await systemApi.getRoles()
            setRoles(response.data || [])
        } catch (error) {
            console.error('加载角色失败', error)
        }
    }

    useEffect(() => {
        loadUsers()
        loadRoles()
    }, [])

    const handleAdd = () => {
        setEditingRecord(null)
        setModalVisible(true)
        form.resetFields()
        form.setFieldsValue({status: 'ACTIVE'})
    }

    const handleEdit = (record: User) => {
        setEditingRecord(record)
        setModalVisible(true)
        form.setFieldsValue({
            username: record.username,
            email: record.email,
            roleIds: record.roles?.map(r => r.id),
            status: record.status,
        })
    }

    const handleDelete = async (id: number) => {
        try {
            await systemApi.deleteUser(id)
            message.success('删除成功')
            loadUsers()
        } catch (error: any) {
            message.error(error.response?.data?.message || '删除失败')
        }
    }

    const handleSubmit = async (values: any) => {
        try {
            if (editingRecord) {
                const updateData: UserUpdateRequest = {
                    username: values.username,
                    email: values.email,
                    roleIds: values.roleIds,
                    status: values.status,
                }
                await systemApi.updateUser(editingRecord.id, updateData)
                message.success('更新成功')
            } else {
                const createData: UserCreateRequest = {
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    roleIds: values.roleIds,
                    status: values.status,
                }
                await systemApi.createUser(createData)
                message.success('创建成功')
            }
            setModalVisible(false)
            loadUsers()
        } catch (error: any) {
            message.error(error.response?.data?.message || (editingRecord ? '更新失败' : '创建失败'))
        }
    }

    const handleStatusChange = async (id: number, status: string) => {
        try {
            await systemApi.updateUserStatus(id, status)
            message.success('状态更新成功')
            loadUsers()
        } catch (error: any) {
            message.error(error.response?.data?.message || '状态更新失败')
        }
    }

    const handleResetPassword = async (values: {password: string}) => {
        if (!passwordUserId) return
        try {
            await systemApi.resetUserPassword(passwordUserId, values.password)
            message.success('密码重置成功')
            setPasswordModalVisible(false)
            passwordForm.resetFields()
        } catch (error: any) {
            message.error(error.response?.data?.message || '密码重置失败')
        }
    }

    const openPasswordModal = (id: number) => {
        setPasswordUserId(id)
        setPasswordModalVisible(true)
        passwordForm.resetFields()
    }

    const handleSearch = () => {
        loadUsers()
    }

    const handleResetSearch = () => {
        setSearchParams({username: '', email: '', status: ''})
        setTimeout(loadUsers, 0)
    }

    const columns: TableProps<User>['columns'] = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            width: 120,
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            width: 180,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: (status: string) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                    {status === 'ACTIVE' ? '启用' : '禁用'}
                </Tag>
            ),
        },
        {
            title: '角色',
            dataIndex: 'roles',
            key: 'roles',
            width: 200,
            render: (roles: User['roles']) => (
                <Space size="small" wrap>
                    {roles?.map(role => (
                        <Tag key={role.id} color="blue">{role.name}</Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 160,
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<KeyOutlined />}
                        onClick={() => openPasswordModal(record.id)}
                    >
                        重置密码
                    </Button>
                    {record.status === 'ACTIVE' ? (
                        <Popconfirm
                            title="确认禁用"
                            description="确定要禁用此用户吗？"
                            onConfirm={() => handleStatusChange(record.id, 'INACTIVE')}
                            okText="确认"
                            cancelText="取消"
                        >
                            <Button type="link" size="small" danger>
                                禁用
                            </Button>
                        </Popconfirm>
                    ) : (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => handleStatusChange(record.id, 'ACTIVE')}
                        >
                            启用
                        </Button>
                    )}
                    <Popconfirm
                        title="确认删除"
                        description="确定要删除此用户吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确认"
                        cancelText="取消"
                    >
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div style={{padding: '24px'}}>
            <Card
                title="用户管理"
                extra={
                    <Button icon={<ReloadOutlined />} onClick={loadUsers}>
                        刷新
                    </Button>
                }
            >
                <Space style={{marginBottom: 16}} wrap>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        新增用户
                    </Button>
                </Space>

                <div style={{marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                    <Input
                        placeholder="用户名"
                        value={searchParams.username}
                        onChange={e => setSearchParams({...searchParams, username: e.target.value})}
                        style={{width: 150}}
                        onPressEnter={handleSearch}
                    />
                    <Input
                        placeholder="邮箱"
                        value={searchParams.email}
                        onChange={e => setSearchParams({...searchParams, email: e.target.value})}
                        style={{width: 180}}
                        onPressEnter={handleSearch}
                    />
                    <Select
                        placeholder="状态"
                        value={searchParams.status || undefined}
                        onChange={value => setSearchParams({...searchParams, status: value || ''})}
                        style={{width: 100}}
                        allowClear
                        options={[
                            {value: 'ACTIVE', label: '启用'},
                            {value: 'INACTIVE', label: '禁用'},
                        ]}
                    />
                    <Button icon={<SearchOutlined />} onClick={handleSearch}>
                        搜索
                    </Button>
                    <Button onClick={handleResetSearch}>重置</Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={users}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    scroll={{x: 1000}}
                />
            </Card>

            <Modal
                title={editingRecord ? '编辑用户' : '新增用户'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="用户名"
                        name="username"
                        rules={[
                            {required: true, message: '请输入用户名'},
                            {min: 3, max: 50, message: '用户名长度3-50字符'},
                            {pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线'},
                        ]}
                    >
                        <Input placeholder="请输入用户名"/>
                    </Form.Item>

                    <Form.Item
                        label="邮箱"
                        name="email"
                        rules={[{type: 'email', message: '邮箱格式不正确'}]}
                    >
                        <Input placeholder="请输入邮箱"/>
                    </Form.Item>

                    {!editingRecord && (
                        <Form.Item
                            label="密码"
                            name="password"
                            rules={[
                                {required: true, message: '请输入密码'},
                                {min: 8, message: '密码长度至少8位'},
                                {
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                    message: '密码必须包含大小写字母和数字',
                                },
                            ]}
                        >
                            <Input.Password placeholder="请输入密码"/>
                        </Form.Item>
                    )}

                    <Form.Item label="角色" name="roleIds">
                        <Select
                            mode="multiple"
                            placeholder="请选择角色"
                            options={roles.map(r => ({value: r.id, label: r.name}))}
                        />
                    </Form.Item>

                    <Form.Item
                        label="状态"
                        name="status"
                        rules={[{required: true, message: '请选择状态'}]}
                    >
                        <Radio.Group>
                            <Radio value="ACTIVE">启用</Radio>
                            <Radio value="INACTIVE">禁用</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingRecord ? '更新' : '创建'}
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>取消</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="重置密码"
                open={passwordModalVisible}
                onCancel={() => setPasswordModalVisible(false)}
                footer={null}
                width={400}
            >
                <Form form={passwordForm} layout="vertical" onFinish={handleResetPassword}>
                    <Form.Item
                        label="新密码"
                        name="password"
                        rules={[
                            {required: true, message: '请输入新密码'},
                            {min: 8, message: '密码长度至少8位'},
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                message: '密码必须包含大小写字母和数字',
                            },
                        ]}
                    >
                        <Input.Password placeholder="请输入新密码"/>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                确认重置
                            </Button>
                            <Button onClick={() => setPasswordModalVisible(false)}>取消</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
```

---

## Task 8: 添加路由

**Files:**
- Modify: `app-web/src/Router.tsx`

**Step 1: 导入并添加路由**

```tsx
// 添加导入
import UserManagement from '@/pages/admin/user-management'

// 在 Routes 内添加路由
<Route path="/admin/users" element={<UserManagement />} />
```

---

## Task 9: 验证构建

**Step 1: 验证后端构建**

```bash
./gradlew build -x test
```

Expected: BUILD SUCCESSFUL

**Step 2: 验证前端构建**

```bash
cd app-web && pnpm build
```

Expected: 构建成功，无TypeScript错误

---

## Task 10: 提交代码

```bash
git add .
git commit -m "feat: add user management feature

- Add UserController CRUD endpoints
- Add UserService with business logic
- Add UserCreateRequest/UserUpdateRequest/UserResponse DTOs
- Add user-management.tsx frontend page
- Add Liquibase migration for user management menu"
```
