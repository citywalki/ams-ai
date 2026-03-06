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
