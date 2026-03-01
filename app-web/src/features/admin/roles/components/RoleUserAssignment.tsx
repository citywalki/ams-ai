import { Plus, Search, User, X } from 'lucide-react';
import { Alert, Avatar, Badge, Button, Empty, Input, List, Skeleton, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { type UserItem } from '@/lib/types';

interface RoleUserAssignmentProps {
  roleId: string | null;
  allUsers: UserItem[];
  roleUsers: UserItem[];
  loading: boolean;
  error: string | null;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  onAssignUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
}

export function RoleUserAssignment({
  allUsers,
  roleUsers,
  loading,
  error,
  searchKeyword,
  onSearchChange,
  onAssignUser,
  onRemoveUser,
}: RoleUserAssignmentProps) {
  const { t } = useTranslation();

  const roleUserIds = new Set(roleUsers.map((u) => u.id));
  const filteredUsers = allUsers.filter((user) => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return user.username.toLowerCase().includes(keyword) || user.email?.toLowerCase().includes(keyword);
  });

  const assignedUsers = filteredUsers.filter((user) => roleUserIds.has(user.id));
  const unassignedUsers = filteredUsers.filter((user) => !roleUserIds.has(user.id));

  const renderUserItem = (user: UserItem, assigned: boolean) => (
    <List.Item
      actions={[
        assigned ? (
          <Button key="remove" type="text" icon={<X className="h-4 w-4" />} onClick={() => onRemoveUser(user.id)} />
        ) : (
          <Button key="add" type="text" icon={<Plus className="h-4 w-4" />} onClick={() => onAssignUser(user.id)} />
        ),
      ]}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            icon={<User className="h-3.5 w-3.5" />}
            style={{ backgroundColor: assigned ? 'var(--ams-color-primary)' : '#d9d9d9' }}
          />
        }
        title={user.username}
        description={user.email}
      />
    </List.Item>
  );

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Space>
        <Typography.Text strong>{t('pages.roleManagement.form.userAssignment')}</Typography.Text>
        <Badge count={roleUsers.length} showZero />
      </Space>

      {error && <Alert type="error" showIcon message={error} />}

      <Input
        prefix={<Search className="h-4 w-4" />}
        placeholder={t('pages.roleManagement.form.searchUsers')}
        value={searchKeyword}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {loading ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} active paragraph={{ rows: 1 }} title={false} />
          ))}
        </Space>
      ) : filteredUsers.length === 0 ? (
        <Empty description={t('pages.roleManagement.messages.noUsers')} />
      ) : (
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Typography.Text type="secondary">{t('pages.roleManagement.form.assignedUsers')}</Typography.Text>
          <List bordered locale={{ emptyText: t('pages.roleManagement.messages.noUsers') }} dataSource={assignedUsers} renderItem={(user) => renderUserItem(user, true)} />
          <Typography.Text type="secondary">{t('pages.roleManagement.form.availableUsers')}</Typography.Text>
          <List bordered locale={{ emptyText: t('pages.roleManagement.messages.noUsers') }} dataSource={unassignedUsers} renderItem={(user) => renderUserItem(user, false)} />
        </Space>
      )}
    </Space>
  );
}
