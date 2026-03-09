package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.permission.RevokeRoleFromUserCommand;
import pro.walkin.ams.admin.system.query.RbacQuery;
import pro.walkin.ams.persistence.entity.system.UserRole;

@ApplicationScoped
public class RevokeRoleFromUserHandler implements CommandHandler<RevokeRoleFromUserCommand, Void> {

  @Inject RbacQuery rbacQuery;

  @Override
  @Transactional
  public Void handle(RevokeRoleFromUserCommand cmd) {
    rbacQuery.findUserRoleByUserIdAndRoleId(cmd.userId(), cmd.roleId()).ifPresent(UserRole::delete);

    return null;
  }
}
