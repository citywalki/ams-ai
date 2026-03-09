package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.role.AssignRolePermissionsCommand;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Role;

@ApplicationScoped
public class AssignRolePermissionsHandler
    implements CommandHandler<AssignRolePermissionsCommand, Void> {

  @Inject Role.Repo roleRepo;

  @Inject Permission.Repo permissionRepo;

  @Override
  @Transactional
  public Void handle(AssignRolePermissionsCommand cmd) {
    Role role = roleRepo.findById(cmd.roleId());
    if (role == null) {
      throw new NotFoundException("Role", cmd.roleId().toString());
    }

    role.permissions.clear();

    if (cmd.permissionIds() != null && !cmd.permissionIds().isEmpty()) {
      for (Long permissionId : cmd.permissionIds()) {
        Permission permission = permissionRepo.findById(permissionId);
        if (permission != null) {
          role.permissions.add(permission);
        }
      }
    }

    role.updatedAt = java.time.Instant.now();
    return null;
  }
}
