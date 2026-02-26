import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, FolderOpen, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  dictApi,
  type DictCategory,
  type DictItem,
  type DictCategoryPayload,
  type DictItemPayload,
} from '@/utils/api';
import {
  fetchCategories,
  fetchDictItems,
  invalidateDictQueries,
} from '@/features/admin/dict/queries';

type CategoryFormState = {
  code: string;
  name: string;
  description: string;
  sort: number;
  status: number;
};

type ItemFormState = {
  categoryId: string;
  parentId: string | null;
  code: string;
  name: string;
  value: string;
  sort: number;
  status: number;
  remark: string;
};

const initialCategoryForm: CategoryFormState = {
  code: '',
  name: '',
  description: '',
  sort: 0,
  status: 1,
};

const initialItemForm: ItemFormState = {
  categoryId: '',
  parentId: null,
  code: '',
  name: '',
  value: '',
  sort: 0,
  status: 1,
  remark: '',
};

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

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryDialogMode, setCategoryDialogMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<DictCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(initialCategoryForm);
  const [categoryFormLoading, setCategoryFormLoading] = useState(false);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [itemDialogMode, setItemDialogMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<DictItem | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormState>(initialItemForm);
  const [itemFormLoading, setItemFormLoading] = useState(false);
  const [itemFormError, setItemFormError] = useState<string | null>(null);

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

  const openCreateCategoryDialog = () => {
    setCategoryDialogMode('create');
    setEditingCategory(null);
    setCategoryForm(initialCategoryForm);
    setCategoryFormError(null);
    setCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category: DictCategory) => {
    setCategoryDialogMode('edit');
    setEditingCategory(category);
    setCategoryForm({
      code: category.code,
      name: category.name,
      description: category.description || '',
      sort: category.sort,
      status: category.status,
    });
    setCategoryFormError(null);
    setCategoryDialogOpen(true);
  };

  const closeCategoryDialog = () => {
    setCategoryDialogOpen(false);
    setEditingCategory(null);
    setCategoryForm(initialCategoryForm);
    setCategoryFormError(null);
  };

  const handleCategoryFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryFormLoading(true);
    setCategoryFormError(null);
    try {
      const payload: DictCategoryPayload = {
        code: categoryForm.code,
        name: categoryForm.name,
        description: categoryForm.description || undefined,
        sort: categoryForm.sort,
        status: categoryForm.status,
      };
      if (categoryDialogMode === 'create') {
        await dictApi.createCategory(payload);
      } else if (editingCategory) {
        await dictApi.updateCategory(editingCategory.id, payload);
      }
      await invalidateDictQueries(queryClient);
      closeCategoryDialog();
      void loadCategories();
    } catch (err) {
      setCategoryFormError(err instanceof Error ? err.message : t('pages.dictManagement.messages.operationFailed'));
    } finally {
      setCategoryFormLoading(false);
    }
  };

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

  const openCreateItemDialog = () => {
    if (!selectedCategory) return;
    setItemDialogMode('create');
    setEditingItem(null);
    setItemForm({
      ...initialItemForm,
      categoryId: selectedCategory.id,
    });
    setItemFormError(null);
    setItemDialogOpen(true);
  };

  const openEditItemDialog = (item: DictItem) => {
    setItemDialogMode('edit');
    setEditingItem(item);
    setItemForm({
      categoryId: item.categoryId,
      parentId: item.parentId || null,
      code: item.code,
      name: item.name,
      value: item.value || '',
      sort: item.sort,
      status: item.status,
      remark: item.remark || '',
    });
    setItemFormError(null);
    setItemDialogOpen(true);
  };

  const closeItemDialog = () => {
    setItemDialogOpen(false);
    setEditingItem(null);
    setItemForm(initialItemForm);
    setItemFormError(null);
  };

  const handleItemFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setItemFormLoading(true);
    setItemFormError(null);
    try {
      const payload: DictItemPayload = {
        categoryId: itemForm.categoryId,
        parentId: itemForm.parentId || undefined,
        code: itemForm.code,
        name: itemForm.name,
        value: itemForm.value || undefined,
        sort: itemForm.sort,
        status: itemForm.status,
        remark: itemForm.remark || undefined,
      };
      if (itemDialogMode === 'create') {
        await dictApi.createItem(itemForm.categoryId, payload);
      } else if (editingItem) {
        await dictApi.updateItem(editingItem.id, payload);
      }
      await invalidateDictQueries(queryClient);
      closeItemDialog();
      if (selectedCategory) {
        void loadItems(selectedCategory.id);
      }
    } catch (err) {
      setItemFormError(err instanceof Error ? err.message : t('pages.dictManagement.messages.operationFailed'));
    } finally {
      setItemFormLoading(false);
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
    <div className="h-full min-h-0 flex gap-4">
      <Card className="w-[280px] min-h-0 flex-shrink-0 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t('pages.dictManagement.categoryTitle')}</CardTitle>
            <Button size="sm" onClick={openCreateCategoryDialog}>
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
                          openEditCategoryDialog(category);
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
              <Button size="sm" onClick={openCreateItemDialog}>
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
          ) : itemsLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
               {t('pages.dictManagement.messages.noItems')}
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
                  {items.map((item) => (
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
                            onClick={() => openEditItemDialog(item)}
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
                  ))}
                </TableBody>
              </Table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCategoryFormSubmit}>
            <DialogHeader>
              <DialogTitle>
                {categoryDialogMode === 'create'
                  ? t('pages.dictManagement.dialog.createCategoryTitle')
                  : t('pages.dictManagement.dialog.editCategoryTitle')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {categoryFormError && (
                <Alert variant="destructive">
                  <AlertDescription>{categoryFormError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>{t('pages.dictManagement.columns.code')}</Label>
                <Input
                  value={categoryForm.code}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, code: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.dictManagement.columns.name')}</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.dictManagement.columns.description')}</Label>
                <Textarea
                  value={categoryForm.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.sortOrder')}</Label>
                  <Input
                    type="number"
                    value={categoryForm.sort}
                    onChange={(e) => setCategoryForm((p) => ({ ...p, sort: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.status')}</Label>
                  <Select
                    value={String(categoryForm.status)}
                    onValueChange={(v) => setCategoryForm((p) => ({ ...p, status: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t('pages.dictManagement.status.active')}</SelectItem>
                      <SelectItem value="0">{t('pages.dictManagement.status.inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeCategoryDialog}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={categoryFormLoading}>
                {categoryFormLoading ? t('pages.dictManagement.messages.submitting') : t('common.confirm')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <form onSubmit={handleItemFormSubmit}>
            <DialogHeader>
              <DialogTitle>
                {itemDialogMode === 'create'
                  ? t('pages.dictManagement.dialog.createItemTitle')
                  : t('pages.dictManagement.dialog.editItemTitle')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {itemFormError && (
                <Alert variant="destructive">
                  <AlertDescription>{itemFormError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>{t('pages.dictManagement.columns.code')}</Label>
                <Input
                  value={itemForm.code}
                  onChange={(e) => setItemForm((p) => ({ ...p, code: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.dictManagement.columns.name')}</Label>
                <Input
                  value={itemForm.name}
                  onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.dictManagement.columns.value')}</Label>
                <Input
                  value={itemForm.value}
                  onChange={(e) => setItemForm((p) => ({ ...p, value: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.dictManagement.columns.remark')}</Label>
                <Textarea
                  value={itemForm.remark}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setItemForm((p) => ({ ...p, remark: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.sortOrder')}</Label>
                  <Input
                    type="number"
                    value={itemForm.sort}
                    onChange={(e) => setItemForm((p) => ({ ...p, sort: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.status')}</Label>
                  <Select
                    value={String(itemForm.status)}
                    onValueChange={(v) => setItemForm((p) => ({ ...p, status: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t('pages.dictManagement.status.active')}</SelectItem>
                      <SelectItem value="0">{t('pages.dictManagement.status.inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeItemDialog}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={itemFormLoading}>
                {itemFormLoading ? t('pages.dictManagement.messages.submitting') : t('common.confirm')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
