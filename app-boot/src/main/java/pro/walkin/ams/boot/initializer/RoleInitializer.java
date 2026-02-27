package pro.walkin.ams.boot.initializer;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.persistence.entity.system.Permission_;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.Role_;
import pro.walkin.ams.persistence.entity.system.Tenant;

@ApplicationScoped
public class RoleInitializer extends DataInitializer {

    @Inject
    TenantInitializer tenantInitializer;

    private Role adminRole;
    private Role managerRole;
    private Role userRole;

  @Override
  @Transactional
  public void initialize() {
        Tenant tenant = tenantInitializer.getDefaultTenant();
        if (tenant == null) {
            log.warn("Default tenant not found, skipping role initialization");
            return;
        }

        adminRole = createRoleIfNotExists(tenant, Constants.Auth.ROLE_ADMIN, "Administrator", "System Administrator Role");
        managerRole = createRoleIfNotExists(tenant, Constants.Auth.ROLE_MANAGER, "Manager", "Tenant Manager Role");
        userRole = createRoleIfNotExists(tenant, Constants.Auth.ROLE_USER, "User", "Standard User Role");

        if (adminRole != null) {
            assignPermissionToRole(adminRole, Constants.Auth.PERMISSION_ALARM_READ);
            assignPermissionToRole(adminRole, Constants.Auth.PERMISSION_ALARM_WRITE);
            assignPermissionToRole(adminRole, Constants.Auth.PERMISSION_ALARM_DELETE);
            assignPermissionToRole(adminRole, Constants.Auth.PERMISSION_USER_READ);
            assignPermissionToRole(adminRole, Constants.Auth.PERMISSION_USER_WRITE);
            assignPermissionToRole(adminRole, Constants.Auth.PERMISSION_TENANT_MANAGE);
        }

        if (managerRole != null) {
            assignPermissionToRole(managerRole, Constants.Auth.PERMISSION_ALARM_READ);
            assignPermissionToRole(managerRole, Constants.Auth.PERMISSION_ALARM_WRITE);
            assignPermissionToRole(managerRole, Constants.Auth.PERMISSION_USER_READ);
        }

        if (userRole != null) {
            assignPermissionToRole(userRole, Constants.Auth.PERMISSION_ALARM_READ);
        }
    }

    private Role createRoleIfNotExists(Tenant tenant, String code, String name, String description) {
        return Role_.repo().findByCode(code).orElseGet(() -> {
            Role role = new Role();
            role.code = code;
            role.name = name;
            role.description = description;
            role.tenant = tenant.id;
            role.persistAndFlush();
            log.info("Created role: {}", code);
            return role;
        });
    }

    private void assignPermissionToRole(Role role, String permissionCode) {
        Permission_.repo().findByCode(permissionCode).ifPresent(permission -> {
            if (!role.permissions.contains(permission)) {
                role.permissions.add(permission);
                role.persist();
                log.info("Assigned permission {} to role {}", permissionCode, role.code);
            }
        });
    }

    public Role getAdminRole() {
        return adminRole;
    }
}
