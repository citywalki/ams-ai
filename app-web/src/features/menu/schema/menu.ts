export interface Menu {
  id: number;
  key: string;
  label: string;
  route?: string;
  parentId?: number;
  icon?: string;
  sortOrder: number;
  isVisible: boolean;
  menuType: "FOLDER" | "MENU";
  rolesAllowed: string[];
  tenant: number;
  createdAt: string;
  updatedAt: string;
  children: Menu[];
}

export interface MenuTreeItem extends Menu {
  children: MenuTreeItem[];
}
