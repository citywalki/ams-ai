package pro.walkin.ams.admin.system.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.admin.system.query.MenuQuery;
import pro.walkin.ams.common.dto.MenuResponseDto;
import pro.walkin.ams.persistence.entity.system.Menu;

import java.util.List;
import java.util.Objects;
import java.util.Set;

/** 菜单权限检查器 - 负责检查用户对菜单的访问权限 */
@ApplicationScoped
public class MenuPermissionChecker {
  private static final Logger LOG = LoggerFactory.getLogger(MenuPermissionChecker.class);

  @Inject MenuQuery menuQuery;

  @Inject MenuTreeBuilder treeBuilder;

  @Inject RbacService rbacService;

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
    Set<String> userRoles = rbacService.getUserRoles(userId, tenantId);
    LOG.debug("User roles: {}", userRoles);

    // 获取所有菜单（按租户过滤）
    List<Menu> allMenus = menuQuery.listByTenant(tenantId);
    LOG.debug("Found {} menus for tenant {}", allMenus.size(), tenantId);

    // 过滤有权限的菜单并构建树形结构
    List<MenuResponseDto> menuTree = treeBuilder.buildMenuTree(allMenus, userRoles);

    LOG.debug("为用户 {} 生成菜单树，共 {} 个菜单项", userId, menuTree.size());
    return menuTree;
  }
}
