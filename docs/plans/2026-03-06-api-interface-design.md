# 前后端接口规范设计文档

**日期**: 2026-03-06  
**状态**: 待确认  
**作者**: AI Assistant  

---

## 1. 概述

本文档定义前后端接口规范，涵盖异常处理、Long类型溢出、REST和GraphQL的统一处理机制。

---

## 2. 异常处理规范

### 2.1 后端异常处理

#### 2.1.1 REST异常处理（已存在）

通过 `GlobalExceptionHandler` 统一处理，返回结构化的 `ErrorResponse`：

```java
// ErrorResponse结构
{
  "code": "VALIDATION_ERROR",      // 错误码
  "message": "请求参数验证失败",    // 错误消息
  "timestamp": "2026-03-06T10:00:00Z",
  "fieldErrors": [                 // 字段级错误（可选）
    {
      "field": "email",
      "message": "邮箱格式不正确",
      "rejectedValue": "invalid-email"
    }
  ],
  "requestId": "req-uuid-xxx"     // 请求ID（可选，用于日志追踪）
}
```

**错误码对照表**:

| HTTP状态码 | 错误码 | 使用场景 |
|-----------|--------|---------|
| 400 | `BAD_REQUEST` | 通用错误请求 |
| 400 | `VALIDATION_ERROR` | 参数验证失败（含字段错误） |
| 400 | `BUSINESS_ERROR` | 业务逻辑错误 |
| 401 | `UNAUTHORIZED` | 未认证/Token过期 |
| 403 | `FORBIDDEN` | 无权限访问 |
| 404 | `NOT_FOUND` | 资源不存在 |
| 405 | `METHOD_NOT_ALLOWED` | HTTP方法不支持 |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | 不支持的Content-Type |
| 500 | `INTERNAL_ERROR` | 服务器内部错误 |

#### 2.1.2 GraphQL异常处理（新增）

GraphQL错误需要通过自定义 `ExecutionStrategy` 或 `ExceptionHandler` 统一处理，格式与REST保持一致：

```json
{
  "errors": [
    {
      "message": "请求参数验证失败",
      "extensions": {
        "code": "VALIDATION_ERROR",
        "timestamp": "2026-03-06T10:00:00Z",
        "fieldErrors": [
          {
            "field": "email",
            "message": "邮箱格式不正确",
            "rejectedValue": "invalid-email"
          }
        ]
      }
    }
  ],
  "data": null
}
```

**关键要求**:
- 异常信息放在 `errors[0].extensions` 中，与REST格式保持一致
- HTTP状态码始终返回200（GraphQL规范），错误信息通过extensions传递
- 统一的错误码体系，REST和GraphQL共用同一套错误码

### 2.2 前端异常处理

#### 2.2.1 REST错误拦截（增强）

创建异常类：`shared/api/rest-error-handler.ts`：

```typescript
import { toast } from "sonner";

export interface ApiError {
  code: string;
  message: string;
  timestamp: string;
  fieldErrors?: Array<{
    field: string;
    message: string;
    rejectedValue: unknown;
  }>;
  requestId?: string;
}

export class ApiException extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    public readonly data: ApiError,
    message: string
  ) {
    super(message);
    this.name = "ApiException";
  }
}

export class ValidationError extends ApiException {
  constructor(data: ApiError) {
    super(data.code, 400, data, data.message);
    this.name = "ValidationError";
  }
}

export function handleRestError(error: { response?: { data: ApiError; status: number } }) {
  const response = error.response;

  if (!response) {
    toast.error("网络连接失败，请检查网络");
    return Promise.reject(new Error("Network Error"));
  }

  const data = response.data as ApiError;

  switch (response.status) {
    case 400:
      if (data.code === "VALIDATION_ERROR" && data.fieldErrors?.length) {
        return Promise.reject(new ValidationError(data));
      }
      toast.error(data.message || "请求参数错误");
      break;
    case 401:
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      toast.error("登录已过期，请重新登录");
      break;
    case 403:
      toast.error("没有权限执行此操作");
      break;
    case 404:
      toast.error("请求的资源不存在");
      break;
    case 500:
      toast.error("服务器内部错误，请稍后重试");
      console.error(`Request ID: ${data.requestId}`);
      break;
    default:
      toast.error(data.message || "未知错误");
  }

  return Promise.reject(new ApiException(data.code, response.status, data, data.message));
}
```

增强 `rest-client.ts`：

```typescript
import axios from "axios";
import { handleRestError } from "./rest-error-handler";

export const restClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

restClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

restClient.interceptors.response.use(
  (response) => response,
  (error) => handleRestError(error)
);
```

#### 2.2.2 GraphQL客户端封装（新增）

安装依赖：
```bash
cd app-web
pnpm add @urql/core wonka
```

创建 `graphql-client.ts`：
```typescript
import { createClient, errorExchange, fetchExchange } from "@urql/core";
import { toast } from "sonner";
import { handleGraphQLError } from "./graphql-error-handler";

export const graphqlClient = createClient({
  url: "/graphql",
  exchanges: [
    errorExchange({
      onError: (error) => {
        const graphQLError = error.graphQLErrors?.[0];
        if (graphQLError) {
          handleGraphQLError(graphQLError);
        } else if (error.networkError) {
          toast.error("网络连接失败，请检查网络");
        }
      },
    }),
    fetchExchange,
  ],
  fetchOptions: () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  },
  // 请求JSON格式（GraphQL规范）
  requestPolicy: "cache-and-network",
});

// 创建带认证的客户端（用于urql hooks）
export const createAuthenticatedClient = () => graphqlClient;
```

#### 2.2.3 GraphQL错误处理（新增）

创建 `graphql-error-handler.ts`：
```typescript
import { toast } from "sonner";

export interface GraphQLErrorExtensions {
  code: string;
  timestamp: string;
  fieldErrors?: Array<{
    field: string;
    message: string;
    rejectedValue: unknown;
  }>;
  requestId?: string;
}

export interface GraphQLError {
  message: string;
  extensions: GraphQLErrorExtensions;
}

export class GraphQLApiException extends Error {
  constructor(
    public readonly code: string,
    public readonly extensions: GraphQLErrorExtensions,
    message: string
  ) {
    super(message);
    this.name = "GraphQLApiException";
  }
}

export function handleGraphQLError(error: GraphQLError): void {
  const { code, message, fieldErrors } = error.extensions;
  
  switch (code) {
    case "VALIDATION_ERROR":
      if (fieldErrors?.length) {
        // 表单验证错误 - 返回给组件处理
        throw new GraphQLApiException(code, error.extensions, message);
      }
      toast.error(message);
      break;
    case "UNAUTHORIZED":
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      toast.error("登录已过期，请重新登录");
      break;
    case "FORBIDDEN":
      toast.error("没有权限执行此操作");
      break;
    case "NOT_FOUND":
      toast.error("请求的资源不存在");
      break;
    case "INTERNAL_ERROR":
      toast.error("服务器内部错误，请稍后重试");
      console.error(`Request ID: ${error.extensions.requestId}`);
      break;
    default:
      toast.error(message || "未知错误");
  }
  
  throw new GraphQLApiException(code, error.extensions, message);
}
```

---

## 3. Long类型溢出处理规范

### 3.1 问题分析

Java `Long` 类型范围：-9,223,372,036,854,775,808 ~ 9,223,372,036,854,775,807  
JavaScript `Number.MAX_SAFE_INTEGER`：9,007,199,254,740,991 (2^53 - 1)

当Java Long值超过 2^53-1 时，JavaScript解析会丢失精度。

### 3.2 解决方案

**采用方案1：后端统一将Long转为String**

#### 3.2.1 后端配置

在 `lib-common` 中配置 Jackson：

```java
package pro.walkin.ams.common.json;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import io.quarkus.jackson.ObjectMapperCustomizer;
import jakarta.inject.Singleton;

import java.io.IOException;

@Singleton
public class LongSerializerModule implements ObjectMapperCustomizer {

  @Override
  public void customize(com.fasterxml.jackson.databind.ObjectMapper mapper) {
    SimpleModule module = new SimpleModule("LongSerializer");
    module.addSerializer(Long.class, new LongSerializer());
    module.addSerializer(long.class, new LongSerializer());
    mapper.registerModule(module);
  }

  public static class LongSerializer extends JsonSerializer<Long> {
    @Override
    public void serialize(Long value, JsonGenerator gen, SerializerProvider serializers) 
        throws IOException {
      if (value == null) {
        gen.writeNull();
      } else {
        gen.writeString(value.toString());
      }
    }
    
    @Override
    public Class<Long> handledType() {
      return Long.class;
    }
  }
}
```

#### 3.2.2 反序列化处理

前端传来的String，后端需要能正确解析为Long：

```java
public class LongDeserializer extends JsonDeserializer<Long> {
  @Override
  public Long deserialize(JsonParser p, DeserializationContext ctxt) 
      throws IOException {
    String value = p.getValueAsString();
    if (value == null || value.isEmpty()) {
      return null;
    }
    try {
      return Long.parseLong(value);
    } catch (NumberFormatException e) {
      throw new ValidationException("数值超出范围", p.currentName(), value);
    }
  }
}
```

#### 3.2.3 GraphQL Long处理

在 `feature-graphql` 中注册Scalar类型：

```java
@ApplicationScoped
public class LongScalarProvider {

  @GraphQLApi
  public static class LongScalar {
    
    @Name("Long")
    public Scalar getLongScalar() {
      return Scalar.newScalar("Long")
        .description("Long type serialized as String to avoid precision loss")
        .coercing(new Coercing<Long, String>() {
          @Override
          public String serialize(Object dataFetcherResult) {
            if (dataFetcherResult instanceof Long) {
              return dataFetcherResult.toString();
            }
            throw new CoercingSerializeException("Expected Long but got " + dataFetcherResult.getClass());
          }

          @Override
          public Long parseValue(Object input) {
            if (input instanceof String) {
              try {
                return Long.parseLong((String) input);
              } catch (NumberFormatException e) {
                throw new CoercingParseValueException("Invalid Long value: " + input);
              }
            }
            throw new CoercingParseValueException("Expected String but got " + input.getClass());
          }

          @Override
          public Long parseLiteral(Object input) {
            if (input instanceof StringValue) {
              try {
                return Long.parseLong(((StringValue) input).getValue());
              } catch (NumberFormatException e) {
                throw new CoercingParseLiteralException("Invalid Long value");
              }
            }
            throw new CoercingParseLiteralException("Expected StringValue");
          }
        })
        .build();
    }
  }
}
```

### 3.3 前端处理

#### 3.3.1 TypeScript类型定义

所有后端返回的Long类型在前端定义为 `string`：

```typescript
// 修改前
interface User {
  id: number;          // ❌ 可能会溢出
  tenantId: number;    // ❌
}

// 修改后
interface User {
  id: string;          // ✅ 安全
  tenantId: string;    // ✅
}
```

#### 3.3.2 辅助函数

```typescript
// shared/utils/long-utils.ts

/**
 * 将后端Long（String）转换为前端可用的Number（仅用于数值计算，非ID）
 * 如果超出安全范围会抛出错误
 */
export function longToNumber(str: string): number {
  const num = Number(str);
  if (!Number.isSafeInteger(num)) {
    throw new Error(`Value ${str} exceeds safe integer range`);
  }
  return num;
}

/**
 * 比较两个Long字符串
 */
export function compareLong(a: string, b: string): number {
  // 去除前导零
  const aClean = a.replace(/^0+/, "") || "0";
  const bClean = b.replace(/^0+/, "") || "0";
  
  if (aClean.length !== bClean.length) {
    return aClean.length > bClean.length ? 1 : -1;
  }
  
  return aClean.localeCompare(bClean);
}
```

---

## 4. 接口调用规范

### 4.1 REST API

**协议**: REST用于写操作（Mutation）  
**Content-Type**: `application/json`  
**字符编码**: UTF-8  
**认证方式**: Bearer Token（JWT）

#### 请求格式

```http
POST /api/alarms/123 HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "RESOLVED",
  "comment": "问题已修复"
}
```

#### 响应格式

**成功响应**:
```json
{
  "data": {
    "id": "1234567890123456789",
    "status": "RESOLVED"
  }
}
```

**错误响应**（统一格式）:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "请求参数验证失败",
  "timestamp": "2026-03-06T10:00:00Z",
  "fieldErrors": [
    {
      "field": "status",
      "message": "无效的状态值",
      "rejectedValue": "INVALID_STATUS"
    }
  ]
}
```

### 4.2 GraphQL API

**协议**: GraphQL用于读操作（Query）  
**端点**: `/graphql`  
**认证方式**: 同上

#### 请求格式

```http
POST /graphql HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "query GetUser($id: Long!) { user(id: $id) { id name email } }",
  "variables": {
    "id": "1234567890123456789"
  }
}
```

#### 响应格式

**成功响应**:
```json
{
  "data": {
    "user": {
      "id": "1234567890123456789",
      "name": "张三",
      "email": "zhangsan@example.com"
    }
  }
}
```

**错误响应**（统一格式）:
```json
{
  "errors": [
    {
      "message": "用户不存在",
      "extensions": {
        "code": "NOT_FOUND",
        "timestamp": "2026-03-06T10:00:00Z"
      }
    }
  ],
  "data": null
}
```

---

## 5. 前端代码规范

### 5.1 REST调用规范

```typescript
// features/alarm/hooks/use-update-alarm.ts
import { useMutation } from "@tanstack/react-query";
import { restClient } from "@/shared/api/rest-client";

interface UpdateAlarmParams {
  id: string;  // Long类型用string
  status: string;
}

export function useUpdateAlarm() {
  return useMutation({
    mutationFn: async ({ id, status }: UpdateAlarmParams) => {
      const response = await restClient.patch(`/alarms/${id}`, { status });
      return response.data;
    },
    onError: (error) => {
      // 错误已由拦截器处理，此处可进行额外逻辑
      if (error instanceof ValidationError) {
        // 表单级错误处理
      }
    },
  });
}
```

### 5.2 GraphQL Hooks封装规范

#### 5.2.1 基础Hooks封装

创建 `shared/api/graphql-hooks.ts`：

```typescript
import { useCallback, useEffect, useState } from "react";
import { graphqlClient } from "./graphql-client";
import { GraphQLApiException } from "./graphql-error-handler";
import { toast } from "sonner";

interface UseQueryOptions {
  skip?: boolean;
}

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: GraphQLApiException | null;
  refetch: () => void;
}

export function useGraphQLQuery<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  options: UseQueryOptions = {}
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<GraphQLApiException | null>(null);

  const fetch = useCallback(async () => {
    if (options.skip) return;

    setLoading(true);
    setError(null);

    try {
      const result = await graphqlClient.query(query, variables).toPromise();
      
      if (result.error) {
        // 错误已在 errorExchange 中处理，这里捕获抛出的异常
        throw result.error;
      }
      
      setData(result.data as T);
    } catch (err) {
      if (err instanceof GraphQLApiException) {
        setError(err);
      } else if (err instanceof Error) {
        setError(new GraphQLApiException("UNKNOWN_ERROR", { code: "UNKNOWN_ERROR", timestamp: new Date().toISOString() }, err.message));
      }
    } finally {
      setLoading(false);
    }
  }, [query, JSON.stringify(variables), options.skip]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

interface UseMutationResult<T, V = unknown> {
  execute: (variables: V) => Promise<T | null>;
  loading: boolean;
  error: GraphQLApiException | null;
}

export function useGraphQLMutation<T = unknown, V = unknown>(
  mutation: string,
  options: { showSuccessToast?: string } = {}
): UseMutationResult<T, V> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GraphQLApiException | null>(null);

  const execute = useCallback(async (variables: V): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await graphqlClient.mutation(mutation, variables).toPromise();
      
      if (result.error) {
        throw result.error;
      }

      if (options.showSuccessToast) {
        toast.success(options.showSuccessToast);
      }

      return result.data as T;
    } catch (err) {
      if (err instanceof GraphQLApiException) {
        setError(err);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [mutation, options.showSuccessToast]);

  return { execute, loading, error };
}
```

#### 5.2.2 Feature Hooks示例

```typescript
// features/user/hooks/use-user.ts
import { useGraphQLQuery } from "@/shared/api/graphql-hooks";

const USER_QUERY = `
  query GetUser($id: Long!) {
    user(id: $id) {
      id
      name
      email
      tenantId
    }
  }
`;

export function useUser(id: string | null) {
  return useGraphQLQuery(
    USER_QUERY,
    id ? { id } : undefined,
    { skip: !id }
  );
}

// features/user/hooks/use-update-user.ts
import { useGraphQLMutation } from "@/shared/api/graphql-hooks";

const UPDATE_USER_MUTATION = `
  mutation UpdateUser($id: Long!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
    }
  }
`;

interface UpdateUserVariables {
  id: string;
  input: {
    name: string;
    email: string;
  };
}

export function useUpdateUser() {
  return useGraphQLMutation(UPDATE_USER_MUTATION, {
    showSuccessToast: "用户信息已更新",
  });
}
```

#### 5.2.3 组件使用示例

```tsx
// components/UserProfile.tsx
export function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error } = useUser(userId);
  const { execute: updateUser, loading: updating } = useUpdateUser();

  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage message={error.message} />;

  const handleUpdate = async (values: { name: string; email: string }) => {
    await updateUser({ id: userId, input: values });
  };

  return (
    <form onSubmit={handleUpdate}>
      <input defaultValue={user?.name} />
      <button disabled={updating}>保存</button>
    </form>
  );
}
```

---

## 6. 实施计划

### 阶段1: 后端基础配置
1. 配置Jackson Long序列化器
2. 实现GraphQL Long Scalar类型
3. 实现GraphQL异常处理器

### 阶段2: 前端基础配置
1. 安装urql依赖：`pnpm add @urql/core wonka`
2. 创建 `rest-error-handler.ts` - REST错误处理
3. 修改 `rest-client.ts` - 集成错误处理器
4. 创建 `graphql-client.ts` - GraphQL客户端配置
5. 创建 `graphql-error-handler.ts` - GraphQL错误处理
6. 创建 `graphql-hooks.ts` - React Hooks封装
7. 创建 `long-utils.ts` - Long类型工具函数
8. 创建 `shared/api/index.ts` - 统一导出

### 阶段3: 类型对齐
1. 批量修改前端TypeScript类型定义（Long -> string）
2. 后端实体Long字段保持Long，自动序列化为String

### 阶段4: 测试验证
1. 验证大数值场景（ID > 2^53）
2. 验证REST错误处理流程
3. 验证GraphQL错误处理流程
4. 验证GraphQL和REST的一致性

---

## 7. 参考实现

### 后端
- `lib-common/src/main/java/pro/walkin/ams/common/json/LongSerializerModule.java`（新增）
- `feature-graphql/src/main/java/pro/walkin/ams/graphql/config/LongScalarProvider.java`（新增）
- `feature-graphql/src/main/java/pro/walkin/ams/graphql/exception/GraphQLExceptionHandler.java`（新增）

### 前端
- `app-web/src/shared/api/rest-client.ts`（修改）
- `app-web/src/shared/api/rest-error-handler.ts`（新增）
- `app-web/src/shared/api/graphql-client.ts`（新增）
- `app-web/src/shared/api/graphql-error-handler.ts`（新增）
- `app-web/src/shared/api/graphql-hooks.ts`（新增 - urql hooks封装）
- `app-web/src/shared/api/index.ts`（新增 - 统一导出）
- `app-web/src/shared/utils/long-utils.ts`（新增）

## 8. 快速参考

### 依赖安装
```bash
# 前端
cd app-web
pnpm add @urql/core wonka
```

### 导出汇总

**前端API客户端导出**（`shared/api/index.ts`）：
```typescript
// REST客户端
export { restClient } from "./rest-client";
export { ApiException } from "./rest-error-handler";

// GraphQL客户端
export { graphqlClient } from "./graphql-client";
export { GraphQLApiException, handleGraphQLError } from "./graphql-error-handler";
export { useGraphQLQuery, useGraphQLMutation } from "./graphql-hooks";

// 工具
export { longToNumber, compareLong } from "../utils/long-utils";
```

### 使用模式对照表

| 场景 | REST | GraphQL |
|-----|------|---------|
| **查询** | TanStack Query | `useGraphQLQuery()` |
| **更新** | `useMutation()` | `useGraphQLMutation()` |
| **长整型ID** | `string` | `string` |
| **错误码** | `response.data.code` | `error.extensions.code` |
| **表单验证** | `ValidationError` | `GraphQLApiException(code: "VALIDATION_ERROR")` |

---

**下一步**: 确认本设计后，进入实施阶段。
