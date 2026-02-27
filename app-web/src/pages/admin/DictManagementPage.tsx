import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, FolderOpen, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  dictApi,
  type DictCategory,
  type DictItem,
} from '@/utils/api';
import {
  fetchCategories,
  fetchDictItems,
  invalidateDictQueries,
} from '@/features/admin/dict/queries';
import { useDictCategoryForm } from '@/features/admin/dict/hooks/useDictCategoryForm';
import { useDictItemForm } from '@/features/admin/dict/hooks/useDictItemForm';
import { DictCategoryDialog } from '@/features/admin/dict/components/DictCategoryDialog';
import { DictItemDialog } from '@/features/admin/dict/components/DictItemDialog';

export default function DictManagementPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<DictCategory[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DictCategory | null>(null);
  const [items, setItems] = useState<DictItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<DictCategory | null>(null);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(false);

  const [deleteItemOpen, setDeleteItemOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<DictItem | null>(null);
  const [deleteItemLoading, setDeleteItemLoading] = useState(false);

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

  const loadItems = useCallback(async (categoryId: string) => {
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
  }, [queryClient]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (selectedCategory) {
      void loadItems(selectedCategory.id);
    }
  }, [selectedCategory, loadItems]);

  const selectCategory = (category: DictCategory) => {
    setSelectedCategory(category);
  };

  // 分类表单 hook
  const categoryForm = useDictCategoryForm(() => {
    void loadCategories();
  });

  // 字典项表单 hook
  const itemForm = useDictItemForm(() => {
    if (selectedCategory) {
      void loadItems(selectedCategory.id);
    }
  });

  const openDeleteCategoryDialog = (category: DictCategory) => {
    setDeleteCategory(category);
    setDeleteCategoryOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategory) return;
    setDeleteCategoryLoading(true);
    try {
      await dictApi.deleteCategory(deleteCategory.id);
      await invalidateDictQueries(queryClient);
      setDeleteCategoryOpen(false);
      setDeleteCategory(null);
      if (selectedCategory?.id === deleteCategory.id) {
        setSelectedCategory(null);
      }
      void loadCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteCategoryLoading(false);
    }
  };

  const openDeleteItemDialog = (item: DictItem) => {
    setDeleteItem(item);
    setDeleteItemOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!deleteItem) return;
    setDeleteItemLoading(true);
    try {
      await dictApi.deleteItem(deleteItem.id);
      await invalidateDictQueries(queryClient);
      setDeleteItemOpen(false);
      setDeleteItem(null);
      if (selectedCategory) {
        void loadItems(selectedCategory.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteItemLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    return status === 1
      ? <Badge variant="success">{t('pages.dictManagement.status.active')}</Badge>
      : <Badge variant="warning">{t('pages.dictManagement.status.inactive')}</Badge>;
  };

  return (
    <div className="h-full min-h-0 flex gap-2">
      <Card className="w-[280px] min-h-0 flex-shrink-0 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t('pages.dictManagement.categoryTitle')}</CardTitle>
            <Button size="sm" onClick={categoryForm.openCreateDialog}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('pages.dictManagement.form.searchCategoryPlaceholder')}
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0 pt-0">
          {loading ? (
            <div className="space-y-2 px-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mx-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-full">
              <div className="px-6 py-2 space-y-1">
                {categories
                  .filter((c) =>
                    categorySearch
                      ? c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                        c.code.toLowerCase().includes(categorySearch.toLowerCase())
                      : true
                  )
                  .map((category) => (
                  <div
                    key={category.id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer group ${
                      selectedCategory?.id === category.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => selectCategory(category)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FolderOpen className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm">{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.itemCount}
                      </Badge>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          categoryForm.openEditDialog(category);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteCategoryDialog(category);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {categories.filter((c) =>
                    categorySearch
                      ? c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                        c.code.toLowerCase().includes(categorySearch.toLowerCase())
                      : true
                  ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm px-6">
                    {t('pages.dictManagement.messages.noCategories')}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {selectedCategory ? selectedCategory.name : t('pages.dictManagement.itemTitle')}
              </CardTitle>
              {selectedCategory?.description && (
                <CardDescription>{selectedCategory.description}</CardDescription>
              )}
            </div>
            {selectedCategory && (
              <Button size="sm" onClick={() => itemForm.openCreateDialog(selectedCategory.id)}>
                <Plus className="h-4 w-4 mr-1" />
                {t('pages.dictManagement.actions.addItem')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          {!selectedCategory ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <ChevronRight className="h-4 w-4 mr-2" />
              {t('pages.dictManagement.messages.selectCategory')}
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('pages.dictManagement.columns.code')}</TableHead>
                      <TableHead>{t('pages.dictManagement.columns.name')}</TableHead>
                      <TableHead>{t('pages.dictManagement.columns.value')}</TableHead>
                      <TableHead>{t('pages.dictManagement.columns.sortOrder')}</TableHead>
                      <TableHead>{t('pages.dictManagement.columns.status')}</TableHead>
                      <TableHead>{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          {t('common.loading')}
                        </TableCell>
                      </TableRow>
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          {t('pages.dictManagement.messages.noItems')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">{item.code}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="font-mono text-sm">{item.value || '-'}</TableCell>
                          <TableCell>{item.sort}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex justify-start gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => itemForm.openEditDialog(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteItemDialog(item)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <DictCategoryDialog
        open={categoryForm.dialogOpen}
        onOpenChange={categoryForm.setDialogOpen}
        mode={categoryForm.dialogMode}
        form={categoryForm.form}
        error={categoryForm.formError}
        onClose={categoryForm.closeDialog}
      />

      {/* Item Dialog */}
      <DictItemDialog
        open={itemForm.dialogOpen}
        onOpenChange={itemForm.setDialogOpen}
        mode={itemForm.dialogMode}
        form={itemForm.form}
        error={itemForm.formError}
        onClose={itemForm.closeDialog}
      />

      {/* Delete Category Dialog */}
      <Dialog open={deleteCategoryOpen} onOpenChange={setDeleteCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pages.dictManagement.dialog.deleteCategoryTitle')}</DialogTitle>
            <DialogDescription>
              {t('pages.dictManagement.dialog.deleteCategoryDescription', { name: deleteCategory?.name ?? '-' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCategoryOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory} disabled={deleteCategoryLoading}>
              {deleteCategoryLoading ? t('pages.dictManagement.messages.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item Dialog */}
      <Dialog open={deleteItemOpen} onOpenChange={setDeleteItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pages.dictManagement.dialog.deleteItemTitle')}</DialogTitle>
            <DialogDescription>
              {t('pages.dictManagement.dialog.deleteItemDescription', { name: deleteItem?.name ?? '-' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItemOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem} disabled={deleteItemLoading}>
              {deleteItemLoading ? t('pages.dictManagement.messages.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
