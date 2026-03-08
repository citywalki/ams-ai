package pro.walkin.ams.admin.system.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pro.walkin.ams.common.dto.MenuResponseDto;
import pro.walkin.ams.persistence.entity.system.Menu;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/** 菜单树构建器 - 负责构建菜单的树形结构 */
@ApplicationScoped
public class MenuTreeBuilder {

  private static final String ROOT_MENU_KEY = "root";

  @Inject MenuMapper menuMapper;

  @Inject MenuPermissionChecker permissionChecker;

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
            .filter(menu -> permissionChecker.hasRoleForMenu(menu, userRoles))
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
            .filter(child -> permissionChecker.hasRoleForMenu(child, userRoles))
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
