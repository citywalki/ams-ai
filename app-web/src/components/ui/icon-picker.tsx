import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const MENU_ICONS = [
  'Home',
  'LayoutDashboard',
  'LayoutGrid',
  'Settings',
  'Settings2',
  'Cog',
  'Sliders',
  'Users',
  'User',
  'UserPlus',
  'UserMinus',
  'UserCheck',
  'Users2',
  'File',
  'FileText',
  'FilePlus',
  'Folder',
  'FolderOpen',
  'Files',
  'Shield',
  'ShieldCheck',
  'Lock',
  'LockOpen',
  'Key',
  'Bell',
  'BellRing',
  'AlertCircle',
  'AlertTriangle',
  'Plus',
  'Edit',
  'Trash',
  'Trash2',
  'Save',
  'RefreshCw',
  'Download',
  'Upload',
  'ArrowRight',
  'ArrowLeft',
  'ArrowUp',
  'ArrowDown',
  'ChevronRight',
  'ChevronLeft',
  'ChevronUp',
  'ChevronDown',
  'BarChart',
  'PieChart',
  'TrendingUp',
  'TrendingDown',
  'Database',
  'Search',
  'Filter',
  'Eye',
  'EyeOff',
  'List',
  'Grid',
  'Calendar',
  'Clock',
  'Check',
  'X',
];

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
}

export function IconPicker({
  value,
  onChange,
  label,
  required,
  error,
}: IconPickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = MENU_ICONS.filter((iconName) =>
    iconName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectIcon = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange('');
  };

  const IconComponent = value && LucideIcons[value as keyof typeof LucideIcons]
    ? (LucideIcons[value as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>)
    : null;

  return (
    <FormItem>
      {label && <FormLabel required={required}>{label}</FormLabel>}
      <FormControl>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1 justify-start h-10"
              >
                {value ? (
                  <div className="flex items-center gap-2">
                    {IconComponent ? (
                      <IconComponent className="h-4 w-4" />
                    ) : (
                      <span className="h-4 w-4 text-xs text-muted-foreground flex items-center justify-center border rounded">
                        ?
                      </span>
                    )}
                    <span className="text-sm">{value}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    {t('common.selectIcon') || 'Select icon...'}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('common.selectIcon') || 'Select Icon'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('common.searchIcon') || 'Search icons...'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-6 gap-2 p-1">
                    {filteredIcons.map((iconName) => {
                      const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;
                      return (
                        <Button
                          key={iconName}
                          type="button"
                          variant={value === iconName ? 'default' : 'outline'}
                          size="sm"
                          className="flex flex-col items-center gap-1 h-16 p-2"
                          onClick={() => handleSelectIcon(iconName)}
                          title={iconName}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="text-[10px] truncate w-full text-center">
                            {iconName}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                  {filteredIcons.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      {t('common.noIconsFound') || 'No icons found'}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </FormControl>
      {error && <FormMessage error={error} />}
    </FormItem>
  );
}
