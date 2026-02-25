import { useLocation } from 'react-router-dom';
import { useMenus } from '@/contexts/MenuContext';
import type { MenuItem } from '@/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card>
      <CardHeader>
        <CardTitle>{current?.name ?? '功能页面'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-muted-foreground">当前路由：{location.pathname}</p>
        <p className="text-muted-foreground">该页面已纳入 MainLayout 壳层，可按需接入实际功能组件。</p>
      </CardContent>
    </Card>
  );
}
