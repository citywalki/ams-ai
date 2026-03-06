import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaginationAdvanced } from "./pagination-advanced";
import { calculateTotalPages, getPageNumbers } from "./pagination-utils";

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

  it("should render quick jumper when enabled", () => {
    render(<PaginationAdvanced {...defaultProps} showQuickJumper />);
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
    render(<PaginationAdvanced {...defaultProps} onChange={onChange} showQuickJumper />);
    
    const input = screen.getByRole("spinbutton");
    await userEvent.type(input, "5");
    await userEvent.click(screen.getByRole("button", { name: "确定" }));
    
    expect(onChange).toHaveBeenCalledWith(5, 10);
  });

  it("should handle quick jump with Enter key", async () => {
    const onChange = vi.fn();
    render(<PaginationAdvanced {...defaultProps} onChange={onChange} showQuickJumper />);

    const input = screen.getByRole("spinbutton");
    await userEvent.type(input, "3");
    await userEvent.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith(3, 10);
  });

  it("should clamp jump value to valid range", async () => {
    const onChange = vi.fn();
    render(<PaginationAdvanced {...defaultProps} onChange={onChange} showQuickJumper />);

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
    render(
      <PaginationAdvanced
        {...defaultProps}
        page={10}
        onChange={onChange}
      />
    );
    
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
