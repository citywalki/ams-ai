import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { dictApi, type DictCategory, type DictCategoryPayload } from '@/utils/api';
import { invalidateDictQueries } from '../queries';
import {
  dictCategoryFormSchema,
  initialDictCategoryFormState,
} from '../schemas/dict-schema';

export function useDictCategoryForm(onSuccess?: () => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<DictCategory | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: initialDictCategoryFormState,
    validators: {
      onChange: ({ value }) => {
        const result = dictCategoryFormSchema.safeParse(value);
        if (result.success) {
          return undefined;
        }
        return result.error.issues.map((issue) => issue.message).join(', ');
      },
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        const payload: DictCategoryPayload = {
          code: value.code,
          name: value.name,
          description: value.description || undefined,
          sort: value.sort,
          status: value.status,
        };
        if (dialogMode === 'create') {
          await dictApi.createCategory(payload);
        } else if (editingCategory) {
          await dictApi.updateCategory(editingCategory.id, payload);
        }
        closeDialog();
        await invalidateDictQueries(queryClient);
        onSuccess?.();
      } catch (err) {
        setFormError(
          err instanceof Error
            ? err.message
            : t('pages.dictManagement.messages.operationFailed')
        );
        throw err;
      }
    },
  });

  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingCategory(null);
    form.reset();
    form.setFieldValue('code', '');
    form.setFieldValue('name', '');
    form.setFieldValue('description', '');
    form.setFieldValue('sort', 0);
    form.setFieldValue('status', 1);
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const openEditDialog = useCallback((category: DictCategory) => {
    setDialogMode('edit');
    setEditingCategory(category);
    form.reset();
    form.setFieldValue('code', category.code);
    form.setFieldValue('name', category.name);
    form.setFieldValue('description', category.description || '');
    form.setFieldValue('sort', category.sort);
    form.setFieldValue('status', category.status);
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingCategory(null);
    form.reset();
    setFormError(null);
  }, [form]);

  return {
    dialogOpen,
    dialogMode,
    editingCategory,
    form,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    setDialogOpen,
  };
}
