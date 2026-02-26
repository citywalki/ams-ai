import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type PermissionItem } from '@/utils/api';
import { type RoleFormState } from '../types';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formState: RoleFormState;
  loading: boolean;
  error: string | null;
  permissions: PermissionItem[];
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onTogglePermission: (permId: string) => void;
  onUpdateField: <K extends keyof RoleFormState>(field: K, value: RoleFormState[K]) => void;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  mode,
  formState,
  loading,
  error,
  permissions,
  onSubmit,
  onClose,
  onTogglePermission,
  onUpdateField,
}: RoleFormDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? t('pages.roleManagement.dialog.createTitle')
                : t('pages.roleManagement.dialog.editTitle')}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? t('pages.roleManagement.dialog.createDescription')
                : t('pages.roleManagement.dialog.editDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t('pages.roleManagement.form.code')}</Label>
                <Input
                  id="code"
                  value={formState.code}
                  onChange={(e) => onUpdateField('code', e.target.value)}
                  placeholder={t('pages.roleManagement.form.codePlaceholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t('pages.roleManagement.form.name')}</Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(e) => onUpdateField('name', e.target.value)}
                  placeholder={t('pages.roleManagement.form.namePlaceholder')}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('pages.roleManagement.form.description')}</Label>
              <Input
                id="description"
                value={formState.description}
                onChange={(e) => onUpdateField('description', e.target.value)}
                placeholder={t('pages.roleManagement.form.descriptionPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('pages.roleManagement.form.permissions')}</Label>
              <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                {permissions.length === 0 ? (
                  <div className="text-muted-foreground text-sm">
                    {t('pages.roleManagement.messages.noPermissions')}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {permissions.map((perm) => (
                      <Button
                        key={perm.id}
                        type="button"
                        variant={formState.permissionIds.includes(perm.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onTogglePermission(perm.id)}
                      >
                        {perm.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('pages.roleManagement.messages.submitting') : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
