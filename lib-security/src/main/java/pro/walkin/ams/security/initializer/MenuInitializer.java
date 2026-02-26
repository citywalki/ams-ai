package pro.walkin.ams.security.initializer;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
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

    @Override
    public void initialize() {
        Tenant tenant = tenantInitializer.getDefaultTenant();
        if (tenant == null) {
            log.warn("Default tenant not found, skipping menu initialization");
            return;
        }

        log.info("Initializing default menus...");

        Menu adminFolder = createMenu(
            tenant, "admin", "系统管理", null, "SettingOutlined", 100,
            List.of("ADMIN"), Menu.MenuType.FOLDER, null);

        createMenu(tenant, "dashboard", "仪表盘", "/dashboard", "DashboardOutlined", 10,
            Arrays.asList("USER", "MANAGER", "ADMIN"), Menu.MenuType.MENU, null);

        createMenu(tenant, "alerts", "告警列表", "/alerts", "AlertOutlined", 20,
            Arrays.asList("USER", "MANAGER", "ADMIN"), Menu.MenuType.MENU, null);

        createMenu(tenant, "menus", "菜单管理", "/admin/menus", "MenuOutlined", 30,
            List.of("ADMIN"), Menu.MenuType.MENU, adminFolder != null ? adminFolder.id : null);

        createMenu(tenant, "roles", "角色管理", "/admin/roles", "TeamOutlined", 40,
            List.of("ADMIN"), Menu.MenuType.MENU, adminFolder != null ? adminFolder.id : null);

        createMenu(tenant, "admin:users", "用户管理", "/admin/users", "UserOutlined", 35,
            List.of("ADMIN"), Menu.MenuType.MENU, adminFolder != null ? adminFolder.id : null);

        createMenu(tenant, "admin:dict", "数据字典", "/admin/dict", "BookOutlined", 50,
            List.of("ADMIN"), Menu.MenuType.MENU, adminFolder != null ? adminFolder.id : null);

        createMenu(tenant, "permissions", "权限管理", "/admin/permissions", "LockOutlined", 45,
            List.of("ADMIN"), Menu.MenuType.MENU, adminFolder != null ? adminFolder.id : null);

        createMenu(tenant, "settings", "设置", "/settings", "SettingOutlined", 60,
            Arrays.asList("USER", "MANAGER", "ADMIN"), Menu.MenuType.MENU, null);

        log.info("Default menus initialization completed.");
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