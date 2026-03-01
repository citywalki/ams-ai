import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { Button, Card } from 'antd';
import { DataTable } from '@/components/tables/DataTable';
import { queryKeys } from '@/lib/queryKeys';
import { fetchRolesPage } from '@/features/admin/roles/queries';
import {
  useRoleSearch,
  useRoleForm,
  useRoleMenuDialog,
  useRoleUserAssignment,
  useRoleDelete,
  usePermissions,
} from '@/features/admin/roles/hooks';
import {
  RoleSearchCard,
  RoleFormDialog,
  RoleMenuDialog,
  DeleteConfirmDialog,
  RoleUserAssignmentDialog,
  createColumns,
} from '@/features/admin/roles/components';

export default function RoleManagementPage() {
  const { t } = useTranslation();

  // Search state
  const {
    searchKeyword,
    setSearchKeyword,
    handleSearch,
    handleReset,
    searchParams,
  } = useRoleSearch();

  // Form dialog state
  const {
    dialogOpen: formDialogOpen,
    dialogMode,
    formData,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog: closeFormDialog,
    submitForm,
    setDialogOpen: setFormDialogOpen,
    isSubmitting,
  } = useRoleForm();

  // Menu dialog state
  const {
    dialogOpen: menuDialogOpen,
    editingRole: menuEditingRole,
    menuTree,
    expandedFolders,
    loading: menuLoading,
    saving: menuSaving,
    error: menuError,
    openDialog: openMenuDialog,
    closeDialog: closeMenuDialog,
    handleSave: handleMenuSave,
    getMenuSelectionState,
    toggleMenuWithChildren,
    toggleFolderExpand,
    setDialogOpen: setMenuDialogOpen,
  } = useRoleMenuDialog();

  // Delete dialog state
  const {
    dialogOpen: deleteDialogOpen,
    deleteRole,
    loading: deleteLoading,
    error: deleteError,
    openDialog: openDeleteDialog,
    handleDelete,
    setDialogOpen: setDeleteDialogOpen,
  } = useRoleDelete();

  // User assignment dialog state
  const {
    dialogOpen: userAssignmentDialogOpen,
    editingRole: userAssignmentRole,
    allUsers,
    roleUsers,
    loading: userAssignmentLoading,
    error: userAssignmentError,
    searchKeyword: userSearchKeyword,
    handleSearchChange: handleUserSearchChange,
    handleAssignUser,
    handleRemoveUser,
    openAssignment: openUserAssignmentDialog,
    closeAssignment: closeUserAssignmentDialog,
  } = useRoleUserAssignment();

  const setUserAssignmentDialogOpen = (open: boolean) => {
    if (!open) {
      closeUserAssignmentDialog();
    }
  };

  // Permissions data
  const { permissions } = usePermissions();

  // Table columns with memoization
  const columns = useMemo(
    () =>
      createColumns({
        t,
        onEdit: (role) => {
          openEditDialog(role);
        },
        onMenuConfig: openMenuDialog,
        onUserAssign: (role) => {
          openUserAssignmentDialog(role);
        },
        onDelete: openDeleteDialog,
      }),
    [t, openEditDialog, openMenuDialog, openDeleteDialog, openUserAssignmentDialog]
  );

  const handleCloseFormDialog = () => {
    closeFormDialog();
  };

  return (
    <div className="h-full min-h-0 flex flex-col gap-3">
      {/* Search Card */}
      <RoleSearchCard
        searchKeyword={searchKeyword}
        onSearchKeywordChange={setSearchKeyword}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* Data Table Card */}
      <Card
        title={t('pages.roleManagement.listTitle')}
        className="flex-1 min-h-0 flex flex-col"
        extra={(
          <Button type="primary" onClick={openCreateDialog} icon={<Plus className="h-4 w-4" />}>
            {t('common.add')}
          </Button>
        )}
      >
        <div className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            queryKey={queryKeys.roles.list(searchParams)}
            queryFn={(params) => fetchRolesPage(params, searchParams)}
            defaultSort={{ id: 'createdAt', desc: true }}
          />
        </div>
      </Card>

      {/* Create/Edit Dialog */}
      <RoleFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        mode={dialogMode}
        initialValues={formData}
        error={formError}
        permissions={permissions}
        onClose={handleCloseFormDialog}
        onSubmit={submitForm}
        isSubmitting={isSubmitting}
      />

      {/* User Assignment Dialog */}
      <RoleUserAssignmentDialog
        open={userAssignmentDialogOpen}
        onOpenChange={setUserAssignmentDialogOpen}
        role={userAssignmentRole}
        allUsers={allUsers}
        roleUsers={roleUsers}
        loading={userAssignmentLoading}
        error={userAssignmentError}
        searchKeyword={userSearchKeyword}
        onSearchChange={handleUserSearchChange}
        onAssignUser={handleAssignUser}
        onRemoveUser={handleRemoveUser}
      />

      {/* Menu Association Dialog */}
      <RoleMenuDialog
        open={menuDialogOpen}
        onOpenChange={setMenuDialogOpen}
        role={menuEditingRole}
        menuTree={menuTree}
        expandedFolders={expandedFolders}
        loading={menuLoading}
        saving={menuSaving}
        error={menuError}
        onSave={handleMenuSave}
        onClose={closeMenuDialog}
        getMenuSelectionState={getMenuSelectionState}
        toggleMenuWithChildren={toggleMenuWithChildren}
        toggleFolderExpand={toggleFolderExpand}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        role={deleteRole}
        loading={deleteLoading}
        error={deleteError}
        onDelete={handleDelete}
      />
    </div>
  );
}
