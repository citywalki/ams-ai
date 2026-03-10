package pro.walkin.ams.admin.system.handler.menu;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.menu.UpdateMenuCommand;
import pro.walkin.ams.admin.system.mapper.MenuMapper;
import pro.walkin.ams.admin.system.query.MenuQuery;
import pro.walkin.ams.common.dto.MenuResponseDto;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.Menu;

@ApplicationScoped
public class UpdateMenuHandler implements CommandHandler<UpdateMenuCommand, MenuResponseDto> {

  @Inject Menu.Repo menuRepo;

  @Inject MenuQuery menuQuery;

  @Inject MenuMapper menuMapper;

  @Override
  @Transactional
  public MenuResponseDto handle(UpdateMenuCommand cmd) {
    Menu menu = menuQuery.findById(cmd.id());
    if (menu == null) {
      throw new NotFoundException("Menu", cmd.id().toString());
    }

    if (!cmd.key().equals(menu.key)
        && menuQuery.countByKeyAndTenantAndIdNot(cmd.key(), menu.tenant, cmd.id()) > 0) {
      throw new ValidationException("菜单标识符已存在", "key", cmd.key());
    }

    if (cmd.parentId() != null) {
      if (cmd.parentId().equals(cmd.id())) {
        throw new ValidationException("不能将菜单设置为自己的父菜单", "parentId", cmd.parentId());
      }
      Menu parent = menuQuery.findById(cmd.parentId());
      if (parent == null) {
        throw new NotFoundException("Menu", cmd.parentId().toString());
      }
      if (!menu.tenant.equals(parent.tenant)) {
        throw new ValidationException("父菜单不属于当前租户", "parentId", cmd.parentId());
      }
    }

    menu.key = cmd.key();
    menu.label = cmd.label();
    menu.route = cmd.path();
    menu.icon = cmd.icon();
    menu.parentId = cmd.parentId();
    menu.sortOrder = cmd.sortOrder();
    menu.isVisible = "ACTIVE".equals(cmd.status());
    menuRepo.persist(menu);

    return menuMapper.mapEntityToResponseDto(menu);
  }
}
