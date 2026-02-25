import { Card, Title } from '@ui5/webcomponents-react';
import { useLocation } from 'react-router-dom';
import { useMenus } from '@/contexts/MenuContext';
import type { MenuItem } from '@/services';

function flattenMenus(items: MenuItem[]): { name: string; route: string }[] {
  return items.flatMap((item) => [
    { name: item.name, route: item.route },
    ...(item.children ? flattenMenus(item.children) : [])
  ]);
}

export default function FeatureHostPage() {
  const location = useLocation();
  const { menus } = useMenus();
  const allMenus = flattenMenus(menus);
  const current = allMenus.find((item) => item.route === location.pathname);

  return (
    <Card className='dashboard-card'>
      <Title level='H4'>{current?.name ?? '功能页面'}</Title>
      <div>当前路由：{location.pathname}</div>
      <div>该页面已纳入 MainLayout 壳层，可按需接入实际功能组件。</div>
    </Card>
  );
}
