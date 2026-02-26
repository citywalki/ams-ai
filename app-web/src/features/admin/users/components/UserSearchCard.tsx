import { useTranslation } from 'react-i18next';
import { Search, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    <Card className="shrink-0">
      <CardHeader>
        <CardTitle>{t('pages.userManagement.title')}</CardTitle>
        <CardDescription>{t('pages.userManagement.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label>{t('pages.userManagement.form.username')}</Label>
            <Input
              placeholder={t('pages.userManagement.form.usernameSearchPlaceholder')}
              value={searchUsername}
              onChange={(e) => onSearchUsernameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSearch();
                }
              }}
            />
          </div>
          <div className="w-[180px] space-y-2">
            <Label>{t('pages.userManagement.form.status')}</Label>
            <Select value={searchStatus} onValueChange={onSearchStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('pages.userManagement.form.statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('pages.userManagement.status.all')}</SelectItem>
                <SelectItem value="ACTIVE">{t('pages.userManagement.status.active')}</SelectItem>
                <SelectItem value="INACTIVE">{t('pages.userManagement.status.inactive')}</SelectItem>
              </SelectContent>
            </Select>
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
