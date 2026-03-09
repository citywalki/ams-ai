package pro.walkin.ams.admin.system.handler.permission;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.role.RemoveUserFromRoleCommand;
import pro.walkin.ams.persistence.entity.system.User;

@ApplicationScoped
public class RemoveUserFromRoleHandler implements CommandHandler<RemoveUserFromRoleCommand, Void> {

  @Inject User.Repo userRepo;

  @Override
  @Transactional
  public Void handle(RemoveUserFromRoleCommand cmd) {
    User user = userRepo.findById(cmd.userId());
    if (user != null && user.roles != null) {
      user.roles.removeIf(r -> r.id != null && r.id.equals(cmd.roleId()));
      user.updatedAt = java.time.Instant.now();
    }
    return null;
  }
}
