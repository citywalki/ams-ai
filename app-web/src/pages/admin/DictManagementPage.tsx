import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronRight, FolderOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Alert, Button, Card, Input, Modal, Space, Spin, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { QueryErrorDisplay } from '@/components/common/QueryErrorDisplay';
import { type DictCategory, type DictItem } from '@/lib/types';
import { useDeleteCategory, useDeleteItem } from '@/features/admin/dict/mutations';
import { fetchCategories, fetchDictItems, invalidateDictQueries } from '@/features/admin/dict/queries';
import { useDictCategoryForm } from '@/features/admin/dict/hooks/useDictCategoryForm';
import { useDictItemForm } from '@/features/admin/dict/hooks/useDictItemForm';
import { DictCategoryDialog } from '@/features/admin/dict/components/DictCategoryDialog';
import { DictItemDialog } from '@/features/admin/dict/components/DictItemDialog';

export default function DictManagementPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const deleteCategoryMutation = useDeleteCategory();
  const deleteItemMutation = useDeleteItem();
  const [categories, setCategories] = useState<DictCategory[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DictCategory | null>(null);
  const [items, setItems] = useState<DictItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<DictCategory | null>(null);
  const [deleteItemOpen, setDeleteItemOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<DictItem | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories(queryClient);
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pages.dictManagement.messages.loadCategoriesFailed'));
    } finally {
      setLoading(false);
    }
  }, [queryClient, selectedCategory, t]);

  const loadItems = useCallback(
    async (categoryId: string) => {
      setItemsLoading(true);
      try {
        const data = await fetchDictItems(queryClient, categoryId);
        setItems(data);
      } catch (err) {
        console.error('Failed to load items:', err);
        setItems([]);
      } finally {
        setItemsLoading(false);
      }
    },
    [queryClient],
  );

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (selectedCategory) {
      void loadItems(selectedCategory.id);
    }
  }, [selectedCategory, loadItems]);

  const categoryForm = useDictCategoryForm(() => {
    void loadCategories();
  });

  const itemForm = useDictItemForm(() => {
    if (selectedCategory) {
      void loadItems(selectedCategory.id);
    }
  });

  const handleDeleteCategory = async () => {
    if (!deleteCategory) return;
    try {
      await deleteCategoryMutation.mutateAsync(deleteCategory.id);
      await invalidateDictQueries(queryClient);
      setDeleteCategoryOpen(false);
      setDeleteCategory(null);
      if (selectedCategory?.id === deleteCategory.id) {
        setSelectedCategory(null);
      }
      void loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItem || !selectedCategory) return;
    try {
      await deleteItemMutation.mutateAsync({ id: deleteItem.id, categoryId: selectedCategory.id });
      await invalidateDictQueries(queryClient);
      setDeleteItemOpen(false);
      setDeleteItem(null);
      void loadItems(selectedCategory.id);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        categorySearch
          ? category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
            category.code.toLowerCase().includes(categorySearch.toLowerCase())
          : true,
      ),
    [categories, categorySearch],
  );

  const itemColumns: TableProps<DictItem>['columns'] = [
    {
      title: t('pages.dictManagement.columns.code'),
      dataIndex: 'code',
      key: 'code',
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      title: t('pages.dictManagement.columns.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('pages.dictManagement.columns.value'),
      dataIndex: 'value',
      key: 'value',
      render: (value: string | undefined) => <span className="font-mono text-sm">{value || '-'}</span>,
    },
    {
      title: t('pages.dictManagement.columns.sortOrder'),
      dataIndex: 'sort',
      key: 'sort',
      width: 120,
    },
    {
      title: t('pages.dictManagement.columns.status'),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: number) =>
        status === 1 ? (
          <Tag color="green">{t('pages.dictManagement.status.active')}</Tag>
        ) : (
          <Tag color="orange">{t('pages.dictManagement.status.inactive')}</Tag>
        ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          <Button type="text" icon={<Pencil className="h-4 w-4" />} onClick={() => itemForm.openEditDialog(record)} />
          <Button
            danger
            type="text"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => {
              setDeleteItem(record);
              setDeleteItemOpen(true);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="flex h-full min-h-0 gap-3">
      <Card
        className="w-[300px] min-h-0 shrink-0"
        title={t('pages.dictManagement.categoryTitle')}
        extra={<Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={categoryForm.openCreateDialog} />}
      >
        <Input
          allowClear
          placeholder={t('pages.dictManagement.form.searchCategoryPlaceholder')}
          prefix={<Search className="h-4 w-4" />}
          value={categorySearch}
          onChange={(event) => setCategorySearch(event.target.value)}
        />
        <div className="mt-3 h-[calc(100vh-290px)] min-h-[320px] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Spin />
            </div>
          ) : error ? (
            <QueryErrorDisplay error={new Error(error)} onRetry={() => void loadCategories()} size="card" />
          ) : (
            <div className="space-y-1">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className={`group flex cursor-pointer items-center justify-between rounded-md p-2 ${
                    selectedCategory?.id === category.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-[var(--ams-color-surface-muted)]'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <FolderOpen className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate text-sm">{category.name}</span>
                  </div>
                  <Space size={4}>
                    <Tag style={{ marginInlineEnd: 0 }}>{category.itemCount}</Tag>
                    <Space className="hidden group-hover:inline-flex" size={4}>
                      <Button
                        size="small"
                        type="text"
                        icon={<Pencil className="h-3 w-3" />}
                        onClick={(event) => {
                          event.stopPropagation();
                          categoryForm.openEditDialog(category);
                        }}
                      />
                      <Button
                        danger
                        size="small"
                        type="text"
                        icon={<Trash2 className="h-3 w-3" />}
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleteCategory(category);
                          setDeleteCategoryOpen(true);
                        }}
                      />
                    </Space>
                  </Space>
                </div>
              ))}
              {filteredCategories.length === 0 && (
                <Typography.Text type="secondary">{t('pages.dictManagement.messages.noCategories')}</Typography.Text>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card
        className="flex-1 min-h-0"
        title={selectedCategory ? selectedCategory.name : t('pages.dictManagement.itemTitle')}
        extra={
          selectedCategory ? (
            <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => itemForm.openCreateDialog(selectedCategory.id)}>
              {t('pages.dictManagement.actions.addItem')}
            </Button>
          ) : null
        }
      >
        {selectedCategory?.description && (
          <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
            {selectedCategory.description}
          </Typography.Paragraph>
        )}

        {!selectedCategory ? (
          <div className="flex h-[calc(100vh-260px)] min-h-[340px] items-center justify-center text-[var(--ams-color-text-secondary)]">
            <ChevronRight className="mr-2 h-4 w-4" />
            {t('pages.dictManagement.messages.selectCategory')}
          </div>
        ) : (
          <div className="h-[calc(100vh-260px)] min-h-[340px] overflow-y-auto">
            <Table<DictItem>
              rowKey="id"
              loading={itemsLoading}
              pagination={false}
              columns={itemColumns}
              dataSource={items}
              locale={{ emptyText: t('pages.dictManagement.messages.noItems') }}
            />
          </div>
        )}
      </Card>

      <DictCategoryDialog
        open={categoryForm.dialogOpen}
        onOpenChange={categoryForm.setDialogOpen}
        mode={categoryForm.dialogMode}
        form={categoryForm.form}
        error={categoryForm.formError}
        onClose={categoryForm.closeDialog}
      />

      <DictItemDialog
        open={itemForm.dialogOpen}
        onOpenChange={itemForm.setDialogOpen}
        mode={itemForm.dialogMode}
        form={itemForm.form}
        error={itemForm.formError}
        onClose={itemForm.closeDialog}
      />

      <Modal
        destroyOnHidden
        open={deleteCategoryOpen}
        title={t('pages.dictManagement.dialog.deleteCategoryTitle')}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true, loading: deleteCategoryMutation.isPending }}
        onCancel={() => setDeleteCategoryOpen(false)}
        onOk={() => void handleDeleteCategory()}
      >
        <p>{t('pages.dictManagement.dialog.deleteCategoryDescription', { name: deleteCategory?.name ?? '-' })}</p>
        {deleteCategoryMutation.error && (
          <Alert style={{ marginTop: 12 }} type="error" showIcon message={deleteCategoryMutation.error.message} />
        )}
      </Modal>

      <Modal
        destroyOnHidden
        open={deleteItemOpen}
        title={t('pages.dictManagement.dialog.deleteItemTitle')}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true, loading: deleteItemMutation.isPending }}
        onCancel={() => setDeleteItemOpen(false)}
        onOk={() => void handleDeleteItem()}
      >
        <p>{t('pages.dictManagement.dialog.deleteItemDescription', { name: deleteItem?.name ?? '-' })}</p>
        {deleteItemMutation.error && (
          <Alert style={{ marginTop: 12 }} type="error" showIcon message={deleteItemMutation.error.message} />
        )}
      </Modal>
    </div>
  );
}
