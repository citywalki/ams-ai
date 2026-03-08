package pro.walkin.ams.admin.system.service;

import jakarta.enterprise.context.ApplicationScoped;
import pro.walkin.ams.common.dto.MenuDto;
import pro.walkin.ams.common.dto.MenuResponseDto;
import pro.walkin.ams.persistence.entity.system.Menu;

import java.util.ArrayList;
import java.util.HashMap;

/** 菜单对象映射器 - 处理 Menu 实体与 DTO 之间的转换 */
@ApplicationScoped
public class MenuMapper {

  /** 将 DTO 映射到实体 */
  public void mapDtoToEntity(MenuDto dto, Menu entity) {
    entity.key = dto.key();
    entity.label = dto.label();
    entity.route = dto.route();
    entity.parentId = dto.parentId();
    entity.icon = dto.icon();
    entity.sortOrder = dto.sortOrder();
    entity.isVisible = dto.isVisible();
    if (dto.menuType() != null && !dto.menuType().isBlank()) {
      entity.menuType = Menu.MenuType.valueOf(dto.menuType());
    }
    entity.rolesAllowed = new ArrayList<>(dto.rolesAllowed());
    entity.metadata = new HashMap<>(dto.metadata());
  }

  /** 将实体映射为响应 DTO */
  public MenuResponseDto mapEntityToResponseDto(Menu entity) {
    return new MenuResponseDto(
        entity.id,
        entity.key,
        entity.label,
        entity.route,
        entity.parentId,
        entity.icon,
        entity.sortOrder,
        entity.isVisible,
        entity.menuType != null ? entity.menuType.name() : "MENU",
        new ArrayList<>(entity.rolesAllowed),
        new HashMap<>(entity.metadata),
        entity.tenant,
        entity.createdAt,
        entity.updatedAt,
        new ArrayList<>());
  }
}
