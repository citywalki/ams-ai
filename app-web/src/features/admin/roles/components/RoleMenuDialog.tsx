import { ChevronDown, ChevronRight, FileText, Folder, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { type MenuItem, type RoleItem } from '@/lib/types';

interface RoleMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleItem | null;
  menuTree: MenuItem[];
  expandedFolders: Set<string>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onClose: () => void;
  getMenuSelectionState: (menu: MenuItem) => 'all' | 'partial' | 'none';
  toggleMenuWithChildren: (menu: MenuItem) => void;
  toggleFolderExpand: (menuId: string) => void;
}

function renderCheckbox(state: 'all' | 'partial' | 'none') {
  if (state === 'all') {
    return (
      <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (state === 'partial') {
    return <div className="w-2.5 h-0.5 bg-primary-foreground rounded" />;
  }
  return null;
}

interface MenuTreeItemProps {
  menu: MenuItem;
  level: number;
  expandedFolders: Set<string>;
  getMenuSelectionState: (menu: MenuItem) => 'all' | 'partial' | 'none';
  toggleMenuWithChildren: (menu: MenuItem) => void;
  toggleFolderExpand: (menuId: string) => void;
}

function MenuTreeItem({
  menu,
  level,
  expandedFolders,
  getMenuSelectionState,
  toggleMenuWithChildren,
  toggleFolderExpand,
}: MenuTreeItemProps) {
  const isFolder = menu.menuType === 'FOLDER';
  const hasChildren = menu.children && menu.children.length > 0;
  const isExpanded = expandedFolders.has(menu.id);
  const selectionState = getMenuSelectionState(menu);
  const isSelected = selectionState !== 'none';

  return (
    <div key={menu.id} className="select-none">
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {isFolder && hasChildren && (
          <button
            type="button"
            className="p-0.5 hover:bg-muted-foreground/20 rounded"
            onClick={(e) => {
              e.stopPropagation();
              toggleFolderExpand(menu.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        )}
        {!isFolder && !hasChildren && <div className="w-4" />}
        <div
          className="flex items-center gap-2 flex-1"
          onClick={() => toggleMenuWithChildren(menu)}
        >
          {isFolder ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-amber-500" />
            ) : (
              <Folder className="h-4 w-4 text-amber-500" />
            )
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
          <div
            className={`w-4 h-4 border flex items-center justify-center ${
              isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
            }`}
          >
            {renderCheckbox(selectionState)}
          </div>
          <span className="text-sm">{menu.label}</span>
          <span className="text-xs text-muted-foreground font-mono">({menu.key})</span>
        </div>
      </div>
      {isFolder && hasChildren && isExpanded && (
        <MenuTree
          menus={menu.children!}
          level={level + 1}
          expandedFolders={expandedFolders}
          getMenuSelectionState={getMenuSelectionState}
          toggleMenuWithChildren={toggleMenuWithChildren}
          toggleFolderExpand={toggleFolderExpand}
        />
      )}
    </div>
  );
}

interface MenuTreeProps {
  menus: MenuItem[];
  level: number;
  expandedFolders: Set<string>;
  getMenuSelectionState: (menu: MenuItem) => 'all' | 'partial' | 'none';
  toggleMenuWithChildren: (menu: MenuItem) => void;
  toggleFolderExpand: (menuId: string) => void;
}

function MenuTree({
  menus,
  level,
  expandedFolders,
  getMenuSelectionState,
  toggleMenuWithChildren,
  toggleFolderExpand,
}: MenuTreeProps) {
  return menus.map((menu) => (
    <MenuTreeItem
      key={menu.id}
      menu={menu}
      level={level}
      expandedFolders={expandedFolders}
      getMenuSelectionState={getMenuSelectionState}
      toggleMenuWithChildren={toggleMenuWithChildren}
      toggleFolderExpand={toggleFolderExpand}
    />
  ));
}

export function RoleMenuDialog({
  open,
  onOpenChange,
  role,
  menuTree,
  expandedFolders,
  loading,
  saving,
  error,
  onSave,
  onClose,
  getMenuSelectionState,
  toggleMenuWithChildren,
  toggleFolderExpand,
}: RoleMenuDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {t('pages.roleManagement.dialog.menuTitle', { name: role?.name ?? '-' })}
          </DialogTitle>
          <DialogDescription>
            {t('pages.roleManagement.dialog.menuDescription', { code: role?.code ?? '-' })}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex-1 min-h-0 overflow-hidden">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : menuTree.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('pages.roleManagement.messages.noMenus')}
            </div>
          ) : (
            <div className="border rounded-md h-full overflow-y-auto">
              <MenuTree
                menus={menuTree}
                level={0}
                expandedFolders={expandedFolders}
                getMenuSelectionState={getMenuSelectionState}
                toggleMenuWithChildren={toggleMenuWithChildren}
                toggleFolderExpand={toggleFolderExpand}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? t('pages.roleManagement.messages.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
