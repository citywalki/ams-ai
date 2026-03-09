package pro.walkin.ams.admin.system.handler.role;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.role.DeleteRoleCommand;
import pro.walkin.ams.common.exception.BusinessException;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;

@ApplicationScoped
public class DeleteRoleHandler implements CommandHandler<DeleteRoleCommand, Void> {

  @Inject Role.Repo roleRepo;

  @Inject User.Repo userRepo;

  @Override
  @Transactional
  public Void handle(DeleteRoleCommand cmd) {
    Role role =
        roleRepo
            .findByIdOptional(cmd.id())
            .orElseThrow(() -> new NotFoundException("Role", cmd.id().toString()));

    long assignedUserCount =
        userRepo.count("select count(u) from User u join u.roles r where r.id = ?1", cmd.id());
    if (assignedUserCount > 0) {
      throw new BusinessException("Role is assigned to users and cannot be deleted");
    }

    roleRepo.delete(role);
    return null;
  }
}
