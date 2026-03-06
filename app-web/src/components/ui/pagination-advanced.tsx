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
      {showTotal && (
        <span className="text-muted-foreground">
          共 {total} 条
        </span>
      )}

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
