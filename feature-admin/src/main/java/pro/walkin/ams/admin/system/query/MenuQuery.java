package pro.walkin.ams.admin.system.query;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.admin.system.service.MenuMapper;
import pro.walkin.ams.common.dto.MenuResponseDto;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.persistence.entity.system.Menu;
import pro.walkin.ams.persistence.entity.system.Menu_;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/** 菜单查询类 - 所有菜单相关的查询方法都放在这里 */
@ApplicationScoped
public class MenuQuery {
  private static final Logger LOG = LoggerFactory.getLogger(MenuQuery.class);
  private static final String ROOT_MENU_KEY = "root";

  @Inject MenuMapper menuMapper;

  @Inject RbacQuery rbacQuery;

  public Menu findById(Long id) {
    return Menu_.managedBlocking().findById(id);
  }

  public Optional<Menu> findByIdOptional(Long id) {
    return Menu_.managedBlocking().findByIdOptional(id);
  }

  public Menu findByKey(String key) {
    return Menu_.managedBlocking().findByKey(key);
  }

  public Optional<Menu> findByKeyAndTenant(String key, Long tenantId) {
    return Menu_.managedBlocking()
        .find("key = ?1 and tenant = ?2", key, tenantId)
        .firstResultOptional();
  }

  public List<Menu> listByTenant(Long tenantId) {
    return Menu_.managedBlocking().list("tenant", tenantId);
  }

  public List<Menu> listByMenuTypeAndTenant(Menu.MenuType menuType, Long tenantId) {
    return Menu_.managedBlocking().list("menuType = ?1 and tenant = ?2", menuType, tenantId);
  }

  public List<Menu> listByParentIdAndTenant(Long parentId, Long tenantId) {
    return Menu_.managedBlocking().list("parentId = ?1 and tenant = ?2", parentId, tenantId);
  }

  public List<Menu> listByParentIdNotNullAndTenant(Long tenantId) {
    return Menu_.managedBlocking().list("parentId is not null and tenant = ?1", tenantId);
  }

  public long countByKey(String key) {
    return Menu_.managedBlocking().countByKey(key);
  }

  public long countByKeyAndTenantAndIdNot(String key, Long tenantId, Long excludeId) {
    return Menu_.managedBlocking()
        .count("key = ?1 and tenant = ?2 and id != ?3", key, tenantId, excludeId);
  }

  public long countByParentIdAndTenant(Long parentId, Long tenantId) {
    return Menu_.managedBlocking().count("parentId = ?1 and tenant = ?2", parentId, tenantId);
  }

  // ========== DTO 查询方法 ==========

  public List<MenuResponseDto> findAllAsDto(Long tenantId, int page, int size) {
    if (tenantId == null) {
      return List.of();
    }
    return listByTenant(tenantId).stream()
        .map(menuMapper::mapEntityToResponseDto)
        .collect(Collectors.toList());
  }

  public long countByTenant(Long tenantId) {
    return tenantId == null ? 0 : Menu_.managedBlocking().count("tenant", tenantId);
  }

  public MenuResponseDto findByIdAsDto(Long id) {
    Menu menu = findById(id);
    if (menu == null) {
      throw new NotFoundException("Menu", id.toString());
    }
    return menuMapper.mapEntityToResponseDto(menu);
  }

  // ========== 权限检查方法 ==========

  /** 检查用户是否有权限访问指定菜单 */
  public boolean hasRoleForMenu(Menu menu, Set<String> userRoles) {
    // 如果菜单不可见，直接返回 false
    if (Boolean.FALSE.equals(menu.isVisible)) {
      return false;
    }

    // 如果菜单不需要角色限制，返回 true
    if (menu.rolesAllowed == null || menu.rolesAllowed.isEmpty()) {
      return true;
    }

    // 检查用户是否拥有任一允许的角色
    return menu.rolesAllowed.stream().anyMatch(userRoles::contains);
  }

  /** 获取用户有权限访问的菜单树 */
  public List<MenuResponseDto> getUserMenus(Long userId, Long tenantId) {
    Objects.requireNonNull(userId, "用户ID不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");

    LOG.debug("getUserMenus called with userId={}, tenantId={}", userId, tenantId);

    // 获取用户角色
    Set<String> userRoles = rbacQuery.getUserRoles(userId, tenantId);
    LOG.debug("User roles: {}", userRoles);

    // 获取所有菜单（按租户过滤）
    List<Menu> allMenus = listByTenant(tenantId);
    LOG.debug("Found {} menus for tenant {}", allMenus.size(), tenantId);

    // 过滤有权限的菜单并构建树形结构
    List<MenuResponseDto> menuTree = buildMenuTree(allMenus, userRoles);

    LOG.debug("为用户 {} 生成菜单树，共 {} 个菜单项", userId, menuTree.size());
    return menuTree;
  }

  // ========== 树形构建方法 ==========

  /** 为用户构建菜单树（带权限过滤） */
  public List<MenuResponseDto> buildMenuTree(List<Menu> menus, Set<String> userRoles) {
    // 找到根目录菜单
    Menu rootMenu =
        menus.stream().filter(menu -> ROOT_MENU_KEY.equals(menu.key)).findFirst().orElse(null);

    Long rootId = rootMenu != null ? rootMenu.id : null;

    // 按父菜单ID分组
    Map<Long, List<Menu>> childrenByParentId =
        menus.stream()
            .filter(menu -> menu.parentId != null)
            .collect(Collectors.groupingBy(menu -> menu.parentId));

    // 过滤有权限的菜单，并排除根目录本身
    List<Menu> accessibleMenus =
        menus.stream()
            .filter(menu -> hasRoleForMenu(menu, userRoles))
            .filter(menu -> !ROOT_MENU_KEY.equals(menu.key))
            .collect(Collectors.toList());

    // 构建树形结构：如果有根目录，则返回根目录的子菜单作为顶级菜单
    List<MenuResponseDto> rootMenus;
    if (rootId != null) {
      rootMenus =
          accessibleMenus.stream()
              .filter(menu -> rootId.equals(menu.parentId))
              .sorted(Comparator.comparingInt(menu -> menu.sortOrder != null ? menu.sortOrder : 0))
              .map(menu -> buildMenuItemTree(menu, childrenByParentId, userRoles))
              .collect(Collectors.toList());
    } else {
      // 兼容旧数据：如果没有根目录，则返回 parentId 为 null 的菜单
      rootMenus =
          accessibleMenus.stream()
              .filter(menu -> menu.parentId == null)
              .sorted(Comparator.comparingInt(menu -> menu.sortOrder != null ? menu.sortOrder : 0))
              .map(menu -> buildMenuItemTree(menu, childrenByParentId, userRoles))
              .collect(Collectors.toList());
    }

    return rootMenus;
  }

  /** 为管理端构建完整菜单树（不带权限过滤） */
  public List<MenuResponseDto> buildMenuTreeForAdmin(List<Menu> menus) {
    // 找到根目录菜单
    Menu rootMenu =
        menus.stream().filter(menu -> ROOT_MENU_KEY.equals(menu.key)).findFirst().orElse(null);

    Long rootId = rootMenu != null ? rootMenu.id : null;

    Map<Long, List<Menu>> childrenByParentId =
        menus.stream()
            .filter(menu -> menu.parentId != null)
            .collect(Collectors.groupingBy(menu -> menu.parentId));

    // 如果有根目录，则返回根目录的子菜单作为顶级菜单，并排除根目录本身
    if (rootId != null) {
      return menus.stream()
          .filter(menu -> rootId.equals(menu.parentId))
          .sorted(Comparator.comparingInt(menu -> menu.sortOrder != null ? menu.sortOrder : 0))
          .map(menu -> buildMenuItemTreeForAdmin(menu, childrenByParentId))
          .collect(Collectors.toList());
    } else {
      // 兼容旧数据：如果没有根目录，则返回 parentId 为 null 的菜单
      return menus.stream()
          .filter(menu -> menu.parentId == null)
          .sorted(Comparator.comparingInt(menu -> menu.sortOrder != null ? menu.sortOrder : 0))
          .map(menu -> buildMenuItemTreeForAdmin(menu, childrenByParentId))
          .collect(Collectors.toList());
    }
  }

  /** 递归构建菜单项树（带权限过滤） */
  private MenuResponseDto buildMenuItemTree(
      Menu menu, Map<Long, List<Menu>> childrenByParentId, Set<String> userRoles) {
    MenuResponseDto dto = menuMapper.mapEntityToResponseDto(menu);

    // 递归构建子菜单
    List<Menu> children = childrenByParentId.getOrDefault(menu.id, new ArrayList<>());
    List<MenuResponseDto> childDtos =
        children.stream()
            .filter(child -> hasRoleForMenu(child, userRoles))
            .sorted(Comparator.comparingInt(child -> child.sortOrder != null ? child.sortOrder : 0))
            .map(child -> buildMenuItemTree(child, childrenByParentId, userRoles))
            .collect(Collectors.toList());

    // 设置子菜单列表
    // 注意：MenuResponseDto 是不可变的 record，需要重新创建
    dto =
        new MenuResponseDto(
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
            dto.metadata(),
            dto.tenant(),
            dto.createdAt(),
            dto.updatedAt(),
            childDtos);

    return dto;
  }

  /** 递归构建菜单项树（不带权限过滤） */
  private MenuResponseDto buildMenuItemTreeForAdmin(
      Menu menu, Map<Long, List<Menu>> childrenByParentId) {
    MenuResponseDto dto = menuMapper.mapEntityToResponseDto(menu);

    List<Menu> children = childrenByParentId.getOrDefault(menu.id, new ArrayList<>());
    List<MenuResponseDto> childDtos =
        children.stream()
            .sorted(Comparator.comparingInt(child -> child.sortOrder != null ? child.sortOrder : 0))
            .map(child -> buildMenuItemTreeForAdmin(child, childrenByParentId))
            .collect(Collectors.toList());

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
        dto.metadata(),
        dto.tenant(),
        dto.createdAt(),
        dto.updatedAt(),
        childDtos);
  }
}
