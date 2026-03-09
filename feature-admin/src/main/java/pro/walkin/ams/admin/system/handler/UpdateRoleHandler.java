package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.role.UpdateRoleCommand;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.persistence.entity.system.Role;

@ApplicationScoped
public class UpdateRoleHandler implements CommandHandler<UpdateRoleCommand, Role> {

  @Inject Role.Repo roleRepo;

  @Override
  @Transactional
  public Role handle(UpdateRoleCommand cmd) {
    Role role =
        roleRepo
            .findByIdOptional(cmd.id())
            .orElseThrow(() -> new NotFoundException("Role", cmd.id().toString()));

    role.code = cmd.code();
    role.name = cmd.name();
    role.description = cmd.description();
    role.updatedAt = java.time.Instant.now();

    return role;
  }
}
