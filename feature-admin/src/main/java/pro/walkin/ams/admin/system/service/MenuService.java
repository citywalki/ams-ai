package pro.walkin.ams.admin.system.service;

import io.quarkus.cache.Cache;
import io.quarkus.cache.CacheInvalidate;
import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheName;
import io.quarkus.cache.CacheResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.dto.MenuDto;
import pro.walkin.ams.common.dto.MenuResponseDto;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.Menu;

@ApplicationScoped
@Transactional
public class MenuService {
  private static final Logger LOG = LoggerFactory.getLogger(MenuService.class);
  private static final String USER_MENUS_CACHE = "user-menus";
  private static final String ROOT_MENU_KEY = "root";

  @Inject
  @CacheName(USER_MENUS_CACHE)
  Cache cache;

  @Inject Menu.Repo menuRepo;

  @Inject RbacService rbacService;

  // ========== CRUD 操作 ==========

  public MenuResponseDto createMenu(MenuDto dto, Long tenantId) {
    Objects.requireNonNull(dto, "菜单数据不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");

    // 检查key是否已存在（同一租户内唯一）

    if (menuRepo.countByKey(dto.key()) > 0) {
      throw new ValidationException("菜单标识符已存在", "key", dto.key());
    }

    // 如果指定了parentId，检查父菜单是否存在且属于同一租户
    if (dto.parentId() != null) {
      Menu parent = menuRepo.findById(dto.parentId());
      if (parent == null) {
        throw new NotFoundException("Menu", dto.parentId().toString());
      }
      if (!tenantId.equals(parent.tenant)) {
        throw new ValidationException("父菜单不属于当前租户", "parentId", dto.parentId());
      }
    }

    Menu menu = new Menu();
    mapDtoToEntity(dto, menu);
    menu.tenant = tenantId;
    menu.persist();

    LOG.debug("创建菜单成功: id={}, key={}, tenant={}", menu.id, menu.key, tenantId);
    return mapEntityToResponseDto(menu);
  }

  public MenuResponseDto updateMenu(Long id, MenuDto dto, Long tenantId) {
    Objects.requireNonNull(id, "菜单ID不能为空");
    Objects.requireNonNull(dto, "菜单数据不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");

    Menu menu = menuRepo.findById(id);
    if (menu == null) {
      throw new NotFoundException("Menu", id.toString());
    }
    if (!tenantId.equals(menu.tenant)) {
      throw new ValidationException("菜单不属于当前租户", "id", id);
    }

    // 如果key被修改，检查新key是否已存在（同一租户内唯一）
    if (!dto.key().equals(menu.key)
        && menuRepo.count("key = ?1 and tenant = ?2 and id != ?3", dto.key(), tenantId, id) > 0) {
      throw new ValidationException("菜单标识符已存在", "key", dto.key());
    }

    // 如果指定了parentId，检查父菜单是否存在且属于同一租户（不能设置自己为父菜单）
    if (dto.parentId() != null) {
      if (dto.parentId().equals(id)) {
        throw new ValidationException("不能将菜单设置为自己的父菜单", "parentId", dto.parentId());
      }
      Menu parent = menuRepo.findById(dto.parentId());
      if (parent == null) {
        throw new NotFoundException("Menu", dto.parentId().toString());
      }
      if (!tenantId.equals(parent.tenant)) {
        throw new ValidationException("父菜单不属于当前租户", "parentId", dto.parentId());
      }
    }

    mapDtoToEntity(dto, menu);
    menuRepo.persist(menu); // 更新

    LOG.debug("更新菜单成功: id={}, key={}, tenant={}", menu.id, menu.key, tenantId);

    // 失效相关缓存
    invalidateMenuCaches(tenantId);

    return mapEntityToResponseDto(menu);
  }

  public void deleteMenu(Long id, Long tenantId) {
    Objects.requireNonNull(id, "菜单ID不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");

    Menu menu = menuRepo.findById(id);
    if (menu == null) {
      throw new NotFoundException("Menu", id.toString());
    }
    if (!tenantId.equals(menu.tenant)) {
      throw new ValidationException("菜单不属于当前租户", "id", id);
    }

    // 检查是否有子菜单
    if (menuRepo.count("parentId = ?1 and tenant = ?2", id, tenantId) > 0) {
      throw new ValidationException("请先删除子菜单", "id", id);
    }

    menuRepo.delete(menu);
    LOG.debug("删除菜单成功: id={}, key={}, tenant={}", id, menu.key, tenantId);

    // 失效相关缓存
    invalidateMenuCaches(tenantId);
  }

  public MenuResponseDto getMenuById(Long id, Long tenantId) {
    Objects.requireNonNull(id, "菜单ID不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");

    Menu menu = menuRepo.findById(id);
    if (menu == null) {
      throw new NotFoundException("Menu", id.toString());
    }
    if (!tenantId.equals(menu.tenant)) {
      throw new ValidationException("菜单不属于当前租户", "id", id);
    }

    return mapEntityToResponseDto(menu);
  }

  public Menu findByKey(String key) {
    return menuRepo.findByKey(key);
  }

  public Menu findById(Long id) {
    return menuRepo.findById(id);
  }

  public List<MenuResponseDto> getAllMenus(Long tenantId) {
    Objects.requireNonNull(tenantId, "租户ID不能为空");

    List<Menu> menus = menuRepo.list("tenant", tenantId);
    return menus.stream().map(this::mapEntityToResponseDto).collect(Collectors.toList());
  }

  public List<MenuResponseDto> getFolders(Long tenantId) {
    Objects.requireNonNull(tenantId, "租户ID不能为空");
    List<Menu> folders = menuRepo.list("menuType = ?1 and tenant = ?2", Menu.MenuType.FOLDER, tenantId);

    // 过滤掉根目录菜单
    folders = folders.stream()
        .filter(folder -> !ROOT_MENU_KEY.equals(folder.key))
        .collect(Collectors.toList());

    Map<Long, Long> childCountByParent =
        menuRepo.list("parentId is not null and tenant = ?1", tenantId).stream()
            .collect(Collectors.groupingBy(menu -> menu.parentId, Collectors.counting()));

    return folders.stream()
        .map(
            folder -> {
              MenuResponseDto dto = mapEntityToResponseDto(folder);
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
      Menu rootMenu = menuRepo.find("key = ?1 and tenant = ?2", ROOT_MENU_KEY, tenantId).firstResult();
      if (rootMenu != null) {
        menus = menuRepo.list("parentId = ?1 and tenant = ?2", rootMenu.id, tenantId);
      } else {
        // 如果根目录不存在，返回空列表
        menus = new ArrayList<>();
      }
    } else {
      menus = menuRepo.list("parentId = ?1 and tenant = ?2", parentId, tenantId);
    }
    return menus.stream().map(this::mapEntityToResponseDto).collect(Collectors.toList());
  }

  @CacheResult(cacheName = USER_MENUS_CACHE)
  public List<MenuResponseDto> getUserMenus(Long userId, Long tenantId) {
    Objects.requireNonNull(userId, "用户ID不能为空");
    Objects.requireNonNull(tenantId, "租户ID不能为空");

    LOG.debug("getUserMenus called with userId={}, tenantId={}", userId, tenantId);

    // 获取用户角色
    Set<String> userRoles = rbacService.getUserRoles(userId, tenantId);
    LOG.debug("User roles: {}", userRoles);

    // 获取所有菜单（按租户过滤）
    List<Menu> allMenus = menuRepo.list("tenant", tenantId);
    LOG.debug("Found {} menus for tenant {}", allMenus.size(), tenantId);

    // 过滤有权限的菜单并构建树形结构
    List<MenuResponseDto> menuTree = buildMenuTree(allMenus, userRoles);

    LOG.debug("为用户 {} 生成菜单树，共 {} 个菜单项", userId, menuTree.size());
    return menuTree;
  }

  @CacheInvalidate(cacheName = USER_MENUS_CACHE)
  public void invalidateUserMenus(Long userId, Long tenantId) {
    LOG.debug("失效用户菜单缓存: userId={}, tenantId={}", userId, tenantId);
  }

  @CacheInvalidateAll(cacheName = USER_MENUS_CACHE)
  public void invalidateAllMenuCaches() {
    LOG.debug("失效所有菜单缓存");
  }

  // ========== 私有辅助方法 ==========

  private void mapDtoToEntity(MenuDto dto, Menu entity) {
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

  private MenuResponseDto mapEntityToResponseDto(Menu entity) {
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
        new ArrayList<>()
        );
  }

  private List<MenuResponseDto> buildMenuTree(List<Menu> menus, Set<String> userRoles) {
    // 找到根目录菜单
    Menu rootMenu = menus.stream()
        .filter(menu -> ROOT_MENU_KEY.equals(menu.key))
        .findFirst()
        .orElse(null);

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
      rootMenus = accessibleMenus.stream()
          .filter(menu -> rootId.equals(menu.parentId))
          .sorted(Comparator.comparingInt(menu -> menu.sortOrder != null ? menu.sortOrder : 0))
          .map(menu -> buildMenuItemTree(menu, childrenByParentId, userRoles))
          .collect(Collectors.toList());
    } else {
      // 兼容旧数据：如果没有根目录，则返回 parentId 为 null 的菜单
      rootMenus = accessibleMenus.stream()
          .filter(menu -> menu.parentId == null)
          .sorted(Comparator.comparingInt(menu -> menu.sortOrder != null ? menu.sortOrder : 0))
          .map(menu -> buildMenuItemTree(menu, childrenByParentId, userRoles))
          .collect(Collectors.toList());
    }

    return rootMenus;
  }

  private MenuResponseDto buildMenuItemTree(
      Menu menu, Map<Long, List<Menu>> childrenByParentId, Set<String> userRoles) {
    MenuResponseDto dto = mapEntityToResponseDto(menu);

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

  private boolean hasRoleForMenu(Menu menu, Set<String> userRoles) {
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

  private void invalidateMenuCaches(Long tenantId) {
    // 失效所有用户菜单缓存（简化实现：失效所有缓存）
    // 在实际应用中，可以根据租户ID更精细地失效缓存
    cache.invalidateAll().await().indefinitely();
    LOG.debug("失效所有菜单缓存（租户 {}）", tenantId);
  }

  // ========== 管理端菜单树方法 ==========

  public List<MenuResponseDto> getMenuTree(Long tenantId) {
    Objects.requireNonNull(tenantId, "租户ID不能为空");

    List<Menu> allMenus = menuRepo.list("tenant", tenantId);
    return buildMenuTreeForAdmin(allMenus);
  }

  private List<MenuResponseDto> buildMenuTreeForAdmin(List<Menu> menus) {
    // 找到根目录菜单
    Menu rootMenu = menus.stream()
        .filter(menu -> ROOT_MENU_KEY.equals(menu.key))
        .findFirst()
        .orElse(null);

    Long rootId = rootMenu != null ? rootMenu.id : null;

    Map<Long, List<Menu>> childrenByParentId = menus.stream()
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

  private MenuResponseDto buildMenuItemTreeForAdmin(Menu menu, Map<Long, List<Menu>> childrenByParentId) {
    MenuResponseDto dto = mapEntityToResponseDto(menu);

    List<Menu> children = childrenByParentId.getOrDefault(menu.id, new ArrayList<>());
    List<MenuResponseDto> childDtos = children.stream()
        .sorted(Comparator.comparingInt(child -> child.sortOrder != null ? child.sortOrder : 0))
        .map(child -> buildMenuItemTreeForAdmin(child, childrenByParentId))
        .collect(Collectors.toList());

    return new MenuResponseDto(
        dto.id(), dto.key(), dto.label(), dto.route(), dto.parentId(),
        dto.icon(), dto.sortOrder(), dto.isVisible(), dto.menuType(),
        dto.rolesAllowed(), dto.metadata(), dto.tenant(),
        dto.createdAt(), dto.updatedAt(), childDtos);
  }
}
