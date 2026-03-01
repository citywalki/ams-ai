import type { MenuItem } from './types';

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
}

/**
 * 判断是否是今天
 */
export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/**
 * 将菜单树转换为 Ant Design Menu 格式
 * eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
export function convertToAntdMenu(menus: MenuItem[]): any[] {
  return menus.map((menu) => {
    const item: Record<string, unknown> = {
      key: menu.route || menu.key,
      label: menu.label,
    };

    if (menu.icon) {
      item.icon = menu.icon;
    }

    if (menu.children && menu.children.length > 0) {
      item.children = convertToAntdMenu(menu.children);
    }

    return item;
  });
}

/**
 * 构建 GraphQL 过滤条件
 */
export function buildFilter(searchParams: Record<string, string>): Record<string, unknown> | undefined {
  const filter: Record<string, unknown> = {};

  if (searchParams.keyword) {
    filter._or = [
      { title: { _ilike: searchParams.keyword } },
      { description: { _ilike: searchParams.keyword } },
    ];
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

/**
 * 构建排序条件
 */
export function buildOrderBy(params: { sortBy?: string; sortOrder?: 'ASC' | 'DESC' }): { field: string; direction: 'ASC' | 'DESC' } | undefined {
  if (params.sortBy && params.sortOrder) {
    return { field: params.sortBy, direction: params.sortOrder };
  }
  return undefined;
}

/**
 * 获取告警严重级别颜色
 */
export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    CRITICAL: 'red',
    HIGH: 'orange',
    MEDIUM: 'gold',
    LOW: 'green',
  };
  return colors[severity] || 'default';
}

/**
 * 获取告警状态颜色
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: 'blue',
    ACKNOWLEDGED: 'cyan',
    IN_PROGRESS: 'processing',
    RESOLVED: 'success',
    CLOSED: 'default',
  };
  return colors[status] || 'default';
}
