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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 菜单服务 - 协调菜单相关操作 具体的职责已拆分到以下组件： - MenuCommandService: 写操作（创建、更新、删除） - MenuQuery: 基础查询 -
 * MenuTreeBuilder: 树形结构构建 - MenuPermissionChecker: 权限检查 - MenuMapper: 对象映射
 */
@ApplicationScoped
@Transactional
public class MenuService {
  private static final Logger LOG = LoggerFactory.getLogger(MenuService.class);
  private static final String ROOT_MENU_KEY = "root";

  @Inject MenuQuery menuQuery;

  @Inject MenuCommandService commandService;

  @Inject MenuTreeBuilder treeBuilder;

  @Inject MenuPermissionChecker permissionChecker;

  @Inject MenuMapper menuMapper;

  // ========== 委托给 CommandService 的写操作 ==========

  public MenuResponseDto createMenu(MenuDto dto, Long tenantId) {
    Objects.requireNonNull(dto, "菜单数据不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");
    return commandService.createMenu(dto, tenantId);
  }

  public MenuResponseDto updateMenu(Long id, MenuDto dto, Long tenantId) {
    Objects.requireNonNull(id, "菜单ID不能为空");
    Objects.requireNonNull(dto, "菜单数据不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");
    MenuResponseDto result = commandService.updateMenu(id, dto, tenantId);
    invalidateMenuCaches(tenantId);
    return result;
  }

  public void deleteMenu(Long id, Long tenantId) {
    Objects.requireNonNull(id, "菜单ID不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");
    commandService.deleteMenu(id, tenantId);
    invalidateMenuCaches(tenantId);
  }

  // ========== 委托给 Query 的基础查询 ==========

  public MenuResponseDto getMenuById(Long id, Long tenantId) {
    Objects.requireNonNull(id, "菜单ID不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");

    Menu menu = menuQuery.findById(id);
    if (menu == null) {
      throw new NotFoundException("Menu", id.toString());
    }
    if (!tenantId.equals(menu.tenant)) {
      throw new ValidationException("菜单不属于当前租户", "id", id);
    }

    return menuMapper.mapEntityToResponseDto(menu);
  }

  public Menu findByKey(String key) {
    return menuQuery.findByKey(key);
  }

  public Menu findById(Long id) {
    return menuQuery.findById(id);
  }

  public List<MenuResponseDto> getAllMenus(Long tenantId) {
    Objects.requireNonNull(tenantId, "租户ID不能为空");

    List<Menu> menus = menuQuery.listByTenant(tenantId);
    return menus.stream().map(menuMapper::mapEntityToResponseDto).collect(Collectors.toList());
  }

  public List<MenuResponseDto> getFolders(Long tenantId) {
    Objects.requireNonNull(tenantId, "租户ID不能为空");
    List<Menu> folders = menuQuery.listByMenuTypeAndTenant(Menu.MenuType.FOLDER, tenantId);

    // 过滤掉根目录菜单
    folders =
        folders.stream()
            .filter(folder -> !ROOT_MENU_KEY.equals(folder.key))
            .collect(Collectors.toList());

    Map<Long, Long> childCountByParent =
        menuQuery.listByParentIdNotNullAndTenant(tenantId).stream()
            .collect(Collectors.groupingBy(menu -> menu.parentId, Collectors.counting()));

    return folders.stream()
        .map(
            folder -> {
              MenuResponseDto dto = menuMapper.mapEntityToResponseDto(folder);
              Map<String, Object> metadata = new HashMap<>(dto.metadata());
              metadata.put("menuCount", childCountByParent.getOrDefault(folder.id, 0L));

              return new MenuResponseDto(
                  dto.id(),
                  dto.key(),
                  dto.label(),
                  dto.route(),
                  dto.parentId(),
                  dto.icon(),
                  dto.sortOrder(),
                  dto.isVisible(),
                  dto.menuType(),
                  dto.rolesAllowed(),
                  metadata,
                  dto.tenant(),
                  dto.createdAt(),
                  dto.updatedAt(),
                  dto.children());
            })
        .collect(Collectors.toList());
  }

  public List<MenuResponseDto> getMenusByParentId(Long parentId, Long tenantId) {
    Objects.requireNonNull(tenantId, "租户ID不能为空");
    List<Menu> menus;
    if (parentId == null) {
      // 获取根目录的子菜单
      Menu rootMenu = menuQuery.findByKeyAndTenant(ROOT_MENU_KEY, tenantId).orElse(null);
      if (rootMenu != null) {
        menus = menuQuery.listByParentIdAndTenant(rootMenu.id, tenantId);
      } else {
        // 如果根目录不存在，返回空列表
        menus = List.of();
      }
    } else {
      menus = menuQuery.listByParentIdAndTenant(parentId, tenantId);
    }
    return menus.stream().map(menuMapper::mapEntityToResponseDto).collect(Collectors.toList());
  }

  // ========== 委托给 PermissionChecker 的权限相关操作 ==========

  public List<MenuResponseDto> getUserMenus(Long userId, Long tenantId) {
    return permissionChecker.getUserMenus(userId, tenantId);
  }

  // ========== 委托给 TreeBuilder 的树形结构操作 ==========

  public List<MenuResponseDto> getMenuTree(Long tenantId) {
    Objects.requireNonNull(tenantId, "租户ID不能为空");

    List<Menu> allMenus = menuQuery.listByTenant(tenantId);
    return treeBuilder.buildMenuTreeForAdmin(allMenus);
  }

  // ========== 缓存失效（保留兼容性） ==========

  public void invalidateUserMenus(Long userId, Long tenantId) {
    LOG.debug("失效用户菜单缓存: userId={}, tenantId={}", userId, tenantId);
  }

  public void invalidateAllMenuCaches() {
    LOG.debug("失效所有菜单缓存");
  }

  private void invalidateMenuCaches(Long tenantId) {
    // 缓存已移除，此方法保留用于兼容性
    LOG.debug("菜单缓存已移除，无需失效（租户 {}）", tenantId);
  }
}
