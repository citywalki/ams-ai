package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.menu.DeleteMenuCommand;
import pro.walkin.ams.admin.system.query.MenuQuery;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.Menu;

@ApplicationScoped
public class DeleteMenuHandler implements CommandHandler<DeleteMenuCommand, Void> {

  @Inject MenuQuery menuQuery;

  @Override
  @Transactional
  public Void handle(DeleteMenuCommand cmd) {
    Menu menu = menuQuery.findById(cmd.id());
    if (menu == null) {
      throw new NotFoundException("Menu", cmd.id().toString());
    }
    if (!cmd.tenantId().equals(menu.tenant)) {
      throw new ValidationException("菜单不属于当前租户", "id", cmd.id());
    }

    if (menuQuery.countByParentIdAndTenant(cmd.id(), cmd.tenantId()) > 0) {
      throw new ValidationException("请先删除子菜单", "id", cmd.id());
    }

    menu.delete();
    return null;
  }
}
