import { RotateCcw, Search } from 'lucide-react';
import { Button, Card, Col, Input, Row, Select, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

interface UserSearchCardProps {
  searchUsername: string;
  onSearchUsernameChange: (value: string) => void;
  searchStatus: string;
  onSearchStatusChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

export function UserSearchCard({
  searchUsername,
  onSearchUsernameChange,
  searchStatus,
  onSearchStatusChange,
  onSearch,
  onReset,
}: UserSearchCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="shrink-0" title={t('pages.userManagement.title')}>
      <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
        {t('pages.userManagement.description')}
      </Typography.Paragraph>
      <Row gutter={[12, 12]} align="bottom">
        <Col flex="auto" style={{ minWidth: 220 }}>
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            <Typography.Text>{t('pages.userManagement.form.username')}</Typography.Text>
            <Input
              placeholder={t('pages.userManagement.form.usernameSearchPlaceholder')}
              value={searchUsername}
              onChange={(e) => onSearchUsernameChange(e.target.value)}
              onPressEnter={onSearch}
            />
          </Space>
        </Col>
        <Col style={{ width: 180 }}>
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            <Typography.Text>{t('pages.userManagement.form.status')}</Typography.Text>
            <Select
              value={searchStatus}
              onChange={onSearchStatusChange}
              options={[
                { value: 'all', label: t('pages.userManagement.status.all') },
                { value: 'ACTIVE', label: t('pages.userManagement.status.active') },
                { value: 'INACTIVE', label: t('pages.userManagement.status.inactive') },
              ]}
            />
          </Space>
        </Col>
        <Col>
          <Space>
            <Button type="primary" icon={<Search className="h-4 w-4" />} onClick={onSearch}>
              {t('common.search')}
            </Button>
            <Button icon={<RotateCcw className="h-4 w-4" />} onClick={onReset}>
              {t('common.reset')}
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}
