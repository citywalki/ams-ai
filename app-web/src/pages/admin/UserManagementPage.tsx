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
    Option,
    Select,
    Title
} from '@ui5/webcomponents-react';
import {useAuthStore} from '@/stores/authStore';
import {
    type RoleOption,
    systemApi,
    type UserCreatePayload,
    type UserItem,
    type UserQueryParams,
    type UserUpdatePayload
} from '@/utils/api';
import './UserManagementPage.css';

type FeedbackDesign = 'Positive' | 'Negative' | 'Information' | 'Critical';

type Feedback = {
    design: FeedbackDesign;
    text: string;
};

type UserFormState = {
    username: string;
    email: string;
    password: string;
    status: string;
    roleIds: number[];
};

type UserFilters = {
    username: string;
    email: string;
    status: string;
};

type UserTableRow = {
    id: number;
    username: string;
    email: string;
    rolesText: string;
    status: string;
    createdAt: string;
    raw: UserItem;
};

const DEFAULT_PAGE_SIZE = 20;

const EMPTY_FORM: UserFormState = {
    username: '',
    email: '',
    password: '',
    status: 'ACTIVE',
    roleIds: []
};

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

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

function statusLabel(status: string): string {
    return status === 'ACTIVE' ? '启用' : '禁用';
}

function normalizeRoleName(role: RoleOption): string {
    return role.name || role.code || `角色#${role.id}`;
}

function formatCreatedAt(value?: string): string {
    if (!value) {
        return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString('zh-CN');
}

export default function UserManagementPage() {
    const currentUser = useAuthStore((state) => state.user);
    const currentUserId = useMemo(() => {
        if (!currentUser?.id) {
            return null;
        }
        const parsed = Number(currentUser.id);
        return Number.isNaN(parsed) ? null : parsed;
    }, [currentUser]);

    const [users, setUsers] = useState<UserItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [roles, setRoles] = useState<RoleOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const [filters, setFilters] = useState<UserFilters>({
        username: '',
        email: '',
        status: ''
    });
    const [page, setPage] = useState(0);
    const [pageSize] = useState(DEFAULT_PAGE_SIZE);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [form, setForm] = useState<UserFormState>(EMPTY_FORM);
    const [dialogFeedback, setDialogFeedback] = useState<Feedback | null>(null);

    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [passwordTargetUser, setPasswordTargetUser] = useState<UserItem | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [passwordDialogFeedback, setPasswordDialogFeedback] = useState<Feedback | null>(null);

    const totalPages = useMemo(() => {
        if (totalCount <= 0) {
            return 1;
        }
        return Math.ceil(totalCount / pageSize);
    }, [pageSize, totalCount]);

    const tableData = useMemo<UserTableRow[]>(
        () =>
            users.map((user) => ({
                id: user.id,
                username: user.username,
                email: user.email || '-',
                rolesText: (user.roles || []).map(normalizeRoleName).join(', ') || '未分配',
                status: user.status,
                createdAt: formatCreatedAt(user.createdAt),
                raw: user
            })),
        [users]
    );

    const columns: AnalyticalTableColumnDefinition[] = [
        {
            Header: '用户名',
            accessor: 'username',
            minWidth: 180,
            responsiveMinWidth: 640
        },
        {
            Header: '邮箱',
            accessor: 'email',
            minWidth: 220,
            responsiveMinWidth: 780
        },
        {
            Header: '角色',
            accessor: 'rolesText',
            minWidth: 180,
            disableSortBy: true,
            responsiveMinWidth: 1024
        },
        {
            Header: '状态',
            accessor: 'status',
            minWidth: 120,
            Cell: ({value}) => <span
                className={value === 'ACTIVE' ? 'status-positive' : 'status-negative'}>{statusLabel(String(value))}</span>,
            responsiveMinWidth: 560
        },
        {
            Header: '创建时间',
            accessor: 'createdAt',
            minWidth: 180,
            responsiveMinWidth: 900
        },
        {
            Header: '操作',
            id: 'actions',
            width: 320,
            minWidth: 300,
            maxWidth: 340,
            disableSortBy: true,
            disableResizing: true,
            Cell: ({row}) => {
                const user = row.original.raw as UserItem;
                const disableSelfRiskAction = user.id === currentUserId;
                const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                return (
                    <div className='user-management-row-actions'>
                        <Button design='Transparent' onClick={() => openEditDialog(user)}>
                            编辑
                        </Button>
                        <Button design='Transparent' onClick={() => openPasswordDialog(user)}>
                            重置密码
                        </Button>
                        <Button
                            design='Transparent'
                            disabled={disableSelfRiskAction && nextStatus === 'INACTIVE'}
                            onClick={() => void handleStatusChange(user, nextStatus)}
                        >
                            {nextStatus === 'ACTIVE' ? '启用' : '禁用'}
                        </Button>
                        <Button design='Negative' disabled={disableSelfRiskAction}
                                onClick={() => void handleDelete(user)}>
                            删除
                        </Button>
                    </div>
                );
            }
        }
    ];

    const loadUsers = useCallback(
        async (nextPage: number = page, overrideFilters?: UserFilters) => {
            setLoading(true);
            setFeedback(null);
            try {
                const activeFilters = overrideFilters ?? filters;
                const params: UserQueryParams = {
                    page: nextPage,
                    size: pageSize
                };
                if (activeFilters.username.trim()) {
                    params.username = activeFilters.username.trim();
                }
                if (activeFilters.email.trim()) {
                    params.email = activeFilters.email.trim();
                }
                if (activeFilters.status) {
                    params.status = activeFilters.status;
                }

                const response = await systemApi.getUsers(params);
                const parsedUsers = extractArray<UserItem>(response.data);
                const totalHeader = response.headers['x-total-count'];
                const parsedTotal = Number(totalHeader ?? parsedUsers.length);

                setUsers(parsedUsers);
                setTotalCount(Number.isNaN(parsedTotal) ? parsedUsers.length : parsedTotal);
                setPage(nextPage);
            } catch (error: unknown) {
                const text =
                    typeof error === 'object' && error !== null && 'response' in error
                        ? ((error as {
                            response?: { data?: { message?: string } }
                        }).response?.data?.message ?? '加载用户失败')
                        : '加载用户失败';
                setFeedback({design: 'Negative', text});
            } finally {
                setLoading(false);
            }
        },
        [filters.email, filters.status, filters.username, page, pageSize]
    );

    const loadRoles = useCallback(async () => {
        try {
            const response = await systemApi.getRoles();
            setRoles(extractArray<RoleOption>(response.data));
        } catch {
            setRoles([]);
        }
    }, []);

    useEffect(() => {
        void loadUsers(0);
        void loadRoles();
    }, [loadRoles, loadUsers]);

    const openCreateDialog = () => {
        setIsEditing(false);
        setEditingUser(null);
        setForm(EMPTY_FORM);
        setDialogFeedback(null);
        setDialogOpen(true);
    };

    const openEditDialog = (user: UserItem) => {
        setIsEditing(true);
        setEditingUser(user);
        setForm({
            username: user.username,
            email: user.email ?? '',
            password: '',
            status: user.status,
            roleIds: user.roles?.map((role) => role.id) ?? []
        });
        setDialogFeedback(null);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingUser(null);
        setForm(EMPTY_FORM);
        setDialogFeedback(null);
    };

    const validateUserForm = (): string | null => {
        const username = form.username.trim();
        if (!username) {
            return '用户名不能为空';
        }
        if (username.length < 3 || username.length > 50) {
            return '用户名长度需为3-50个字符';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return '用户名只能包含字母、数字和下划线';
        }
        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            return '邮箱格式不正确';
        }
        if (!isEditing) {
            if (!form.password) {
                return '临时密码不能为空';
            }
            if (form.password.length < 8) {
                return '密码长度至少8位';
            }
            if (!PASSWORD_PATTERN.test(form.password)) {
                return '密码必须包含大小写字母和数字';
            }
        }
        if (!form.status) {
            return '状态不能为空';
        }
        return null;
    };

    const submitDialog = async () => {
        setDialogFeedback(null);
        const validationError = validateUserForm();
        if (validationError) {
            setDialogFeedback({design: 'Negative', text: validationError});
            return;
        }

        try {
            if (isEditing && editingUser) {
                const payload: UserUpdatePayload = {
                    username: form.username.trim(),
                    email: form.email.trim() || undefined,
                    status: form.status,
                    roleIds: form.roleIds
                };
                await systemApi.updateUser(editingUser.id, payload);
                setFeedback({design: 'Positive', text: '用户更新成功'});
            } else {
                const payload: UserCreatePayload = {
                    username: form.username.trim(),
                    email: form.email.trim() || undefined,
                    password: form.password,
                    status: form.status,
                    roleIds: form.roleIds
                };
                await systemApi.createUser(payload);
                setFeedback({design: 'Positive', text: '用户创建成功'});
            }
            closeDialog();
            await loadUsers(0);
        } catch (error: unknown) {
            const text =
                typeof error === 'object' && error !== null && 'response' in error
                    ? ((error as {
                        response?: { data?: { message?: string } }
                    }).response?.data?.message ?? '保存用户失败')
                    : '保存用户失败';
            setDialogFeedback({design: 'Negative', text});
        }
    };

    const toggleRole = (roleId: number, selected: boolean) => {
        setForm((prev) => {
            if (selected) {
                if (prev.roleIds.includes(roleId)) {
                    return prev;
                }
                return {...prev, roleIds: [...prev.roleIds, roleId]};
            }
            return {...prev, roleIds: prev.roleIds.filter((id) => id !== roleId)};
        });
    };

    const handleStatusChange = async (user: UserItem, status: string) => {
        if (user.id === currentUserId && status !== 'ACTIVE') {
            setFeedback({design: 'Information', text: '不能禁用当前登录用户'});
            return;
        }
        const confirmed = window.confirm(`确认将用户 ${user.username} 设为${statusLabel(status)}吗？`);
        if (!confirmed) {
            return;
        }

        try {
            await systemApi.updateUserStatus(user.id, status);
            setFeedback({design: 'Positive', text: '用户状态更新成功'});
            await loadUsers(page);
        } catch (error: unknown) {
            const text =
                typeof error === 'object' && error !== null && 'response' in error
                    ? ((error as {
                        response?: { data?: { message?: string } }
                    }).response?.data?.message ?? '状态更新失败')
                    : '状态更新失败';
            setFeedback({design: 'Negative', text});
        }
    };

    const handleDelete = async (user: UserItem) => {
        if (user.id === currentUserId) {
            setFeedback({design: 'Information', text: '不能删除当前登录用户'});
            return;
        }
        const confirmed = window.confirm(`确认删除用户 ${user.username} 吗？`);
        if (!confirmed) {
            return;
        }

        try {
            await systemApi.deleteUser(user.id);
            setFeedback({design: 'Positive', text: '用户删除成功'});
            const fallbackPage = users.length === 1 && page > 0 ? page - 1 : page;
            await loadUsers(fallbackPage);
        } catch (error: unknown) {
            const text =
                typeof error === 'object' && error !== null && 'response' in error
                    ? ((error as {
                        response?: { data?: { message?: string } }
                    }).response?.data?.message ?? '删除用户失败')
                    : '删除用户失败';
            setFeedback({design: 'Negative', text});
        }
    };

    const openPasswordDialog = (user: UserItem) => {
        setPasswordTargetUser(user);
        setNewPassword('');
        setPasswordDialogFeedback(null);
        setPasswordDialogOpen(true);
    };

    const closePasswordDialog = () => {
        setPasswordDialogOpen(false);
        setPasswordTargetUser(null);
        setNewPassword('');
        setPasswordDialogFeedback(null);
    };

    const submitPasswordReset = async () => {
        setPasswordDialogFeedback(null);
        if (!passwordTargetUser) {
            return;
        }
        if (newPassword.length < 8) {
            setPasswordDialogFeedback({design: 'Negative', text: '密码长度至少8位'});
            return;
        }
        if (!PASSWORD_PATTERN.test(newPassword)) {
            setPasswordDialogFeedback({design: 'Negative', text: '密码必须包含大小写字母和数字'});
            return;
        }

        try {
            await systemApi.resetUserPassword(passwordTargetUser.id, newPassword);
            setFeedback({design: 'Positive', text: `用户 ${passwordTargetUser.username} 密码已重置`});
            closePasswordDialog();
        } catch (error: unknown) {
            const text =
                typeof error === 'object' && error !== null && 'response' in error
                    ? ((error as {
                        response?: { data?: { message?: string } }
                    }).response?.data?.message ?? '重置密码失败')
                    : '重置密码失败';
            setPasswordDialogFeedback({design: 'Negative', text});
        }
    };

    return (
        <DynamicPage
            className='user-management-page'
            titleArea={
                <DynamicPageTitle
                    heading={<Title level='H3'>用户管理</Title>}
                    subheading={<span>{`共 ${totalCount} 位用户`}</span>}
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
                        onGo={() => void loadUsers(0)}
                        onClear={() => {
                            const clearedFilters: UserFilters = {username: '', email: '', status: ''};
                            setFilters(clearedFilters);
                            void loadUsers(0, clearedFilters);
                        }}
                    >
                        <FilterGroupItem filterKey='username' label='用户名' active={Boolean(filters.username)}>
                            <Input
                                value={filters.username}
                                placeholder='按用户名搜索'
                                onInput={(event) => setFilters((prev) => ({...prev, username: event.target.value}))}
                            />
                        </FilterGroupItem>
                        <FilterGroupItem filterKey='email' label='邮箱' active={Boolean(filters.email)}>
                            <Input
                                value={filters.email}
                                placeholder='按邮箱搜索'
                                onInput={(event) => setFilters((prev) => ({...prev, email: event.target.value}))}
                            />
                        </FilterGroupItem>
                        <FilterGroupItem filterKey='status' label='状态' active={Boolean(filters.status)}>
                            <Select value={filters.status}
                                    onChange={(event) => setFilters((prev) => ({...prev, status: event.target.value}))}>
                                <Option value=''>全部</Option>
                                <Option value='ACTIVE'>启用</Option>
                                <Option value='INACTIVE'>禁用</Option>
                            </Select>
                        </FilterGroupItem>
                    </FilterBar>
                </DynamicPageHeader>
            }
        >
            {feedback ? (
                <MessageStrip design={feedback.design} className='user-management-message'
                              onClose={() => setFeedback(null)}>
                    {feedback.text}
                </MessageStrip>
            ) : null}

            {loading ? (
                <div className='user-management-loading'>
                    <BusyIndicator active/>
                </div>
            ) : null}

            {!loading ? (
                <div className='user-management-content-area'>
                    <div className='user-management-list-toolbar'>
                        <span className='user-management-list-title'>{`Users (${totalCount})`}</span>
                        <div className='user-management-list-tools'>
                            <Button design='Transparent' icon='add' onClick={openCreateDialog}>
                                Add
                            </Button>
                            <Button design='Transparent' disabled>
                                Delete
                            </Button>
                            <Button design='Transparent' icon='sort' disabled aria-label='排序'/>
                            <Button design='Transparent' icon='action-settings' disabled aria-label='设置'/>
                        </div>
                    </div>
                    <div className='user-management-table-shell'>
                        <AnalyticalTable
                            className='user-management-table'
                            data={tableData}
                            columns={columns}
                            noDataText='暂无用户，点击“新增用户”开始创建。'
                            loading={loading}
                            sortable
                            scaleWidthMode='Grow'
                            selectionMode='Multiple'
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

            <div className='user-management-pagination'>
                <Button design='Transparent' disabled={page <= 0 || loading} onClick={() => void loadUsers(page - 1)}>
                    上一页
                </Button>
                <span>{`第 ${Math.min(page + 1, totalPages)} / ${totalPages} 页`}</span>
                <Button design='Transparent' disabled={page + 1 >= totalPages || loading}
                        onClick={() => void loadUsers(page + 1)}>
                    下一页
                </Button>
            </div>

            <Dialog
                open={dialogOpen}
                headerText={isEditing ? '编辑用户' : '新增用户'}
                className='user-management-dialog'
                onClose={closeDialog}
            >
                <div className='user-management-form'>
                    {dialogFeedback ? (
                        <MessageStrip design={dialogFeedback.design} className='user-management-dialog-message'
                                      onClose={() => setDialogFeedback(null)}>
                            {dialogFeedback.text}
                        </MessageStrip>
                    ) : null}
                    <label>
                        用户名
                        <Input value={form.username}
                               onInput={(event) => setForm((prev) => ({...prev, username: event.target.value}))}/>
                    </label>
                    <label>
                        邮箱
                        <Input value={form.email}
                               onInput={(event) => setForm((prev) => ({...prev, email: event.target.value}))}/>
                    </label>
                    {!isEditing ? (
                        <label>
                            临时密码
                            <Input
                                type='Password'
                                value={form.password}
                                onInput={(event) => setForm((prev) => ({...prev, password: event.target.value}))}
                            />
                        </label>
                    ) : null}
                    <label>
                        状态
                        <Select value={form.status}
                                onChange={(event) => setForm((prev) => ({...prev, status: event.target.value}))}>
                            <Option value='ACTIVE'>启用</Option>
                            <Option value='INACTIVE'>禁用</Option>
                        </Select>
                    </label>
                    <div className='user-management-role-picker'>
                        <div className='user-management-role-title'>角色分配</div>
                        {roles.length === 0 ? <div className='user-management-role-empty'>暂无角色可分配</div> : null}
                        {roles.map((role) => (
                            <CheckBox
                                key={role.id}
                                text={normalizeRoleName(role)}
                                checked={form.roleIds.includes(role.id)}
                                onChange={(event) => toggleRole(role.id, event.target.checked)}
                            />
                        ))}
                    </div>
                    <div className='user-management-dialog-actions'>
                        <Button design='Emphasized' onClick={() => void submitDialog()}>
                            {isEditing ? '保存修改' : '创建用户'}
                        </Button>
                        <Button design='Transparent' onClick={closeDialog}>
                            取消
                        </Button>
                    </div>
                </div>
            </Dialog>

            <Dialog
                open={passwordDialogOpen}
                headerText={`重置密码：${passwordTargetUser?.username ?? ''}`}
                className='user-management-dialog'
                onClose={closePasswordDialog}
            >
                <div className='user-management-form'>
                    {passwordDialogFeedback ? (
                        <MessageStrip
                            design={passwordDialogFeedback.design}
                            className='user-management-dialog-message'
                            onClose={() => setPasswordDialogFeedback(null)}
                        >
                            {passwordDialogFeedback.text}
                        </MessageStrip>
                    ) : null}
                    <label>
                        新临时密码
                        <Input type='Password' value={newPassword}
                               onInput={(event) => setNewPassword(event.target.value)}/>
                    </label>
                    <div className='user-management-dialog-actions'>
                        <Button design='Emphasized' onClick={() => void submitPasswordReset()}>
                            确认重置
                        </Button>
                        <Button design='Transparent' onClick={closePasswordDialog}>
                            取消
                        </Button>
                    </div>
                </div>
            </Dialog>
        </DynamicPage>
    );
}
