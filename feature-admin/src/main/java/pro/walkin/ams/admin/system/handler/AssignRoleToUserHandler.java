package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.permission.AssignRoleToUserCommand;
import pro.walkin.ams.admin.system.query.RbacQuery;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;
import pro.walkin.ams.persistence.entity.system.UserRole;

@ApplicationScoped
public class AssignRoleToUserHandler implements CommandHandler<AssignRoleToUserCommand, UserRole> {

  @Inject RbacQuery rbacQuery;

  @Override
  @Transactional
  public UserRole handle(AssignRoleToUserCommand cmd) {
    User user = rbacQuery.getUserById(cmd.userId());
    if (user == null) {
      throw new NotFoundException("User", cmd.userId().toString());
    }

    Role role = rbacQuery.findRoleById(cmd.roleId());
    if (role == null) {
      throw new NotFoundException("Role", cmd.roleId().toString());
    }

    UserRole existing =
        rbacQuery.findUserRoleByUserIdAndRoleId(cmd.userId(), cmd.roleId()).orElse(null);
    if (existing != null) {
      return existing;
    }

    UserRole userRole = new UserRole();
    userRole.userId = cmd.userId();
    userRole.roleId = cmd.roleId();
    userRole.persist();

    return userRole;
  }
}
