import {useCallback, useEffect, useMemo, useState} from 'react';
import {
    AnalyticalTable,
    type AnalyticalTableColumnDefinition,
    BusyIndicator,
    Button,
    CheckBox,
    Dialog,
    DynamicPage,
    DynamicPageHeader,
    DynamicPageTitle,
    FilterBar,
    FilterGroupItem,
    Input,
    MessageStrip,
    Title
} from '@ui5/webcomponents-react';
import {
    type PermissionItem,
    type RoleItem,
    type RolePayload,
    type RoleQueryParams,
    systemApi
} from '@/utils/api';
import './RoleManagementPage.css';

type FeedbackDesign = 'Positive' | 'Negative' | 'Information' | 'Critical';

type Feedback = {
    design: FeedbackDesign;
    text: string;
};

type RoleFilters = {
    keyword: string;
};

type RoleFormState = {
    code: string;
    name: string;
    description: string;
    permissionIds: number[];
};

type RoleTableRow = {
    id: number;
    code: string;
    name: string;
    description: string;
    permissionCount: number;
    raw: RoleItem;
};

const DEFAULT_PAGE_SIZE = 20;

const EMPTY_FORM: RoleFormState = {
    code: '',
    name: '',
    description: '',
    permissionIds: []
};

function extractArray<T>(value: unknown): T[] {
    if (Array.isArray(value)) {
        return value as T[];
    }
    if (!value || typeof value !== 'object') {
        return [];
    }
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.content)) {
        return record.content as T[];
    }
    if (Array.isArray(record.items)) {
        return record.items as T[];
    }
    if (Array.isArray(record.data)) {
        return record.data as T[];
    }
    return [];
}

function normalizePermissionName(permission: PermissionItem): string {
    return permission.name || permission.code || `权限#${permission.id}`;
}

export default function RoleManagementPage() {
    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [permissions, setPermissions] = useState<PermissionItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const [filters, setFilters] = useState<RoleFilters>({keyword: ''});
    const [page, setPage] = useState(0);
    const [pageSize] = useState(DEFAULT_PAGE_SIZE);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
    const [form, setForm] = useState<RoleFormState>(EMPTY_FORM);
    const [dialogFeedback, setDialogFeedback] = useState<Feedback | null>(null);

    const totalPages = useMemo(() => {
        if (totalCount <= 0) {
            return 1;
        }
        return Math.ceil(totalCount / pageSize);
    }, [pageSize, totalCount]);

    const tableData = useMemo<RoleTableRow[]>(
        () =>
            roles.map((role) => ({
                id: role.id,
                code: role.code,
                name: role.name,
                description: role.description || '-',
                permissionCount: role.permissionIds?.length ?? role.permissions?.length ?? 0,
                raw: role
            })),
        [roles]
    );

    const columns: AnalyticalTableColumnDefinition[] = [
        {
            Header: '角色编码',
            accessor: 'code',
            minWidth: 180,
            responsiveMinWidth: 640
        },
        {
            Header: '角色名称',
            accessor: 'name',
            minWidth: 200,
            responsiveMinWidth: 720
        },
        {
            Header: '描述',
            accessor: 'description',
            minWidth: 260,
            disableSortBy: true,
            responsiveMinWidth: 900
        },
        {
            Header: '权限数',
            accessor: 'permissionCount',
            minWidth: 120,
            responsiveMinWidth: 560
        },
        {
            Header: '操作',
            id: 'actions',
            width: 220,
            minWidth: 220,
            maxWidth: 240,
            disableSortBy: true,
            disableResizing: true,
            Cell: ({row}) => {
                const role = row.original.raw as RoleItem;
                return (
                    <div className='role-management-row-actions'>
                        <Button design='Transparent' onClick={() => openEditDialog(role)}>
                            编辑
                        </Button>
                        <Button design='Negative' onClick={() => void handleDelete(role)}>
                            删除
                        </Button>
                    </div>
                );
            }
        }
    ];

    const loadRoles = useCallback(
        async (nextPage: number = page, overrideFilters?: RoleFilters) => {
            setLoading(true);
            setFeedback(null);
            try {
                const activeFilters = overrideFilters ?? filters;
                const params: RoleQueryParams = {
                    page: nextPage,
                    size: pageSize
                };
                if (activeFilters.keyword.trim()) {
                    params.keyword = activeFilters.keyword.trim();
                }

                const response = await systemApi.getRoles(params);
                const parsedRoles = extractArray<RoleItem>(response.data);
                const totalHeader = response.headers['x-total-count'];
                const parsedTotal = Number(totalHeader ?? parsedRoles.length);

                setRoles(parsedRoles);
                setTotalCount(Number.isNaN(parsedTotal) ? parsedRoles.length : parsedTotal);
                setPage(nextPage);
            } catch (error: unknown) {
                const text =
                    typeof error === 'object' && error !== null && 'response' in error
                        ? ((error as {
                            response?: { data?: { message?: string } }
                        }).response?.data?.message ?? '加载角色失败')
                        : '加载角色失败';
                setFeedback({design: 'Negative', text});
            } finally {
                setLoading(false);
            }
        },
        [filters, page, pageSize]
    );

    const loadPermissions = useCallback(async () => {
        try {
            const response = await systemApi.getPermissions({page: 0, size: 200});
            setPermissions(extractArray<PermissionItem>(response.data));
        } catch {
            setPermissions([]);
        }
    }, []);

    useEffect(() => {
        void loadRoles(0);
        void loadPermissions();
    }, [loadPermissions, loadRoles]);

    const openCreateDialog = () => {
        setIsEditing(false);
        setEditingRole(null);
        setForm(EMPTY_FORM);
        setDialogFeedback(null);
        setDialogOpen(true);
    };

    const openEditDialog = (role: RoleItem) => {
        setIsEditing(true);
        setEditingRole(role);
        setForm({
            code: role.code,
            name: role.name,
            description: role.description ?? '',
            permissionIds: role.permissionIds ?? role.permissions?.map((permission) => permission.id) ?? []
        });
        setDialogFeedback(null);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingRole(null);
        setForm(EMPTY_FORM);
        setDialogFeedback(null);
    };

    const validateForm = (): string | null => {
        const code = form.code.trim();
        const name = form.name.trim();
        if (!code) {
            return '角色编码不能为空';
        }
        if (!/^[A-Za-z0-9_:\-]+$/.test(code)) {
            return '角色编码仅支持字母、数字、下划线、冒号和短横线';
        }
        if (!name) {
            return '角色名称不能为空';
        }
        return null;
    };

    const submitDialog = async () => {
        setDialogFeedback(null);
        const validationError = validateForm();
        if (validationError) {
            setDialogFeedback({design: 'Negative', text: validationError});
            return;
        }

        const payload: RolePayload = {
            code: form.code.trim(),
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            permissionIds: form.permissionIds
        };

        try {
            if (isEditing && editingRole) {
                await systemApi.updateRole(editingRole.id, payload);
                setFeedback({design: 'Positive', text: '角色更新成功'});
            } else {
                await systemApi.createRole(payload);
                setFeedback({design: 'Positive', text: '角色创建成功'});
            }
            closeDialog();
            await loadRoles(0);
        } catch (error: unknown) {
            const text =
                typeof error === 'object' && error !== null && 'response' in error
                    ? ((error as {
                        response?: { data?: { message?: string } }
                    }).response?.data?.message ?? '保存角色失败')
                    : '保存角色失败';
            setDialogFeedback({design: 'Negative', text});
        }
    };

    const togglePermission = (permissionId: number, selected: boolean) => {
        setForm((prev) => {
            if (selected) {
                if (prev.permissionIds.includes(permissionId)) {
                    return prev;
                }
                return {...prev, permissionIds: [...prev.permissionIds, permissionId]};
            }
            return {...prev, permissionIds: prev.permissionIds.filter((id) => id !== permissionId)};
        });
    };

    const handleDelete = async (role: RoleItem) => {
        const confirmed = window.confirm(`确认删除角色 ${role.name} (${role.code}) 吗？`);
        if (!confirmed) {
            return;
        }
        try {
            await systemApi.deleteRole(role.id);
            setFeedback({design: 'Positive', text: '角色删除成功'});
            const fallbackPage = roles.length === 1 && page > 0 ? page - 1 : page;
            await loadRoles(fallbackPage);
        } catch (error: unknown) {
            const text =
                typeof error === 'object' && error !== null && 'response' in error
                    ? ((error as {
                        response?: { data?: { message?: string } }
                    }).response?.data?.message ?? '删除角色失败')
                    : '删除角色失败';
            setFeedback({design: 'Negative', text});
        }
    };

    return (
        <DynamicPage
            className='role-management-page'
            titleArea={
                <DynamicPageTitle
                    heading={<Title level='H3'>角色管理</Title>}
                    subheading={<span>{`共 ${totalCount} 个角色`}</span>}
                />
            }
            headerArea={
                <DynamicPageHeader>
                    <FilterBar
                        showClearOnFB
                        showGoOnFB
                        hideFilterConfiguration
                        hideToolbar
                        hideToggleFiltersButton
                        filterContainerWidth='14rem'
                        onGo={() => void loadRoles(0)}
                        onClear={() => {
                            const clearedFilters: RoleFilters = {keyword: ''};
                            setFilters(clearedFilters);
                            void loadRoles(0, clearedFilters);
                        }}
                    >
                        <FilterGroupItem filterKey='keyword' label='关键字' active={Boolean(filters.keyword)}>
                            <Input
                                value={filters.keyword}
                                placeholder='按角色编码或名称搜索'
                                onInput={(event) => setFilters((prev) => ({...prev, keyword: event.target.value}))}
                            />
                        </FilterGroupItem>
                    </FilterBar>
                </DynamicPageHeader>
            }
        >
            {feedback ? (
                <MessageStrip design={feedback.design} className='role-management-message' onClose={() => setFeedback(null)}>
                    {feedback.text}
                </MessageStrip>
            ) : null}

            {loading ? (
                <div className='role-management-loading'>
                    <BusyIndicator active/>
                </div>
            ) : null}

            {!loading ? (
                <div className='role-management-content-area'>
                    <div className='role-management-list-toolbar'>
                        <span className='role-management-list-title'>{`Roles (${totalCount})`}</span>
                        <div className='role-management-list-tools'>
                            <Button design='Transparent' icon='add' onClick={openCreateDialog}>
                                Add
                            </Button>
                        </div>
                    </div>
                    <div className='role-management-table-shell'>
                        <AnalyticalTable
                            className='role-management-table'
                            data={tableData}
                            columns={columns}
                            noDataText='暂无角色，点击“Add”创建。'
                            loading={loading}
                            sortable
                            scaleWidthMode='Grow'
                            selectionMode='None'
                            minRows={Math.max(1, Math.min(pageSize, tableData.length || 1))}
                            visibleRows={Math.max(8, Math.min(pageSize, tableData.length || 8))}
                            withRowHighlight={false}
                            withNavigationHighlight={false}
                            alternateRowColor={false}
                            visibleRowCountMode='Fixed'
                        />
                    </div>
                </div>
            ) : null}

            <div className='role-management-pagination'>
                <Button design='Transparent' disabled={page <= 0 || loading} onClick={() => void loadRoles(page - 1)}>
                    上一页
                </Button>
                <span>{`第 ${Math.min(page + 1, totalPages)} / ${totalPages} 页`}</span>
                <Button design='Transparent' disabled={page + 1 >= totalPages || loading} onClick={() => void loadRoles(page + 1)}>
                    下一页
                </Button>
            </div>

            <Dialog
                open={dialogOpen}
                headerText={isEditing ? '编辑角色' : '新增角色'}
                className='role-management-dialog'
                onClose={closeDialog}
            >
                <div className='role-management-form'>
                    {dialogFeedback ? (
                        <MessageStrip design={dialogFeedback.design} className='role-management-dialog-message' onClose={() => setDialogFeedback(null)}>
                            {dialogFeedback.text}
                        </MessageStrip>
                    ) : null}
                    <label>
                        角色编码
                        <Input value={form.code} onInput={(event) => setForm((prev) => ({...prev, code: event.target.value}))}/>
                    </label>
                    <label>
                        角色名称
                        <Input value={form.name} onInput={(event) => setForm((prev) => ({...prev, name: event.target.value}))}/>
                    </label>
                    <label>
                        描述
                        <Input
                            value={form.description}
                            onInput={(event) => setForm((prev) => ({...prev, description: event.target.value}))}
                        />
                    </label>
                    <div className='role-management-permission-picker'>
                        <div className='role-management-permission-title'>权限分配</div>
                        {permissions.length === 0 ? <div className='role-management-permission-empty'>暂无权限可分配</div> : null}
                        {permissions.map((permission) => (
                            <CheckBox
                                key={permission.id}
                                text={normalizePermissionName(permission)}
                                checked={form.permissionIds.includes(permission.id)}
                                onChange={(event) => togglePermission(permission.id, event.target.checked)}
                            />
                        ))}
                    </div>
                    <div className='role-management-dialog-actions'>
                        <Button design='Emphasized' onClick={() => void submitDialog()}>
                            {isEditing ? '保存修改' : '创建角色'}
                        </Button>
                        <Button design='Transparent' onClick={closeDialog}>
                            取消
                        </Button>
                    </div>
                </div>
            </Dialog>
        </DynamicPage>
    );
}
