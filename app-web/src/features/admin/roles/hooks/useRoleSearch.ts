import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateRoleList } from '../queries';
import { type RoleSearchState, initialSearchState } from '../types';

export function useRoleSearch() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<RoleSearchState>(initialSearchState);

  const setSearchKeyword = useCallback((keyword: string) => {
    setState((prev) => ({ ...prev, keyword }));
  }, []);

  const handleSearch = useCallback(() => {
    setState((prev) => ({ ...prev, queryKeyword: prev.keyword.trim() }));
    void invalidateRoleList(queryClient);
  }, [queryClient]);

  const handleReset = useCallback(() => {
    setState(initialSearchState);
    void invalidateRoleList(queryClient);
  }, [queryClient]);

  const searchParams: Record<string, string> = {};
  if (state.queryKeyword) {
    searchParams.keyword = state.queryKeyword;
  }

  return {
    searchKeyword: state.keyword,
    setSearchKeyword,
    queryKeyword: state.queryKeyword,
    handleSearch,
    handleReset,
    searchParams,
  };
}
