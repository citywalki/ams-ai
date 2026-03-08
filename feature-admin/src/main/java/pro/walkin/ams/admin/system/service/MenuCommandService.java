package pro.walkin.ams.admin.system.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.admin.system.query.MenuQuery;
import pro.walkin.ams.common.dto.MenuDto;
import pro.walkin.ams.common.dto.MenuResponseDto;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.Menu;

import java.util.Objects;

/** 菜单命令服务 - 处理菜单的写操作（创建、更新、删除） */
@ApplicationScoped
@Transactional
public class MenuCommandService {
  private static final Logger LOG = LoggerFactory.getLogger(MenuCommandService.class);

  @Inject Menu.Repo menuRepo;

  @Inject MenuQuery menuQuery;

  @Inject MenuMapper menuMapper;

  /** 创建菜单 */
  public MenuResponseDto createMenu(MenuDto dto, Long tenantId) {
    Objects.requireNonNull(dto, "菜单数据不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");

    // 检查key是否已存在（同一租户内唯一）
    if (menuQuery.countByKey(dto.key()) > 0) {
      throw new ValidationException("菜单标识符已存在", "key", dto.key());
    }

    // 如果指定了parentId，检查父菜单是否存在且属于同一租户
    if (dto.parentId() != null) {
      Menu parent = menuQuery.findById(dto.parentId());
      if (parent == null) {
        throw new NotFoundException("Menu", dto.parentId().toString());
      }
      if (!tenantId.equals(parent.tenant)) {
        throw new ValidationException("父菜单不属于当前租户", "parentId", dto.parentId());
      }
    }

    Menu menu = new Menu();
    menuMapper.mapDtoToEntity(dto, menu);
    menu.tenant = tenantId;
    menu.persist();

    LOG.debug("创建菜单成功: id={}, key={}, tenant={}", menu.id, menu.key, tenantId);
    return menuMapper.mapEntityToResponseDto(menu);
  }

  /** 更新菜单 */
  public MenuResponseDto updateMenu(Long id, MenuDto dto, Long tenantId) {
    Objects.requireNonNull(id, "菜单ID不能为空");
    Objects.requireNonNull(dto, "菜单数据不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");

    Menu menu = menuQuery.findById(id);
    if (menu == null) {
      throw new NotFoundException("Menu", id.toString());
    }
    if (!tenantId.equals(menu.tenant)) {
      throw new ValidationException("菜单不属于当前租户", "id", id);
    }

    // 如果key被修改，检查新key是否已存在（同一租户内唯一）
    if (!dto.key().equals(menu.key)
        && menuQuery.countByKeyAndTenantAndIdNot(dto.key(), tenantId, id) > 0) {
      throw new ValidationException("菜单标识符已存在", "key", dto.key());
    }

    // 如果指定了parentId，检查父菜单是否存在且属于同一租户（不能设置自己为父菜单）
    if (dto.parentId() != null) {
      if (dto.parentId().equals(id)) {
        throw new ValidationException("不能将菜单设置为自己的父菜单", "parentId", dto.parentId());
      }
      Menu parent = menuQuery.findById(dto.parentId());
      if (parent == null) {
        throw new NotFoundException("Menu", dto.parentId().toString());
      }
      if (!tenantId.equals(parent.tenant)) {
        throw new ValidationException("父菜单不属于当前租户", "parentId", dto.parentId());
      }
    }

    menuMapper.mapDtoToEntity(dto, menu);
    menuRepo.persist(menu);

    LOG.debug("更新菜单成功: id={}, key={}, tenant={}", menu.id, menu.key, tenantId);
    return menuMapper.mapEntityToResponseDto(menu);
  }

  /** 删除菜单 */
  public void deleteMenu(Long id, Long tenantId) {
    Objects.requireNonNull(id, "菜单ID不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");

    Menu menu = menuQuery.findById(id);
    if (menu == null) {
      throw new NotFoundException("Menu", id.toString());
    }
    if (!tenantId.equals(menu.tenant)) {
      throw new ValidationException("菜单不属于当前租户", "id", id);
    }

    // 检查是否有子菜单
    if (menuQuery.countByParentIdAndTenant(id, tenantId) > 0) {
      throw new ValidationException("请先删除子菜单", "id", id);
    }

    menu.delete();
    LOG.debug("删除菜单成功: id={}, key={}, tenant={}", id, menu.key, tenantId);
  }
}
