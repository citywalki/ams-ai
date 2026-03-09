package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.permission.CreatePermissionCommand;
import pro.walkin.ams.persistence.entity.system.Menu;
import pro.walkin.ams.persistence.entity.system.Permission;

@ApplicationScoped
public class CreatePermissionHandler
    implements CommandHandler<CreatePermissionCommand, Permission> {

  @Inject Permission.Repo permissionRepo;

  @Inject Menu.Repo menuRepo;

  @Override
  @Transactional
  public Permission handle(CreatePermissionCommand cmd) {
    Permission permission = new Permission();
    permission.code = cmd.code();
    permission.name = cmd.name();
    permission.description = cmd.description();
    permission.sortOrder = cmd.sortOrder();
    permission.buttonType = cmd.buttonType();

    if (cmd.menuId() != null) {
      permission.menu = menuRepo.findById(cmd.menuId());
    }

    permission.persist();
    return permission;
  }
}
