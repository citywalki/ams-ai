import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateUserList } from '../queries';
import type { UserSearchParams } from '../types';

export function useUserSearch() {
  const queryClient = useQueryClient();

  const [searchUsername, setSearchUsername] = useState('');
  const [queryUsername, setQueryUsername] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('all');
  const [queryStatus, setQueryStatus] = useState<string>('all');

  const handleSearch = useCallback(() => {
    setQueryUsername(searchUsername.trim());
    setQueryStatus(searchStatus);
    void invalidateUserList(queryClient);
  }, [searchUsername, searchStatus, queryClient]);

  const handleReset = useCallback(() => {
    setSearchUsername('');
    setSearchStatus('all');
    setQueryUsername('');
    setQueryStatus('all');
    void invalidateUserList(queryClient);
  }, [queryClient]);

  const searchParams: UserSearchParams = {};
  if (queryUsername) searchParams.username = queryUsername;
  if (queryStatus !== 'all') searchParams.status = queryStatus;

  return {
    searchUsername,
    setSearchUsername,
    searchStatus,
    setSearchStatus,
    handleSearch,
    handleReset,
    searchParams,
  };
}
