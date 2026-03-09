package pro.walkin.ams.admin.system.handler.role;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.role.CreateRoleCommand;
import pro.walkin.ams.common.exception.BusinessException;
import pro.walkin.ams.persistence.entity.system.Role;

@ApplicationScoped
public class CreateRoleHandler implements CommandHandler<CreateRoleCommand, Role> {

  @Inject Role.Repo roleRepo;

  @Override
  @Transactional
  public Role handle(CreateRoleCommand cmd) {
    roleRepo
        .findByCode(cmd.code())
        .ifPresent(
            existing -> {
              if (cmd.tenantId().equals(existing.tenant)) {
                throw new BusinessException("Role code already exists in current tenant");
              }
            });

    Role role = new Role();
    role.code = cmd.code();
    role.name = cmd.name();
    role.description = cmd.description();
    role.tenant = cmd.tenantId();

    roleRepo.persist(role);
    return role;
  }
}
