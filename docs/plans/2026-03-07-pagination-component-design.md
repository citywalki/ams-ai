# 分页器组件设计文档

**日期**: 2026-03-07  
**主题**: 专业版分页器组件封装

## 1. 需求背景

项目中已有的 `pagination.tsx` 提供基础的分页原子组件（`Pagination`, `PaginationItem`, `PaginationLink` 等），但缺乏高级封装版本。需要封装一个专业版分页器，整合页码导航、每页条数选择、总条数显示和快速跳转功能。

## 2. 设计方案

### 2.1 架构模式

采用**受控组件模式**（Controlled Component Pattern）：
- 状态完全由父组件管理
- 便于与 URL query 参数同步
- 支持外部控制（如筛选条件变化时重置分页）
- 相比半受控模式更易于测试和调试

### 2.2 API 接口

```typescript
interface PaginationProps {
  /** 当前页码（从1开始） */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 总条数 */
  total: number;
  /** 页码/每页条数变化回调 */
  onChange: (page: number, pageSize: number) => void;
  /** 可选的每页条数选项，默认 [10, 20, 50, 100] */
  pageSizeOptions?: number[];
  /** 是否显示总条数信息，默认 true */
  showTotal?: boolean;
  /** 是否显示每页条数选择器，默认 true */
  showSizeChanger?: boolean;
  /** 是否显示快速跳转，默认 true */
  showQuickJumper?: boolean;
  /** 自定义类名 */
  className?: string;
}
```

### 2.3 组件布局

从左到右依次排列：

```
[总条数: 共 100 条]  [每页 10 条 ▼]  [< 1 2 3 ... 10 >]  [前往第 __ 页]
```

### 2.4 依赖组件

复用项目现有的 shadcn/ui 组件：
- `Select` - 每页条数选择器
- `Input` - 快速跳转输入框
- `Button` - 确认按钮
- `Pagination*` - 基础分页原子组件

### 2.5 交互行为

**页码导航**
- 最多显示 7 个页码按钮（含省略号）
- 响应式适配：小屏幕缩减显示数量
- 当前页高亮显示

**快速跳转**
- 输入框支持 Enter 键确认
- 自动校正超出范围的页码（<1 转为 1，>最大页转为最大页）
- 输入非数字时保持原值不变

**每页条数切换**
- 切换时自动计算合适的当前页，确保数据不越界
- 例如：当前在第 5 页（每页 10 条），切换到每页 50 条后，自动调整为第 1 页

### 2.6 使用示例

```tsx
import { Pagination } from "@/components/ui/pagination-advanced";

function UserListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data } = useUsers({ page, pageSize });

  return (
    <div>
      <UserTable data={data?.list} />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        onChange={(newPage, newPageSize) => {
          setPage(newPage);
          setPageSize(newPageSize);
        }}
      />
    </div>
  );
}
```

### 2.7 边界情况处理

- `total = 0`：显示"共 0 条"，禁用分页按钮
- `page > maxPage`：由父组件控制，组件正常渲染
- 快速跳转输入为空：不执行跳转
- 页面切换时保持每页条数不变

## 3. 文件位置

- 组件实现：`app-web/src/components/ui/pagination-advanced.tsx`
- 样式复用现有 Tailwind CSS，无需额外样式文件

## 4. 后续优化（可选）

- 支持简版模式（仅页码）
- 支持显示条目范围（"显示 1-10 条"）
- 支持自定义页码按钮渲染
