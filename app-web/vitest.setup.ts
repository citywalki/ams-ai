import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "@/shared/test/msw/server";

// 在所有测试之前启动 MSW
beforeAll(() => {
  server.listen({ onUnhandledRequest: "warn" });
});

// 每个测试后重置 MSW 处理器
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// 所有测试后关闭 MSW
afterAll(() => {
  server.close();
});

// Mock matchMedia
global.matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
