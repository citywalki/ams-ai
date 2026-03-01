import { RotateCcw, Search } from 'lucide-react';
import { Button, Card, Col, Input, Row, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

interface RoleSearchCardProps {
  searchKeyword: string;
  onSearchKeywordChange: (keyword: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

export function RoleSearchCard({
  searchKeyword,
  onSearchKeywordChange,
  onSearch,
  onReset,
}: RoleSearchCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="shrink-0" title={t('pages.roleManagement.title')}>
      <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
        {t('pages.roleManagement.description')}
      </Typography.Paragraph>
      <Row gutter={[12, 12]} align="bottom">
        <Col flex="auto" style={{ minWidth: 220 }}>
          <Space direction="vertical" style={{ width: '100%' }} size={6}>
            <Typography.Text>{t('pages.roleManagement.form.keyword')}</Typography.Text>
            <Input
              placeholder={t('pages.roleManagement.form.keywordPlaceholder')}
              value={searchKeyword}
              onChange={(e) => onSearchKeywordChange(e.target.value)}
              onPressEnter={onSearch}
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
