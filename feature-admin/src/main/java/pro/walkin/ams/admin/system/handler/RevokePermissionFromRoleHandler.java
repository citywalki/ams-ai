package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.permission.RevokePermissionFromRoleCommand;
import pro.walkin.ams.admin.system.query.RbacQuery;
import pro.walkin.ams.persistence.entity.system.RolePermission;

@ApplicationScoped
public class RevokePermissionFromRoleHandler
    implements CommandHandler<RevokePermissionFromRoleCommand, Void> {

  @Inject RbacQuery rbacQuery;

  @Override
  @Transactional
  public Void handle(RevokePermissionFromRoleCommand cmd) {
    rbacQuery
        .findRolePermissionByRoleIdAndPermissionId(cmd.roleId(), cmd.permissionId())
        .ifPresent(RolePermission::delete);

    return null;
  }
}
