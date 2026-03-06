# Pagination Advanced Component Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 封装一个专业版分页器组件，整合页码导航、每页条数选择、总条数显示和快速跳转功能。

**Architecture:** 采用受控组件模式，状态由父组件管理。复用项目现有的 shadcn/ui 基础组件（Select, Input, Button）和 pagination 原子组件。

**Tech Stack:** React 19 + TypeScript 5.9 + Tailwind CSS 4 + shadcn/ui

---

## Task 1: 创建组件文件和类型定义

**Files:**
- Create: `app-web/src/components/ui/pagination-advanced.tsx`

**Step 1: 创建文件并定义 Props 接口**

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface PaginationAdvancedProps {
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

**Step 2: Commit**

```bash
git add app-web/src/components/ui/pagination-advanced.tsx
git commit -m "feat: create pagination-advanced component with types"
```

---

## Task 2: 实现页码计算逻辑

**Files:**
- Modify: `app-web/src/components/ui/pagination-advanced.tsx`

**Step 1: 添加页码计算工具函数**

在组件文件末尾添加（导出供测试）：

```typescript
/**
 * 计算总页数
 */
export function calculateTotalPages(total: number, pageSize: number): number {
  if (total <= 0 || pageSize <= 0) return 0;
  return Math.ceil(total / pageSize);
}

/**
 * 获取要显示的页码数组
 * 最多显示7个页码（含省略号）
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];

  if (currentPage <= 4) {
    // 当前页在前部
    for (let i = 1; i <= 5; i++) {
      pages.push(i);
    }
    pages.push("ellipsis");
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 3) {
    // 当前页在后部
    pages.push(1);
    pages.push("ellipsis");
    for (let i = totalPages - 4; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // 当前页在中间
    pages.push(1);
    pages.push("ellipsis");
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      pages.push(i);
    }
    pages.push("ellipsis");
    pages.push(totalPages);
  }

  return pages;
}
```

**Step 2: Commit**

```bash
git add app-web/src/components/ui/pagination-advanced.tsx
git commit -m "feat: add pagination calculation utilities"
```

---

## Task 3: 实现主组件结构

**Files:**
- Modify: `app-web/src/components/ui/pagination-advanced.tsx`

**Step 1: 添加组件主逻辑**

```typescript
export function PaginationAdvanced({
  page,
  pageSize,
  total,
  onChange,
  pageSizeOptions = [10, 20, 50, 100],
  showTotal = true,
  showSizeChanger = true,
  showQuickJumper = true,
  className,
}: PaginationAdvancedProps) {
  const totalPages = calculateTotalPages(total, pageSize);
  const pageNumbers = getPageNumbers(page, totalPages);
  const [jumpPage, setJumpPage] = React.useState("");

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    onChange(newPage, pageSize);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const newSize = parseInt(newPageSize, 10);
    if (isNaN(newSize) || newSize === pageSize) return;
    
    // 计算切换后的合适页码，防止越界
    const newTotalPages = calculateTotalPages(total, newSize);
    const newPage = Math.min(page, newTotalPages) || 1;
    
    onChange(newPage, newSize);
  };

  const handleJump = () => {
    const targetPage = parseInt(jumpPage, 10);
    if (isNaN(targetPage)) return;
    
    const clampedPage = Math.max(1, Math.min(targetPage, totalPages));
    handlePageChange(clampedPage);
    setJumpPage("");
  };

  const handleJumpKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJump();
    }
  };

  if (total === 0) {
    return (
      <div className={cn("flex items-center justify-between text-sm text-muted-foreground", className)}>
        <span>共 0 条</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4 text-sm", className)}>
      {/* 总条数显示 */}
      {showTotal && (
        <span className="text-muted-foreground">
          共 {total} 条
        </span>
      )}

      {/* 每页条数选择器 */}
      {showSizeChanger && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">每页</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">条</span>
        </div>
      )}

      {/* 页码导航 */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(page - 1)}
              className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {pageNumbers.map((pageNum, index) => (
            <PaginationItem key={index}>
              {pageNum === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  isActive={pageNum === page}
                  onClick={() => handlePageChange(pageNum)}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(page + 1)}
              className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* 快速跳转 */}
      {showQuickJumper && totalPages > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">前往第</span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            onKeyDown={handleJumpKeyDown}
            className="w-[60px] text-center"
            placeholder=""
          />
          <span className="text-muted-foreground">页</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleJump}
            disabled={!jumpPage}
          >
            确定
          </Button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app-web/src/components/ui/pagination-advanced.tsx
git commit -m "feat: implement pagination-advanced component"
```

---

## Task 4: 编写单元测试

**Files:**
- Create: `app-web/src/components/ui/pagination-advanced.test.tsx`

**Step 1: 编写测试文件**

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PaginationAdvanced,
  calculateTotalPages,
  getPageNumbers,
} from "./pagination-advanced";

describe("calculateTotalPages", () => {
  it("should calculate correct total pages", () => {
    expect(calculateTotalPages(100, 10)).toBe(10);
    expect(calculateTotalPages(95, 10)).toBe(10);
    expect(calculateTotalPages(100, 20)).toBe(5);
  });

  it("should return 0 for invalid inputs", () => {
    expect(calculateTotalPages(0, 10)).toBe(0);
    expect(calculateTotalPages(100, 0)).toBe(0);
    expect(calculateTotalPages(-1, 10)).toBe(0);
  });
});

describe("getPageNumbers", () => {
  it("should return all pages when total <= 7", () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageNumbers(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("should show ellipsis when current page is at start", () => {
    expect(getPageNumbers(1, 20)).toEqual([1, 2, 3, 4, 5, "ellipsis", 20]);
    expect(getPageNumbers(4, 20)).toEqual([1, 2, 3, 4, 5, "ellipsis", 20]);
  });

  it("should show ellipsis when current page is at end", () => {
    expect(getPageNumbers(20, 20)).toEqual([1, "ellipsis", 16, 17, 18, 19, 20]);
    expect(getPageNumbers(17, 20)).toEqual([1, "ellipsis", 16, 17, 18, 19, 20]);
  });

  it("should show ellipsis on both sides when in middle", () => {
    expect(getPageNumbers(10, 20)).toEqual([1, "ellipsis", 9, 10, 11, "ellipsis", 20]);
  });
});

describe("PaginationAdvanced", () => {
  const defaultProps = {
    page: 1,
    pageSize: 10,
    total: 100,
    onChange: vi.fn(),
  };

  it("should render total count", () => {
    render(<PaginationAdvanced {...defaultProps} />);
    expect(screen.getByText("共 100 条")).toBeInTheDocument();
  });

  it("should render page size selector", () => {
    render(<PaginationAdvanced {...defaultProps} />);
    expect(screen.getByText("每页")).toBeInTheDocument();
    expect(screen.getByText("条")).toBeInTheDocument();
  });

  it("should render pagination buttons", () => {
    render(<PaginationAdvanced {...defaultProps} />);
    expect(screen.getByLabelText("Go to previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to next page")).toBeInTheDocument();
  });

  it("should render quick jumper", () => {
    render(<PaginationAdvanced {...defaultProps} />);
    expect(screen.getByText("前往第")).toBeInTheDocument();
    expect(screen.getByText("页")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "确定" })).toBeInTheDocument();
  });

  it("should call onChange when page is clicked", async () => {
    const onChange = vi.fn();
    render(<PaginationAdvanced {...defaultProps} onChange={onChange} />);
    
    const page2 = screen.getByText("2");
    await userEvent.click(page2);
    
    expect(onChange).toHaveBeenCalledWith(2, 10);
  });

  it("should disable previous button on first page", () => {
    render(<PaginationAdvanced {...defaultProps} page={1} />);
    const prevButton = screen.getByLabelText("Go to previous page");
    expect(prevButton).toHaveClass("pointer-events-none");
  });

  it("should disable next button on last page", () => {
    render(<PaginationAdvanced {...defaultProps} page={10} />);
    const nextButton = screen.getByLabelText("Go to next page");
    expect(nextButton).toHaveClass("pointer-events-none");
  });

  it("should handle quick jump", async () => {
    const onChange = vi.fn();
    render(<PaginationAdvanced {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByRole("spinbutton");
    await userEvent.type(input, "5");
    await userEvent.click(screen.getByRole("button", { name: "确定" }));
    
    expect(onChange).toHaveBeenCalledWith(5, 10);
  });

  it("should handle quick jump with Enter key", async () => {
    const onChange = vi.fn();
    render(<PaginationAdvanced {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByRole("spinbutton");
    await userEvent.type(input, "3");
    await userEvent.keyboard("{Enter}");
    
    expect(onChange).toHaveBeenCalledWith(3, 10);
  });

  it("should clamp jump value to valid range", async () => {
    const onChange = vi.fn();
    render(<PaginationAdvanced {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByRole("spinbutton");
    await userEvent.type(input, "999");
    await userEvent.click(screen.getByRole("button", { name: "确定" }));
    
    expect(onChange).toHaveBeenCalledWith(10, 10);
  });

  it("should handle empty total", () => {
    render(<PaginationAdvanced {...defaultProps} total={0} />);
    expect(screen.getByText("共 0 条")).toBeInTheDocument();
  });

  it("should recalculate page when page size changes", async () => {
    const onChange = vi.fn();
    // 100条，每页10条，当前第10页
    render(
      <PaginationAdvanced
        {...defaultProps}
        page={10}
        onChange={onChange}
      />
    );
    
    // 切换到每页50条，应该自动调整到第2页（因为 100/50=2）
    const select = screen.getByRole("combobox");
    await userEvent.click(select);
    await userEvent.click(screen.getByText("50"));
    
    expect(onChange).toHaveBeenCalledWith(2, 50);
  });

  it("should hide optional elements when disabled", () => {
    render(
      <PaginationAdvanced
        {...defaultProps}
        showTotal={false}
        showSizeChanger={false}
        showQuickJumper={false}
      />
    );
    
    expect(screen.queryByText("共 100 条")).not.toBeInTheDocument();
    expect(screen.queryByText("每页")).not.toBeInTheDocument();
    expect(screen.queryByText("前往第")).not.toBeInTheDocument();
  });
});
```

**Step 2: 运行测试确保通过**

```bash
cd app-web
pnpm test pagination-advanced.test.tsx
```

Expected: All tests pass

**Step 3: Commit**

```bash
git add app-web/src/components/ui/pagination-advanced.test.tsx
git commit -m "test: add unit tests for pagination-advanced"
```

---

## Task 5: 导出组件

**Files:**
- Check: `app-web/src/components/ui/index.ts` 或类似导出文件

**Step 1: 确认组件导出**

检查 `app-web/src/components/ui/` 目录是否有统一的导出文件（如 `index.ts`），如果有，添加：

```typescript
export {
  PaginationAdvanced,
  type PaginationAdvancedProps,
} from "./pagination-advanced";
```

如果项目使用直接导入（`import { X } from "@/components/ui/x"`），则无需此步骤。

**Step 2: Commit（如需要）**

```bash
git add app-web/src/components/ui/index.ts
git commit -m "feat: export PaginationAdvanced from ui index"
```

---

## Task 6: 验证构建

**Step 1: 运行 TypeScript 检查**

```bash
cd app-web
pnpm tsc --noEmit
```

Expected: No errors

**Step 2: 运行 Lint**

```bash
cd app-web
pnpm lint
```

Expected: No errors

**Step 3: 验证构建**

```bash
cd app-web
pnpm build
```

Expected: Build succeeds

**Step 4: Commit（如需要）**

```bash
git commit -m "chore: verify build and lint pass"
```

---

## 总结

完成以上任务后，组件即可使用：

```tsx
import { PaginationAdvanced } from "@/components/ui/pagination-advanced";

<PaginationAdvanced
  page={currentPage}
  pageSize={pageSize}
  total={totalCount}
  onChange={(page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  }}
/>
```

**特性清单:**
- [x] 受控组件模式
- [x] 总条数显示
- [x] 每页条数选择器（支持自定义选项）
- [x] 页码导航（智能省略号）
- [x] 快速跳转输入框
- [x] 响应式布局
- [x] 边界情况处理（空数据、越界等）
- [x] 完整的单元测试
