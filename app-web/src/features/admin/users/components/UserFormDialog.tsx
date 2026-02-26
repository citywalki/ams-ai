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
import { type ReactFormExtendedApi } from '@tanstack/react-form';
import { type UserFormData } from '../schemas/user-schema';

type UserFormApi = ReactFormExtendedApi<UserFormData, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: UserFormApi;
  error: string | null;
  roles: RoleOption[];
  onClose: () => void;
  onToggleRole: (roleId: string) => void;
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  error,
  roles,
  onClose,
  onToggleRole,
}: UserFormDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
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
            <form.Field name="username">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="username">{t('pages.userManagement.form.username')}</Label>
                  <Input
                    id="username"
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="email">{t('pages.userManagement.form.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>
            {mode === 'create' && (
              <form.Field name="password">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('pages.userManagement.form.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      required
                    />
                  </div>
                )}
              </form.Field>
            )}
            <form.Field name="status">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="status">{t('pages.userManagement.form.status')}</Label>
                  <Select
                    value={field.state.value as string}
                    onValueChange={(value) => field.handleChange(value as 'ACTIVE' | 'INACTIVE')}
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
              )}
            </form.Field>
            <form.Field name="roleIds">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t('pages.userManagement.form.roles')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <Button
                        key={role.id}
                        type="button"
                        variant={(field.state.value as string[]).includes(role.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onToggleRole(role.id)}
                      >
                        {role.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </form.Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting
                ? t('pages.userManagement.messages.submitting')
                : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
