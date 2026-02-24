import { create } from 'zustand';
import { permissionApi } from '@/services';

type PermissionState = {
  permissions: string[];
  isLoading: boolean;
  error: string | null;
  fetchPermissions: () => Promise<void>;
  hasPermission: (permissionCode: string) => boolean;
  reset: () => void;
};

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: [],
  isLoading: false,
  error: null,

  fetchPermissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const permissions = await permissionApi.getUserPermissions();
      set({ permissions, isLoading: false, error: null });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '获取权限失败';
      set({ isLoading: false, error: message });
    }
  },

  hasPermission: (permissionCode: string) => {
    return get().permissions.includes(permissionCode);
  },

  reset: () => {
    set({ permissions: [], isLoading: false, error: null });
  }
}));
