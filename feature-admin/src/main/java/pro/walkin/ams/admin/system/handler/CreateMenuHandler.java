package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.menu.CreateMenuCommand;
import pro.walkin.ams.admin.system.query.MenuQuery;
import pro.walkin.ams.admin.system.service.MenuMapper;
import pro.walkin.ams.common.dto.MenuResponseDto;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.Menu;

@ApplicationScoped
public class CreateMenuHandler implements CommandHandler<CreateMenuCommand, MenuResponseDto> {

  @Inject Menu.Repo menuRepo;

  @Inject MenuQuery menuQuery;

  @Inject MenuMapper menuMapper;

  @Override
  @Transactional
  public MenuResponseDto handle(CreateMenuCommand cmd) {
    if (menuQuery.countByKey(cmd.key()) > 0) {
      throw new ValidationException("菜单标识符已存在", "key", cmd.key());
    }

    if (cmd.parentId() != null) {
      Menu parent = menuQuery.findById(cmd.parentId());
      if (parent == null) {
        throw new NotFoundException("Menu", cmd.parentId().toString());
      }
      if (!cmd.tenantId().equals(parent.tenant)) {
        throw new ValidationException("父菜单不属于当前租户", "parentId", cmd.parentId());
      }
    }

    Menu menu = new Menu();
    menu.key = cmd.key();
    menu.label = cmd.label();
    menu.route = cmd.path();
    menu.icon = cmd.icon();
    menu.parentId = cmd.parentId();
    menu.sortOrder = cmd.sortOrder();
    menu.isVisible = "ACTIVE".equals(cmd.status());
    menu.tenant = cmd.tenantId();
    menu.persist();

    return menuMapper.mapEntityToResponseDto(menu);
  }
}
