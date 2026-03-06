# app-web 前端应用

**模块特定约束**

### 技术栈

- React 18 + TypeScript 5 + Vite
- Feature-Sliced Design (FSD) 架构
- Ant Design 6.x
- Zustand 状态管理
- TanStack Query 数据获取

### API 调用规范

- **查询（读）**: 使用 GraphQL，必须封装为 hooks
- **命令（写）**: 使用 REST，必须封装为 hooks
- 所有 API 调用必须通过 TanStack Query 管理

### 数据获取示例

```typescript
// GraphQL 查询 hook
export const useAlarmConfigs = () => {
  return useQuery({
    queryKey: ['alarmConfigs'],
    queryFn: async () => {
      const response = await graphqlClient.request(ALARM_CONFIGS_QUERY);
      return response.alarmConfigs;
    }
  });
};

// REST 命令 hook
export const useUpdateAlarmConfig = () => {
  return useMutation({
    mutationFn: async (config: AlarmConfig) => {
      const response = await apiClient.put(`/api/alarm-configs/${config.id}`, config);
      return response.data;
    }
  });
};
```

### 路径别名

```typescript
// ✅ 正确
import { Button } from '@/components/ui/Button';

// ❌ 错误
import { Button } from '../../../components/ui/Button';
```

### 禁止

- ❌ 禁止直接使用 fetch/axios（必须使用封装后的 hooks）
- ❌ 禁止使用相对路径导入（必须使用 `@/*` 别名）
- ❌ 禁止在组件中直接管理状态（必须使用 Zustand）

### 常用命令

```bash
pnpm dev      # 开发模式
pnpm build    # 构建
pnpm lint     # 代码检查
```
