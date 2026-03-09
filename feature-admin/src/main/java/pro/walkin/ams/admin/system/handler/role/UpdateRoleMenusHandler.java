package pro.walkin.ams.admin.system.handler.role;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.role.UpdateRoleMenusCommand;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.persistence.entity.system.Menu;
import pro.walkin.ams.persistence.entity.system.Menu_;
import pro.walkin.ams.persistence.entity.system.Role;

import java.util.List;

@ApplicationScoped
public class UpdateRoleMenusHandler implements CommandHandler<UpdateRoleMenusCommand, Void> {

  @Inject Role.Repo roleRepo;

  @Override
  @Transactional
  public Void handle(UpdateRoleMenusCommand cmd) {
    Role role = roleRepo.findById(cmd.roleId());
    if (role == null) {
      throw new NotFoundException("Role", cmd.roleId().toString());
    }

    List<Menu> allMenus = Menu_.managedBlocking().find("tenant = ?1", cmd.tenantId()).list();

    for (Menu menu : allMenus) {
      boolean shouldBeAllowed = cmd.menuIds().contains(menu.id);
      boolean isCurrentlyAllowed =
          menu.rolesAllowed != null && menu.rolesAllowed.contains(role.code);

      if (shouldBeAllowed != isCurrentlyAllowed) {
        List<String> newRolesAllowed =
            new java.util.ArrayList<>(menu.rolesAllowed != null ? menu.rolesAllowed : List.of());

        if (shouldBeAllowed) {
          if (!newRolesAllowed.contains(role.code)) {
            newRolesAllowed.add(role.code);
          }
        } else {
          newRolesAllowed.remove(role.code);
        }

        menu.rolesAllowed = newRolesAllowed;
        menu.persist();
      }
    }
    return null;
  }
}
