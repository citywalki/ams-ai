import {useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useMenus} from '@/contexts/MenuContext';
import type {MenuItem} from '@/services';
import { Card, Typography } from 'antd';

function flattenMenus(items: MenuItem[]): { name: string; route: string }[] {
  return items.flatMap((item) => [
      {name: item.label ?? '', route: item.route ?? ''},
    ...(item.children ? flattenMenus(item.children) : [])
  ]);
}

export default function FeatureHostPage() {
  const {t} = useTranslation();
  const location = useLocation();
  const { menus } = useMenus();
  const allMenus = flattenMenus(menus);
  const current = allMenus.find((item) => item.route === location.pathname);

  return (
    <Card title={current?.name ?? t('pages.featureHost.title')}>
      <div className="space-y-2">
        <Typography.Text type="secondary">{t('pages.featureHost.currentRoute')}{location.pathname}</Typography.Text>
        <br />
        <Typography.Text type="secondary">{t('pages.featureHost.description')}</Typography.Text>
      </div>
    </Card>
  );
}
