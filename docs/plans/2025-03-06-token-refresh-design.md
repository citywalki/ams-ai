# Token 自动刷新机制设计

**日期**: 2025-03-06  
**状态**: 已批准待实现  
**作者**: AI Assistant

---

## 1. 问题描述

当前系统的 token 刷新机制存在问题：

- 系统已存储 `accessToken` 和 `refreshToken`
- 当 `accessToken` 过期返回 401 时，系统**没有尝试使用 refreshToken 刷新**
- 而是直接清除 token 并提示"登录已过期，请重新登录"
- 用户体验差，需要重新登录

## 2. 方案概述

采用**被动刷新**方案：当请求返回 401 时，自动使用 refreshToken 换取新的 accessToken，然后重试原请求。

### 后端接口

```
POST /api/auth/refresh
Content-Type: application/json

Request:
{
  "refreshToken": "string"
}

Response (200):
{
  "accessToken": "new-access-token"
}

Response (401 - 刷新失败):
{
  "error": "INVALID_TOKEN",
  "message": "Invalid or expired refresh token"
}
```

**注意**: 后端只返回新的 `accessToken`，`refreshToken` 保持不变。

## 3. 架构设计

### 3.1 请求流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          请求流程                                        │
└─────────────────────────────────────────────────────────────────────────┘

    发起请求
        │
        ▼
    ┌───────────────────────┐
    │  请求拦截器            │  添加 Bearer Token
    └───────────────────────┘
        │
        ▼
    发送请求到后端
        │
        ├──────────────────┬──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    成功(200)         Token过期(401)        其他错误
        │                  │                  │
        ▼                  ▼                  ▼
    返回响应          ┌──────────┐         返回错误
                      │刷新队列? │
                      │  空闲中   │
                      └────┬─────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
           是: 发起刷新               否: 等待刷新完成
              │                         │
              ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │ POST /auth/refresh│      │ 使用新token重试   │
    │ (加入队列锁定)    │      │ 原请求            │
    └──────────────────┘      └──────────────────┘
              │
              ▼
    ┌──────────────────┐
    │ 刷新成功?         │
    └──────┬─────┬─────┘
           │     │
           是    否
           │     │
           ▼     ▼
    ┌────────┐  ┌─────────────┐
    │更新token│  │ 清除token   │
    │重试请求 │  │ 跳转登录页  │
    └────────┘  └─────────────┘
```

### 3.2 核心机制

**刷新队列机制**:
- 使用状态变量确保只有一个刷新请求在进行中
- 并发请求在等待刷新完成后，统一使用新 token 重试

**关键变量**:
```typescript
let isRefreshing = false;                              // 是否正在刷新
let refreshSubscribers: ((token: string) => void)[];  // 等待队列
```

**队列工作流程**:
1. 请求返回 401 时，检查 `isRefreshing`
2. 如果空闲，设置 `isRefreshing = true`，发起刷新请求
3. 如果正在刷新，将重试回调加入 `refreshSubscribers` 队列
4. 刷新成功后，遍历队列通知所有等待的请求使用新 token 重试
5. 刷新失败，清除 token 并跳转到登录页

## 4. 关键实现细节

### 4.1 Axios 响应拦截器

```typescript
restClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 非 401 错误或已重试过，直接返回错误
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // 标记为重试过，防止循环
    originalRequest._retry = true;
    
    if (!isRefreshing) {
      // 发起刷新
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        // 更新存储
        localStorage.setItem('token', newToken);
        // 通知等待队列
        refreshSubscribers.forEach(callback => callback(newToken));
        refreshSubscribers = [];
        // 重试原请求
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return restClient(originalRequest);
      } catch (refreshError) {
        // 刷新失败，登出
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else {
      // 等待刷新完成
      return new Promise((resolve) => {
        refreshSubscribers.push((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(restClient(originalRequest));
        });
      });
    }
  }
);
```

### 4.2 刷新函数

```typescript
async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  // 使用新的 axios 实例避免拦截器循环
  const response = await axios.post('/api/auth/refresh', { refreshToken });
  return response.data.accessToken;
}
```

## 5. 错误处理

| 场景 | 处理方式 |
|------|----------|
| refreshToken 不存在 | 直接跳转到登录页 |
| refreshToken 过期/无效 (401) | 清除所有 token，提示"登录已过期"，跳转到登录页 |
| 刷新请求网络错误 | 视为刷新失败，跳转到登录页 |
| 其他 API 错误 (非 401) | 正常返回错误，不触发刷新 |

## 6. 边界情况

### 6.1 并发请求
- 使用 `isRefreshing` 锁确保只有一个刷新请求
- 其他并发请求加入队列等待刷新完成

### 6.2 多个 401 请求
- 第一个请求触发刷新
- 后续请求加入队列
- 刷新成功后，所有请求统一使用新 token 重试

### 6.3 刷新失败
- 清除所有 token (localStorage + Zustand store)
- 显示错误提示
- 跳转到登录页

### 6.4 刷新接口本身返回 401
- 说明 refreshToken 也过期了
- 执行登出流程

## 7. 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `app-web/src/shared/api/rest-client.ts` | 修改 | 添加响应拦截器的刷新逻辑 |
| `app-web/src/store/auth-store.ts` | 可选修改 | 确保 logout 清除所有状态 |

## 8. 测试要点

1. **正常刷新**: accessToken 过期后自动刷新并重试请求
2. **并发刷新**: 多个请求同时 401，只发起一次刷新，所有请求都成功
3. **刷新失败**: refreshToken 过期时正确跳转到登录页
4. **刷新接口 401**: 正确处理刷新接口返回的 401
5. **无 refreshToken**: 没有 refreshToken 时直接跳转登录页

---

**下一步**: 调用 `writing-plans` skill 创建详细实现计划
