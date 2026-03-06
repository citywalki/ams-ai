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
import { calculateTotalPages, getPageNumbers } from "./pagination-utils";

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

  const handlePageSizeChange = (newPageSize: string | null) => {
    if (newPageSize === null) return;
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
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm", className)}>
      {/* 左侧：总条数和每页条数 */}
      <div className="flex items-center gap-4">
        {showTotal && (
          <span className="text-muted-foreground whitespace-nowrap">
            共 {total} 条
          </span>
        )}

        {showSizeChanger && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground whitespace-nowrap">每页</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[70px] h-8">
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
            <span className="text-muted-foreground whitespace-nowrap">条</span>
          </div>
        )}
      </div>

      {/* 右侧：分页和快速跳转 */}
      <div className="flex items-center gap-4">
        <Pagination className="w-auto mx-0">
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
            <span className="text-muted-foreground whitespace-nowrap">前往第</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={handleJumpKeyDown}
              className="w-[60px] h-8 text-center"
              placeholder=""
            />
            <span className="text-muted-foreground whitespace-nowrap">页</span>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={handleJump}
              disabled={!jumpPage}
            >
              确定
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
