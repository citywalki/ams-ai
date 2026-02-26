# 侧边栏路由定位设计（方案 A）

## 背景与目标

当前左侧菜单的高亮依赖 `item.route === location.pathname`，当用户直接打开功能路由（如 `/admin/roles/123`、带 query/hash 的地址）时，菜单可能无法正确定位，父级文件夹也不会自动展开。

目标：当路由打开某个功能时，左侧菜单自动定位到对应项，并确保该项可见。

## 约束

- 不改后端接口
- 不改 `MenuContext` 数据结构
- 仅在前端 `Sidebar` 内实现派生状态
- 保持现有点击展开/收起交互

## 方案选择

### 方案 A（采用）

在 `Sidebar` 基于当前路由派生“激活菜单 + 自动展开父级”状态。

原因：改动面小、风险低、可快速修复当前体验问题。

## 详细设计

### 1) 路径标准化

新增 `normalizePath(path)`：

- 移除 query/hash
- 去掉末尾 `/`（根路径 `/` 保留）
- 统一比较口径

### 2) 匹配规则（前缀匹配）

新增 `isRouteMatch(menuRoute, currentPath)`：

- `current === menu` 命中
- `current` 以 `menu + '/'` 开头命中
- 避免误匹配：`/admin/role` 不命中 `/admin/roles`

### 3) 最佳匹配选择

遍历菜单树，找“最长 route 匹配”的菜单项作为激活项。

- 例如 `current=/admin/roles/123`
- 匹配 `/admin` 与 `/admin/roles` 时，选择 `/admin/roles`

### 4) 父级自动展开

基于激活项回溯父级链路，将对应 `FOLDER` 的 id 自动加入 `expandedFolders`。

- 路由变化时自动同步
- 用户手动展开/收起其他节点仍保留
- 自动展开逻辑只保证“当前路由项可见”

## 边界与兼容

- `/admin/roles?tab=1` 命中 `/admin/roles`
- `/admin/roles#permissions` 命中 `/admin/roles`
- `/admin/roles/123` 命中 `/admin/roles`
- `FOLDER` 且无 route：不参与激活匹配，仅作为展开容器
- `MENU` 且无 route：不高亮

## 改动清单

- `app-web/src/components/layout/Sidebar.tsx`
  - 增加路径标准化工具函数
  - 增加前缀匹配函数
  - 增加菜单树最佳匹配查找
  - 增加基于路由的父级自动展开同步
  - 更新 `isActive` 判定逻辑

## 验证计划

1. 直达路由：`/admin/roles`，应高亮“角色管理”并展开父级。
2. 子路径路由：`/admin/roles/123`，应仍高亮“角色管理”。
3. 带参数路由：`/admin/roles?x=1`、`/admin/roles#tab`，应正常定位。
4. 误匹配防护：`/admin/role` 不应高亮 `/admin/roles`。
5. 回归：`/dashboard`、`/admin/users`、`/admin/menus` 定位正常。

## 风险与回退

- 风险：菜单树未来深度变化时，父级回溯逻辑需要保持泛化。
- 回退：仅修改单文件，可快速回滚到旧判定逻辑。
