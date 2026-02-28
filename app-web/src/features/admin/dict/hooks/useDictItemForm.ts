import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { type DictItem, type DictItemPayload } from '@/lib/types';
import { useCreateItem, useUpdateItem } from '../mutations';
import {
  dictItemFormSchema,
  initialDictItemFormState,
} from '../schemas/dict-schema';

export function useDictItemForm(onSuccess?: () => void) {
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<DictItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();

  const form = useForm({
    defaultValues: initialDictItemFormState,
    validators: {
      onChange: ({ value }) => {
        const result = dictItemFormSchema.safeParse(value);
        if (result.success) {
          return undefined;
        }
        return result.error.issues.map((issue) => issue.message).join(', ');
      },
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        const payload: DictItemPayload = {
          categoryId: value.categoryId,
          parentId: value.parentId || undefined,
          code: value.code,
          name: value.name,
          value: value.value || undefined,
          sort: value.sort,
          status: value.status,
          remark: value.remark || undefined,
        };
        if (dialogMode === 'create') {
          await createMutation.mutateAsync({ categoryId: value.categoryId, payload });
        } else if (editingItem) {
          await updateMutation.mutateAsync({ id: editingItem.id, categoryId: editingItem.categoryId, payload });
        }
        closeDialog();
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

  const openCreateDialog = useCallback((categoryId: string) => {
    setDialogMode('create');
    setEditingItem(null);
    form.reset();
    form.setFieldValue('categoryId', categoryId);
    form.setFieldValue('parentId', null);
    form.setFieldValue('code', '');
    form.setFieldValue('name', '');
    form.setFieldValue('value', '');
    form.setFieldValue('sort', 0);
    form.setFieldValue('status', 1);
    form.setFieldValue('remark', '');
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const openEditDialog = useCallback((item: DictItem) => {
    setDialogMode('edit');
    setEditingItem(item);
    form.reset();
    form.setFieldValue('categoryId', item.categoryId);
    form.setFieldValue('parentId', item.parentId || null);
    form.setFieldValue('code', item.code);
    form.setFieldValue('name', item.name);
    form.setFieldValue('value', item.value || '');
    form.setFieldValue('sort', item.sort);
    form.setFieldValue('status', item.status);
    form.setFieldValue('remark', item.remark || '');
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingItem(null);
    form.reset();
    setFormError(null);
  }, [form]);

  return {
    dialogOpen,
    dialogMode,
    editingItem,
    form,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    setDialogOpen,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
}
