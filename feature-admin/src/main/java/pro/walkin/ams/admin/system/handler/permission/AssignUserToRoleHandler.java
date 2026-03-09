package pro.walkin.ams.admin.system.handler.permission;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.role.AssignUserToRoleCommand;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;

import java.util.HashSet;

@ApplicationScoped
public class AssignUserToRoleHandler implements CommandHandler<AssignUserToRoleCommand, Void> {

  @Inject Role.Repo roleRepo;

  @Inject User.Repo userRepo;

  @Override
  @Transactional
  public Void handle(AssignUserToRoleCommand cmd) {
    Role role = roleRepo.findById(cmd.roleId());
    User user = userRepo.findById(cmd.userId());

    if (role == null || user == null) {
      throw new NotFoundException("Role or User not found");
    }

    if (user.roles == null) {
      user.roles = new HashSet<>();
    }

    if (!user.roles.contains(role)) {
      user.roles.add(role);
      user.updatedAt = java.time.Instant.now();
    }
    return null;
  }
}
