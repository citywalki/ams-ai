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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type RoleOption } from '@/utils/api';
import { type UserFormState } from '../types';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formState: UserFormState;
  loading: boolean;
  error: string | null;
  roles: RoleOption[];
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onToggleRole: (roleId: string) => void;
  onUpdateField: <K extends keyof UserFormState>(field: K, value: UserFormState[K]) => void;
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  formState,
  loading,
  error,
  roles,
  onSubmit,
  onClose,
  onToggleRole,
  onUpdateField,
}: UserFormDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? t('pages.userManagement.dialog.createTitle')
                : t('pages.userManagement.dialog.editTitle')}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? t('pages.userManagement.dialog.createDescription')
                : t('pages.userManagement.dialog.editDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">{t('pages.userManagement.form.username')}</Label>
              <Input
                id="username"
                value={formState.username}
                onChange={(e) => onUpdateField('username', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('pages.userManagement.form.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={(e) => onUpdateField('email', e.target.value)}
              />
            </div>
            {mode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="password">{t('pages.userManagement.form.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formState.password}
                  onChange={(e) => onUpdateField('password', e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="status">{t('pages.userManagement.form.status')}</Label>
              <Select
                value={formState.status}
                onValueChange={(value) => onUpdateField('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">{t('pages.userManagement.status.active')}</SelectItem>
                  <SelectItem value="INACTIVE">{t('pages.userManagement.status.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('pages.userManagement.form.roles')}</Label>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Button
                    key={role.id}
                    type="button"
                    variant={formState.roleIds.includes(role.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onToggleRole(role.id)}
                  >
                    {role.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('pages.userManagement.messages.submitting') : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
