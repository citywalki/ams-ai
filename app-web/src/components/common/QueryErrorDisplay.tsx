import { Alert, Button, Space, Typography } from 'antd';
import { ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface QueryErrorDisplayProps {
  error: Error | null;
  onRetry?: () => void;
  size?: 'inline' | 'card' | 'full';
  message?: string;
  className?: string;
}

export function QueryErrorDisplay({
  error,
  onRetry,
  size = 'inline',
  message,
  className,
}: QueryErrorDisplayProps) {
  const { t } = useTranslation();

  if (!error) return null;

  const errorMessage = message || error.message || t('common.loadFailed');

  if (size === 'inline') {
    return (
      <Alert
        type="error"
        showIcon
        className={className}
        message={errorMessage}
        action={
          onRetry ? (
            <Button type="text" size="small" icon={<ReloadOutlined />} onClick={onRetry}>
              {t('common.retry')}
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg bg-[var(--ams-color-surface-muted)] px-6 py-10 text-center',
        className
      )}
    >
      <Space direction="vertical" size={12} align="center">
        <WarningOutlined style={{ fontSize: size === 'full' ? 40 : 28, color: '#ff4d4f' }} />
        <Typography.Text>{errorMessage}</Typography.Text>
        {onRetry && (
          <Button icon={<ReloadOutlined />} onClick={onRetry}>
            {t('common.retry')}
          </Button>
        )}
      </Space>
    </div>
  );
}
