# Token 自动刷新机制实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 Axios 响应拦截器中实现 token 自动刷新机制，当 accessToken 过期返回 401 时，自动使用 refreshToken 换取新 token 并重试原请求。

**Architecture:** 采用被动刷新策略，使用状态锁（isRefreshing）确保并发请求只发起一次刷新，其他请求加入队列等待刷新完成后统一重试。刷新失败时清除 token 并跳转到登录页。

**Tech Stack:** React, TypeScript, Axios, Zustand, React Router

---

## 前置阅读

阅读以下文件了解当前实现：
- `app-web/src/shared/api/rest-client.ts` - Axios 配置和拦截器
- `app-web/src/store/auth-store.ts` - 认证状态管理
- `docs/plans/2025-03-06-token-refresh-design.md` - 详细设计文档

---

## Task 1: 阅读当前 rest-client.ts 文件

**Files:**
- Read: `app-web/src/shared/api/rest-client.ts`

**Step 1: 读取文件内容**

```bash
cat app-web/src/shared/api/rest-client.ts
```

**Expected:** 文件包含 axios 实例创建、请求拦截器（添加 Bearer Token）、响应拦截器（处理 401 错误）

---

## Task 2: 添加刷新队列状态变量

**Files:**
- Modify: `app-web/src/shared/api/rest-client.ts`（在 axios 实例创建之前添加）

**Step 1: 添加刷新队列状态变量**

```typescript
// Token 刷新队列管理
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}
```

**Step 2: 导入必要的类型**

```typescript
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
```

**Step 3: 提交变更**

```bash
git add app-web/src/shared/api/rest-client.ts
git commit -m "chore: add token refresh queue state management"
```

---

## Task 3: 创建刷新 token 函数

**Files:**
- Modify: `app-web/src/shared/api/rest-client.ts`

**Step 1: 在 restClient 实例创建之后，拦截器之前添加刷新函数**

```typescript
/**
 * 刷新 accessToken
 * 使用新的 axios 实例避免拦截器循环
 */
async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  // 创建临时 axios 实例，避免触发拦截器
  const tempClient = axios.create({
    baseURL: restClient.defaults.baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  const response = await tempClient.post<{ accessToken: string }>(
    '/api/auth/refresh',
    { refreshToken }
  );
  
  return response.data.accessToken;
}
```

**Step 2: 提交变更**

```bash
git add app-web/src/shared/api/rest-client.ts
git commit -m "feat: add refreshAccessToken function"
```

---

## Task 4: 修改响应拦截器实现自动刷新

**Files:**
- Modify: `app-web/src/shared/api/rest-client.ts`（替换现有的响应拦截器）

**Step 1: 替换响应拦截器**

```typescript
// 响应拦截器 - 处理 token 过期
restClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // 非 401 错误或已重试过，直接返回错误
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // 避免循环重试
    originalRequest._retry = true;
    
    if (isRefreshing) {
      // 如果正在刷新，加入队列等待
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(restClient(originalRequest));
        });
      });
    }
    
    // 开始刷新
    isRefreshing = true;
    
    try {
      const newToken = await refreshAccessToken();
      
      // 更新本地存储
      localStorage.setItem('token', newToken);
      
      // 更新 Zustand store（如果使用了 auth-store）
      const { setToken } = useAuthStore.getState();
      setToken(newToken);
      
      // 通知所有等待的请求
      onRefreshed(newToken);
      
      // 重试原请求
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return restClient(originalRequest);
    } catch (refreshError) {
      // 刷新失败，执行登出
      isRefreshing = false;
      refreshSubscribers = [];
      
      // 清除 token
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // 更新 Zustand store
      const { logout } = useAuthStore.getState();
      logout();
      
      // 显示错误提示
      toast.error('登录已过期，请重新登录');
      
      // 跳转到登录页
      window.location.href = '/login';
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
```

**Step 2: 导入 useAuthStore**

```typescript
import { useAuthStore } from '@/store/auth-store';
```

**Step 3: 提交变更**

```bash
git add app-web/src/shared/api/rest-client.ts
git commit -m "feat: implement automatic token refresh in axios interceptor"
```

---

## Task 5: 验证 auth-store 包含必要的方法

**Files:**
- Read: `app-web/src/store/auth-store.ts`

**Step 1: 检查 store 是否包含 setToken 和 logout 方法**

```bash
grep -n "setToken\|logout" app-web/src/store/auth-store.ts
```

**Expected:** 
- 应该有 `setToken` 方法用于更新 token
- 应该有 `logout` 方法用于清除状态

**Step 2: 如果没有 setToken 方法，添加它**

```typescript
setToken: (token: string) => set({ token }),
```

**Step 3: 提交变更（如果需要）**

```bash
git add app-web/src/store/auth-store.ts
git commit -m "feat: add setToken method to auth store"
```

---

## Task 6: 测试 - 验证手动场景

**Files:**
- Run: Manual test

**Step 1: 启动开发服务器**

```bash
cd app-web && pnpm dev
```

**Step 2: 登录并检查 token**

1. 访问 http://localhost:5173/login
2. 使用测试账号登录
3. 打开浏览器 DevTools → Application → Local Storage
4. 确认 `token` 和 `refreshToken` 都已存储

**Step 3: 模拟 token 过期**

1. 在 DevTools Console 执行：
```javascript
localStorage.setItem('token', 'invalid-token');
```

2. 在页面中触发任意 API 请求（比如刷新页面或点击按钮）

**Expected Result:**
- 网络面板应看到：
  1. 第一个请求返回 401
  2. 自动发起 `POST /api/auth/refresh` 请求
  3. 刷新成功后重试原请求（返回 200）
  4. Local Storage 中的 token 已更新

**Step 4: 测试刷新失败场景**

1. 清除 refreshToken：
```javascript
localStorage.removeItem('refreshToken');
localStorage.setItem('token', 'invalid-token');
```

2. 触发 API 请求

**Expected Result:**
- 显示 "登录已过期，请重新登录" 提示
- 跳转到登录页
- Local Storage 被清空

---

## Task 7: 修复可能的 TypeScript 错误

**Files:**
- Modify: `app-web/src/shared/api/rest-client.ts`

**Step 1: 运行 TypeScript 检查**

```bash
cd app-web && pnpm tsc --noEmit
```

**Step 2: 修复所有类型错误**

常见问题及修复：

1. **AxiosError 类型错误**:
```typescript
import type { AxiosError } from 'axios';
```

2. **InternalAxiosRequestConfig 类型错误**:
```typescript
import type { InternalAxiosRequestConfig } from 'axios';
```

3. **window.location 类型**:
```typescript
// 可能需要类型断言
(window as Window).location.href = '/login';
```

**Step 3: 提交修复**

```bash
git add app-web/src/shared/api/rest-client.ts
git commit -m "fix: resolve TypeScript type errors in token refresh"
```

---

## Task 8: 代码审查和简化

**Files:**
- Review: `app-web/src/shared/api/rest-client.ts`

**Step 1: 检查代码是否符合项目规范**

- 使用单引号还是双引号？
- 缩进是否正确（2 空格）？
- 是否有未使用的导入？

**Step 2: 运行 lint**

```bash
cd app-web && pnpm lint
```

**Step 3: 修复 lint 错误**

```bash
cd app-web && pnpm lint --fix
```

**Step 4: 提交最终版本**

```bash
git add app-web/src/shared/api/rest-client.ts
git commit -m "refactor: polish token refresh implementation"
```

---

## Task 9: 最终验证

**Files:**
- Test: Full flow

**Step 1: 完整测试清单**

- [ ] 正常登录后 token 存储正确
- [ ] accessToken 过期后自动刷新成功
- [ ] 刷新成功后原请求重试成功
- [ ] 并发请求只触发一次刷新
- [ ] refreshToken 过期后正确跳转到登录页
- [ ] 无 refreshToken 时正确跳转到登录页

**Step 2: 提交完成**

```bash
git log --oneline -5
```

**Expected:** 看到所有提交记录

---

## 注意事项

### 1. 不要修改的地方

- **保留原有的请求拦截器**：它负责从 localStorage 读取 token 并添加到请求头
- **保留错误提示**：使用 toast 显示错误信息
- **保留路由跳转逻辑**：使用 window.location.href 跳转

### 2. 边界情况处理

- **刷新接口本身返回 401**：已经处理，会执行登出
- **网络错误**：catch 块会捕获并重定向
- **并发请求**：使用 isRefreshing 锁和队列机制

### 3. 代码风格

- 使用函数式风格（const/let）
- 添加必要的注释
- 错误处理要完整

---

## 回滚计划

如果出现问题，回滚命令：

```bash
git log --oneline
# 找到刷新机制之前的 commit
git revert <commit-hash>..HEAD
```

或者手动恢复：

```bash
git checkout HEAD~5 -- app-web/src/shared/api/rest-client.ts
git checkout HEAD~5 -- app-web/src/store/auth-store.ts
```
