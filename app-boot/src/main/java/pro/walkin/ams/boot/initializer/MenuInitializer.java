package pro.walkin.ams.boot.initializer;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import pro.walkin.ams.persistence.entity.system.Menu;
import pro.walkin.ams.persistence.entity.system.Menu_;
import pro.walkin.ams.persistence.entity.system.Tenant;

@ApplicationScoped
public class MenuInitializer extends DataInitializer {

    @Inject
    TenantInitializer tenantInitializer;

    public static final String ROOT_MENU_KEY = "root";

    @Override
    @Transactional
    public void initialize() {
        Tenant tenant = tenantInitializer.getDefaultTenant();
        if (tenant == null) {
            log.warn("Default tenant not found, skipping menu initialization");
            return;
        }

        log.info("Initializing default menus...");

        // 创建根目录菜单（虚拟节点，不显示在前端导航中）
        Menu rootFolder = createMenu(
            tenant, ROOT_MENU_KEY, "Root", null, null, 0,
            List.of(), Menu.MenuType.FOLDER, null);

        Menu adminFolder = createMenu(
            tenant, "admin", "系统管理", null, "SettingOutlined", 100,
            List.of("ADMIN"), Menu.MenuType.FOLDER, rootFolder.id);

        createMenu(tenant, "dashboard", "仪表盘", "/dashboard", "DashboardOutlined", 10,
            Arrays.asList("USER", "MANAGER", "ADMIN"), Menu.MenuType.MENU, rootFolder.id);

        createMenu(tenant, "alerts", "告警列表", "/alerts", "AlertOutlined", 20,
            Arrays.asList("USER", "MANAGER", "ADMIN"), Menu.MenuType.MENU, rootFolder.id);

    createMenu(
        tenant,
        "menus",
        "菜单管理",
        "/admin/menus",
        "MenuOutlined",
        30,
        List.of("ADMIN"),
        Menu.MenuType.MENU,
        adminFolder.id);

    createMenu(
        tenant,
        "roles",
        "角色管理",
        "/admin/roles",
        "TeamOutlined",
        40,
        List.of("ADMIN"),
        Menu.MenuType.MENU,
        adminFolder.id);

    createMenu(
        tenant,
        "admin:users",
        "用户管理",
        "/admin/users",
        "UserOutlined",
        35,
        List.of("ADMIN"),
        Menu.MenuType.MENU,
        adminFolder.id);

    createMenu(
        tenant,
        "admin:dict",
        "数据字典",
        "/admin/dict",
        "BookOutlined",
        50,
        List.of("ADMIN"),
        Menu.MenuType.MENU,
        adminFolder.id);

        log.info("Default menus initialization completed.");

        // 迁移现有数据：将所有 parentId = null 的菜单（除了根目录）的 parentId 更新为根目录
        migrateMenusToRoot(tenant, rootFolder);
    }

    /**
     * 迁移现有菜单数据到根目录下
     */
    private void migrateMenusToRoot(Tenant tenant, Menu rootFolder) {
        // 查找所有 parentId = null 且不是根目录的菜单
        List<Menu> orphanMenus = Menu_.repo().list(
            "parentId is null and key != ?1 and tenant = ?2",
            ROOT_MENU_KEY, tenant.id);

        if (!orphanMenus.isEmpty()) {
            log.info("Migrating {} orphan menus to root folder", orphanMenus.size());
            for (Menu menu : orphanMenus) {
                menu.parentId = rootFolder.id;
                menu.persist();
            }
            Menu_.repo().flush();
            log.info("Migration completed");
        }
    }

    private Menu createMenu(
            Tenant tenant, String key, String label, String route, String icon, int sortOrder,
            List<String> rolesAllowed, Menu.MenuType menuType, Long parentId) {
        Menu existingMenu = Menu_.repo().find("key", key).firstResult();
        if (existingMenu == null) {
            Menu menu = new Menu();
            menu.key = key;
            menu.label = label;
            menu.route = route;
            menu.icon = icon;
            menu.sortOrder = sortOrder;
            menu.isVisible = true;
            menu.menuType = menuType != null ? menuType : Menu.MenuType.MENU;
            menu.rolesAllowed = new ArrayList<>(rolesAllowed);
            menu.tenant = tenant.id;
            menu.parentId = parentId;
            menu.persistAndFlush();
            log.info("Created menu: {} ({})", label, key);
            return menu;
        }
        return existingMenu;
    }
}