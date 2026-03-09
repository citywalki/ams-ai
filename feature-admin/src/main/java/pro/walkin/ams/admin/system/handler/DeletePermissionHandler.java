package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.permission.DeletePermissionCommand;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.persistence.entity.system.Permission;

@ApplicationScoped
public class DeletePermissionHandler implements CommandHandler<DeletePermissionCommand, Void> {

  @Inject Permission.Repo permissionRepo;

  @Override
  @Transactional
  public Void handle(DeletePermissionCommand cmd) {
    Permission permission =
        permissionRepo
            .findByIdOptional(cmd.id())
            .orElseThrow(() -> new NotFoundException("Permission", cmd.id().toString()));
    permissionRepo.delete(permission);
    return null;
  }
}
