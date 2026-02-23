package pro.walkin.ams.security.config;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.persistence.entity.system.*;
import pro.walkin.ams.security.PasswordService;

/**
 * 安全配置类
 *
 * <p>初始化系统内置的角色、权限等安全配置
 */
@ApplicationScoped
public class SecurityConfig {

  private static final Logger LOG = LoggerFactory.getLogger(SecurityConfig.class);

  @Inject PasswordService passwordService;

  @ConfigProperty(name = "ams.auth.init-default-data", defaultValue = "true")
  boolean initDefaultData;

  void onStart(@Observes StartupEvent ev) {
    LOG.info("Initializing security configuration...");
    if (initDefaultData) {
      initializeDefaultSecurityData();
    }
  }

  @Transactional
  public void initializeDefaultSecurityData() {
    LOG.info("Checking and initializing default security data...");

    // 确保默认租户存在

    Tenant defaultTenant = Tenant_.repo().findByCode("default");
    if (defaultTenant == null) {
      defaultTenant = new Tenant();
      defaultTenant.code = "default";
      defaultTenant.name = "Default Tenant";
      defaultTenant.status = "ACTIVE";
      defaultTenant.persistAndFlush();
      LOG.info("Created default tenant");
    }

    // 创建系统内置权限
    createPermissionIfNotExists(
        defaultTenant,
        Constants.Auth.PERMISSION_ALARM_READ,
        "Alarm Read",
        "Permission to read alarms");
    createPermissionIfNotExists(
        defaultTenant,
        Constants.Auth.PERMISSION_ALARM_WRITE,
        "Alarm Write",
        "Permission to create/update alarms");
    createPermissionIfNotExists(
        defaultTenant,
        Constants.Auth.PERMISSION_ALARM_DELETE,
        "Alarm Delete",
        "Permission to delete alarms");
    createPermissionIfNotExists(
        defaultTenant,
        Constants.Auth.PERMISSION_USER_READ,
        "User Read",
        "Permission to read user information");
    createPermissionIfNotExists(
        defaultTenant,
        Constants.Auth.PERMISSION_USER_WRITE,
        "User Write",
        "Permission to create/update users");
    createPermissionIfNotExists(
        defaultTenant,
        Constants.Auth.PERMISSION_TENANT_MANAGE,
        "Tenant Manage",
        "Permission to manage tenant");

    // 创建内置角色
    Role adminRole =
        createRoleIfNotExists(
            defaultTenant, Constants.Auth.ROLE_ADMIN, "Administrator", "System Administrator Role");
    Role managerRole =
        createRoleIfNotExists(
            defaultTenant, Constants.Auth.ROLE_MANAGER, "Manager", "Tenant Manager Role");
    Role userRole =
        createRoleIfNotExists(
            defaultTenant, Constants.Auth.ROLE_USER, "User", "Standard User Role");

    // 为管理员角色分配所有权限
    if (adminRole != null) {
      assignPermissionToRole(adminRole, Constants.Auth.PERMISSION_ALARM_READ);
      assignPermissionToRole(adminRole, Constants.Auth.PERMISSION_ALARM_WRITE);
      assignPermissionToRole(adminRole, Constants.Auth.PERMISSION_ALARM_DELETE);
      assignPermissionToRole(adminRole, Constants.Auth.PERMISSION_USER_READ);
      assignPermissionToRole(adminRole, Constants.Auth.PERMISSION_USER_WRITE);
      assignPermissionToRole(adminRole, Constants.Auth.PERMISSION_TENANT_MANAGE);
    }

    // 为经理角色分配常用权限
    if (managerRole != null) {
      assignPermissionToRole(managerRole, Constants.Auth.PERMISSION_ALARM_READ);
      assignPermissionToRole(managerRole, Constants.Auth.PERMISSION_ALARM_WRITE);
      assignPermissionToRole(managerRole, Constants.Auth.PERMISSION_USER_READ);
    }

    // 为用户角色分配基本权限
    if (userRole != null) {
      assignPermissionToRole(userRole, Constants.Auth.PERMISSION_ALARM_READ);
    }

    // 初始化默认菜单
    initializeDefaultMenus(defaultTenant);

    // 检查是否存在管理员用户，如果没有则创建一个
    long adminCount = User_.repo().count("username", "admin");
    if (adminCount == 0) {
      createUser(
          "admin", "admin@example.com", "Admin123!", Constants.Auth.ROLE_ADMIN, defaultTenant);
      LOG.info("Created default admin user with username 'admin' and password 'Admin123!'");
    } else {
      User existingAdmin = User_.repo().find("username", "admin").firstResult();
      LOG.info(
          "Admin user already exists with id: {}",
          existingAdmin != null ? existingAdmin.id : "unknown");
    }

    LOG.info("Default security data initialization completed.");
  }

  @Transactional
  void createPermissionIfNotExists(Tenant tenant, String code, String name, String description) {
    Permission_.repo()
        .findByCode(code)
        .orElseGet(
            () -> {
              Permission permission = new Permission();
              permission.code = code;
              permission.name = name;
              permission.description = description;
              permission.tenant = tenant.id;
              permission.sortOrder = 0;
              permission.buttonType = "DEFAULT";
              permission.persist();
              LOG.info("Created permission: {}", code);
              return permission;
            });
  }

  @Transactional
  Role createRoleIfNotExists(Tenant tenant, String code, String name, String description) {
    return Role_.repo()
        .findByCode(code)
        .orElseGet(
            () -> {
              Role role = new Role();
              role.code = code;
              role.name = name;
              role.description = description;
              role.tenant = tenant.id;
              role.persistAndFlush();
              LOG.info("Created role: {}", code);
              return role;
            });
  }

  @Transactional
  void assignPermissionToRole(Role role, String permissionCode) {
    Permission_.repo()
        .findByCode(permissionCode)
        .ifPresent(
            permission -> {
              if (!role.permissions.contains(permission)) {
                role.permissions.add(permission);
                role.persist();
                LOG.info("Assigned permission {} to role {}", permissionCode, role.code);
              }
            });
  }

  @Transactional
  void createUser(String username, String email, String password, String roleCode, Tenant tenant) {
    // 这里我们简单地创建用户而不使用AuthenticationService，
    // 因为在启动时可能某些服务尚未完全初始化
    User user = new User();
    user.username = username;
    user.email = email;

    // 使用BCrypt加密密码（这里假设我们引入了BCrypt）
    // 实际上在这里我们需要手动创建密码服务的实例，或者使用其他方法
    // 在实际环境中，这将在AuthenticationService中处理
    // 此处仅为示例，在真实场景中会使用注入的PasswordService
    user.passwordHash = passwordService.hashPassword(password);
    user.status = Constants.User.STATUS_ACTIVE;
    user.tenant = tenant.id;

    user.persistAndFlush();

    // 分配角色
     Role_.repo().findByCode(roleCode).ifPresent(role -> {
         user.roles.add(role);
         user.persist();
     });
  }

  @Transactional
  void initializeDefaultMenus(Tenant tenant) {
    LOG.info("Initializing default menus...");

    // 仪表盘 - 所有角色可访问
    createMenuIfNotExists(
        tenant,
        "dashboard",
        "仪表盘",
        "/dashboard",
        "DashboardOutlined",
        10,
        Arrays.asList("USER", "MANAGER", "ADMIN"));

    // 告警列表 - 所有角色可访问
    createMenuIfNotExists(
        tenant,
        "alerts",
        "告警列表",
        "/alerts",
        "AlertOutlined",
        20,
        Arrays.asList("USER", "MANAGER", "ADMIN"));

    // 菜单管理 - 仅管理员
    createMenuIfNotExists(
        tenant, "menus", "菜单管理", "/admin/menus", "MenuOutlined", 30, Arrays.asList("ADMIN"));

    // 角色管理 - 仅管理员
    createMenuIfNotExists(
        tenant, "roles", "角色管理", "/admin/roles", "TeamOutlined", 40, Arrays.asList("ADMIN"));

    // 权限管理 - 仅管理员
    createMenuIfNotExists(
        tenant,
        "permissions",
        "权限管理",
        "/admin/permissions",
        "SafetyOutlined",
        50,
        List.of("ADMIN"));

    // 设置 - 所有角色可访问
    createMenuIfNotExists(
        tenant,
        "settings",
        "设置",
        "/settings",
        "SettingOutlined",
        60,
        Arrays.asList("USER", "MANAGER", "ADMIN"));

    // 用户管理 - 仅管理员
    createMenuIfNotExists(
        tenant,
        "admin:users",
        "用户管理",
        "/admin/users",
        "UserOutlined",
        35,
        List.of("ADMIN"));

    LOG.info("Default menus initialization completed.");
  }

  @Transactional
  void createMenuIfNotExists(
      Tenant tenant,
      String key,
      String label,
      String route,
      String icon,
      int sortOrder,
      java.util.List<String> rolesAllowed) {
    Menu existingMenu = Menu_.repo().find("key", key).firstResult();
    if (existingMenu == null) {
      Menu menu = new Menu();
      menu.key = key;
      menu.label = label;
      menu.route = route;
      menu.icon = icon;
      menu.sortOrder = sortOrder;
      menu.isVisible = true;
      menu.rolesAllowed = new ArrayList<>(rolesAllowed);
      menu.tenant = tenant.id;
      menu.persistAndFlush();
      LOG.info("Created menu: {} ({})", label, key);
    }
  }
}
