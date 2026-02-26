import { Search, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <Card className="shrink-0">
      <CardHeader>
        <CardTitle>{t('pages.roleManagement.title')}</CardTitle>
        <CardDescription>{t('pages.roleManagement.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label>{t('pages.roleManagement.form.keyword')}</Label>
            <Input
              placeholder={t('pages.roleManagement.form.keywordPlaceholder')}
              value={searchKeyword}
              onChange={(e) => onSearchKeywordChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSearch();
                }
              }}
            />
          </div>
          <Button type="button" onClick={onSearch}>
            <Search className="h-4 w-4 mr-2" />
            {t('common.search')}
          </Button>
          <Button type="button" variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('common.reset')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
