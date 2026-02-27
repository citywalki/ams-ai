package pro.walkin.ams.boot.initializer;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Permission_;
import pro.walkin.ams.persistence.entity.system.Tenant;

@ApplicationScoped
public class PermissionInitializer extends DataInitializer {

  @Inject TenantInitializer tenantInitializer;

  @Override
  @Transactional
  public void initialize() {
    Tenant tenant = tenantInitializer.getDefaultTenant();
    if (tenant == null) {
      log.warn("Default tenant not found, skipping permission initialization");
      return;
    }

    createPermissionIfNotExists(
        tenant, Constants.Auth.PERMISSION_ALARM_READ, "Alarm Read", "Permission to read alarms");
    createPermissionIfNotExists(
        tenant,
        Constants.Auth.PERMISSION_ALARM_WRITE,
        "Alarm Write",
        "Permission to create/update alarms");
    createPermissionIfNotExists(
        tenant,
        Constants.Auth.PERMISSION_ALARM_DELETE,
        "Alarm Delete",
        "Permission to delete alarms");
    createPermissionIfNotExists(
        tenant,
        Constants.Auth.PERMISSION_USER_READ,
        "User Read",
        "Permission to read user information");
    createPermissionIfNotExists(
        tenant,
        Constants.Auth.PERMISSION_USER_WRITE,
        "User Write",
        "Permission to create/update users");
    createPermissionIfNotExists(
        tenant,
        Constants.Auth.PERMISSION_TENANT_MANAGE,
        "Tenant Manage",
        "Permission to manage tenant");
  }

  private void createPermissionIfNotExists(
      Tenant tenant, String code, String name, String description) {
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
              log.info("Created permission: {}", code);
              return permission;
            });
  }
}
