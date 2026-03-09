package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.permission.GrantPermissionToRoleCommand;
import pro.walkin.ams.admin.system.query.RbacQuery;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.RolePermission;

@ApplicationScoped
public class GrantPermissionToRoleHandler
    implements CommandHandler<GrantPermissionToRoleCommand, RolePermission> {

  @Inject RbacQuery rbacQuery;

  @Override
  @Transactional
  public RolePermission handle(GrantPermissionToRoleCommand cmd) {
    Role role = rbacQuery.findRoleById(cmd.roleId());
    if (role == null) {
      throw new NotFoundException("Role", cmd.roleId().toString());
    }

    Permission permission = rbacQuery.findPermissionById(cmd.permissionId());
    if (permission == null) {
      throw new NotFoundException("Permission", cmd.permissionId().toString());
    }

    RolePermission existing =
        rbacQuery
            .findRolePermissionByRoleIdAndPermissionId(cmd.roleId(), cmd.permissionId())
            .orElse(null);
    if (existing != null) {
      return existing;
    }

    RolePermission rolePermission = new RolePermission();
    rolePermission.roleId = cmd.roleId();
    rolePermission.permissionId = cmd.permissionId();
    rolePermission.persist();

    return rolePermission;
  }
}
