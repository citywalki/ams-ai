# UI 主题风格设计规范

企业级应用 AMS 前端视觉设计规范文档。

---

## 1. 项目概述

本规范基于 SAP UI5 企业级设计语言，结合 shadcn/ui 组件库实现，适用于 AMS 告警管理系统前端项目。

**技术栈**: React 19 + Tailwind CSS v4 + shadcn/ui + TypeScript

**文件位置**: `app-web/src/index.css`

---

## 2. 色彩规范

### 主色调

| 名称 | 色值 | 用途 |
|------|------|------|
| 主色/品牌色 | `#0070D2` | Primary 按钮、选中状态、图标 |
| 主色悬停 | `#005a99` | Hover 状态 |
| 选中背景 | `#EBF5FF` | 导航选中、高亮背景 |
| 选中指示器 | `#0070D2` | 右侧蓝色圆点 |

### 中性色

| 名称 | 色值 | 用途 |
|------|------|------|
| 标题文字 | `#32363A` | 主标题、重要文字 |
| 正文文字 | `#6A6D70` | 正文、次要信息 |
| 次级文字 | `#A9A9A9` | 占位符、禁用提示 |
| 边框/分割线 | `#E5E5E5` | 边框、分割线 |
| 强边框 | `#D9D9D9` | 输入框边框 |
| 背景灰 | `#F5F5F5` | 主内容区背景 |
| 浅灰 | `#FAFAFA` | 卡片悬停、次级背景 |

### 功能色

| 名称 | 色值 | 用途 |
|------|------|------|
| 成功 | `#107E3E` | 成功状态、解决率 |
| 警告 | `#E78C07` | 警告、待处理 |
| 错误 | `#D9363E` | 错误状态、致命告警 |
| 信息 | `#0A6ED1` | 提示信息 |

### CSS 变量定义

```css
:root {
  /* Primary - SAP Blue */
  --primary: #0070D2;
  --primary-foreground: #FFFFFF;
  --primary-hover: #005a99;
  
  /* Backgrounds */
  --background: #F5F5F5;
  --foreground: #32363A;
  --card: #FFFFFF;
  --card-foreground: #32363A;
  
  /* Sidebar */
  --sidebar: #FFFFFF;
  --sidebar-foreground: #32363A;
  --sidebar-primary: #0070D2;
  --sidebar-accent: #EBF5FF;
  
  /* Secondary & Accent */
  --secondary: #F5F5F5;
  --secondary-foreground: #32363A;
  --accent: #EBF5FF;
  --accent-foreground: #0070D2;
  
  /* Neutral */
  --muted: #FAFAFA;
  --muted-foreground: #6A6D70;
  --border: #E5E5E5;
  --input: #D9D9D9;
  --ring: #0070D2;
  
  /* Function Colors */
  --destructive: #D9363E;
  --success: #107E3E;
  --warning: #E78C07;
  --info: #0A6ED1;
  
  /* Radius */
  --radius: 0.5rem;  /* 8px */
}
```

---

## 3. 布局结构

### 整体布局

```
┌─────────────────────────────────────────────────────────┐
│ Header (48px) - 白色背景 + 底部阴影                      │
│ [MenuBtn] [Logo] AMS                    [通知] [用户]   │
├──────────┬──────────────────────────────────────────────┤
│ Sidebar  │                                              │
│ (240px)  │          Main Content                        │
│          │          (浅灰背景 #F5F5F5)                  │
│ 仪表盘   │                                              │
│ 告警管理 │          Dashboard Cards                     │
│ 配置     │          ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│          │          │    │ │    │ │    │ │    │      │
└──────────┴──────────┴────┴────┴────┴────┴──────────────┘
```

### 顶部标题栏 (Header)

- **高度**: 48px (`h-12`)
- **背景色**: 纯白色 `#FFFFFF`
- **阴影**: `0 1px 3px rgba(0,0,0,0.1)`
- **左侧**: 汉堡菜单 + Logo（蓝色"A"）+ "AMS" + "告警管理系统"
- **右侧**: 通知铃铛（带徽章）+ 设置图标 + 用户头像下拉

**代码参考**: `app-web/src/app/layout/header.tsx`

### 侧边导航栏 (Sidebar)

- **宽度**: 240px (`w-60`)
- **高度**: 撑满剩余视口 (`h-full`)
- **背景色**: 白色 `#FFFFFF`
- **边框**: 右侧 1px `#E5E5E5`
- **布局**: Flex 列布局，导航区可滚动，版本信息固定在底部

**导航项样式**:
- 高度: 40px
- 默认: 文字 `#6A6D70`
- Hover: 背景 `#F5F5F5`
- 选中: 背景 `#EBF5FF` + 文字 `#0070D2` + 右侧蓝色圆点

**代码参考**: `app-web/src/app/layout/sidebar.tsx`

### 主内容区 (Main Content)

- **背景色**: 浅灰 `#F5F5F5`
- **内边距**: 24px (`p-6`)
- **滚动**: 独立滚动 (`overflow-y-auto`)，不影响 Sidebar

**代码参考**: `app-web/src/app/layout/main-layout.tsx`

---

## 4. 圆角系统

| 名称 | Tailwind | 值 | 用途 |
|------|----------|-----|------|
| `radius-sm` | `rounded-sm` | 2px | 输入框、小按钮 |
| `radius-md` | `rounded` | 4px | 按钮、标签 |
| `radius-lg` | `rounded-lg` | 8px | 卡片、面板 |
| `radius-xl` | `rounded-xl` | 12px | 对话框 |
| `radius-full` | `rounded-full` | 9999px | 头像、圆形按钮 |

**CSS 变量**: `--radius: 0.5rem` (8px)

---

## 5. 阴影层级

| 层级 | 名称 | 阴影值 | 用途 |
|------|------|--------|------|
| Level 1 | 微阴影 | `0 1px 2px rgba(0,0,0,0.05)` | 静态元素 |
| Level 2 | 小阴影 | `0 2px 4px rgba(0,0,0,0.08)` | 卡片 |
| Level 3 | 中阴影 | `0 4px 12px rgba(0,0,0,0.12)` | 下拉面板 |
| Level 4 | 大阴影 | `0 8px 24px rgba(0,0,0,0.16)` | 对话框 |

**实际使用**:
- Header: `shadow-[0_1px_3px_rgba(0,0,0,0.1)]`
- Card: `shadow-[0_2px_8px_rgba(0,0,0,0.08)]`

---

## 6. 组件样式

### 按钮 (Button)

**主要按钮**:
```
背景: #0070D2
文字: 白色
圆角: 4px
Hover: #005a99
```

**次要按钮**:
```
背景: 白色
边框: 1px #D9D9D9
文字: #32363A
Hover: #F5F5F5
```

**幽灵按钮**:
```
背景: 透明
Hover: #F5F5F5
```

### 卡片 (Card)

```
背景: #FFFFFF
圆角: 8px (rounded-lg)
阴影: 0 2px 8px rgba(0,0,0,0.08)
内边距: 16-24px
边框: 1px #E5E5E5
```

**代码参考**: `app-web/src/pages/Dashboard/index.tsx`

### 输入框 (Input)

```
高度: 36-40px
边框: 1px #D9D9D9
圆角: 4px
聚焦: 边框 #0070D2 + ring
错误: 边框 #D9363E + 背景 #FFF0F0
```

### 徽章 (Badge)

**通知徽章**:
```
位置: 图标右上角
尺寸: 16-18px 圆形
背景: #D9363E
文字: 白色，10-12px
边框: 2px 白色
```

**状态徽章**:
- 致命: `bg-[#FFF0F0] text-[#D9363E] border-[#D9363E]`
- 高: `bg-[#FFFBF2] text-[#E78C07] border-[#E78C07]`
- 中: `bg-[#F5F9FF] text-[#0A6ED1] border-[#0A6ED1]`
- 低: `bg-[#F6FDF8] text-[#107E3E] border-[#107E3E]`

---

## 7. 布局模式

### Dashboard 4+1+1 布局

**第一行**: 4 个统计卡片（横向排列）
- 今日告警、待处理、已解决、平均处理时间
- 响应式: md:grid-cols-2 lg:grid-cols-4

**第二行**: 1 个全宽图表
- 告警趋势
- 高度: 300px

**第三行**: 1 个全宽列表
- 最近告警
- 左侧彩色边框标识严重级别

**代码参考**: `app-web/src/pages/Dashboard/index.tsx`

---

## 8. 响应式断点

| 断点 | 宽度 | Sidebar | Header |
|------|------|---------|--------|
| 桌面端 | >1024px | 240px 完全展开 | 完整显示 |
| 平板端 | 768-1024px | 可收起为图标模式 | 简化显示 |
| 移动端 | <768px | 抽屉模式，默认隐藏 | 汉堡菜单触发 |

---

## 9. 设计原则

### 一致性
- 所有组件遵循统一的色彩、间距和字体规范
- 交互状态（Hover、Active、Disabled）保持一致
- 圆角和阴影使用预定义的系统值

### 清晰层次
- 通过字号、字重、颜色建立视觉层次
- 重要的操作使用高对比度颜色
- 次要信息使用弱化颜色

### 响应式优先
- 所有组件需考虑移动端适配
- 触摸目标最小 44x44px

### 可访问性
- 确保颜色对比度符合 WCAG 4.5:1 标准
- 交互元素最小点击区域 44x44px
- 禁用状态清晰可见但不抢眼

---

## 10. 参考文件

- **主题变量**: `app-web/src/index.css`
- **Header**: `app-web/src/app/layout/header.tsx`
- **Sidebar**: `app-web/src/app/layout/sidebar.tsx`
- **MainLayout**: `app-web/src/app/layout/main-layout.tsx`
- **Dashboard**: `app-web/src/pages/Dashboard/index.tsx`

---

*文档更新时间: 2026-03-06*
