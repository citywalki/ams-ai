import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

  const sizeStyles = {
    inline: 'flex items-center justify-between gap-2 px-3 py-2 text-sm',
    card: 'flex flex-col items-center justify-center gap-3 py-8 text-center',
    full: 'flex flex-col items-center justify-center gap-4 py-16 text-center',
  };

  const iconSizes = {
    inline: 'h-4 w-4',
    card: 'h-8 w-8',
    full: 'h-12 w-12',
  };

  if (size === 'inline') {
    return (
      <div
        className={cn(
          'bg-destructive/10 border border-destructive/20 rounded-md text-destructive',
          sizeStyles[size],
          className
        )}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className={iconSizes[size]} />
          <span>{errorMessage}</span>
        </div>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {t('common.retry')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-muted/50 rounded-lg text-muted-foreground',
        sizeStyles[size],
        className
      )}
    >
      <AlertTriangle className={cn('opacity-50', iconSizes[size])} />
      <p>{errorMessage}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
