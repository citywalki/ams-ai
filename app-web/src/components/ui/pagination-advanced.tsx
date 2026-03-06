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
