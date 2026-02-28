package pro.walkin.ams.graphql.entity.menu;

import jakarta.inject.Inject;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.graphql.DefaultValue;
import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Name;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.graphql.Source;
import org.hibernate.Session;
import pro.walkin.ams.graphql.connection.MenuConnection;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.persistence.entity.system.Menu;
import pro.walkin.ams.persistence.entity.system.Permission;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@GraphQLApi
public class MenuGraphQLApi {

  @Inject Session session;

  @Query("menus")
  @Description("查询菜单列表，支持动态过滤")
  @Transactional
  public MenuConnection menus(
      @Name("where") MenuFilterInput where,
      @Name("orderBy") List<OrderByInput> orderBy,
      @DefaultValue("0") @Name("page") int page,
      @DefaultValue("20") @Name("size") int size) {

    CriteriaBuilder builder = session.getCriteriaBuilder();

    CriteriaQuery<Menu> query = MenuCriteriaTranslator.translate(builder, where, orderBy);
    List<Menu> menus =
        session.createQuery(query).setFirstResult(page * size).setMaxResults(size).getResultList();

    CriteriaQuery<Long> countQuery = MenuCriteriaTranslator.translateCount(builder, where);
    long total = session.createQuery(countQuery).getSingleResult();

    return new MenuConnection(menus, total, page, size);
  }

  @Transactional
  public List<List<Menu>> children(@Source List<Menu> menus) {
    if (menus.isEmpty()) {
      return List.of();
    }

    List<Long> menuIds = menus.stream().map(m -> m.id).toList();
    Map<Long, List<Menu>> childrenByMenu = loadChildrenByParentIds(menuIds);

    return menus.stream().map(m -> childrenByMenu.getOrDefault(m.id, List.of())).toList();
  }

  @Transactional
  public List<Menu> parent(@Source List<Menu> menus) {
    if (menus.isEmpty()) {
      return List.of();
    }

    List<Long> parentIds =
        menus.stream().map(m -> m.parentId).filter(id -> id != null).distinct().toList();

    if (parentIds.isEmpty()) {
      return menus.stream().map(m -> (Menu) null).toList();
    }

    Map<Long, Menu> parentMap = loadMenusByIds(parentIds);

    return menus.stream().map(m -> m.parentId != null ? parentMap.get(m.parentId) : null).toList();
  }

  @Transactional
  public List<List<Permission>> buttonPermissions(@Source List<Menu> menus) {
    if (menus.isEmpty()) {
      return List.of();
    }

    List<Long> menuIds = menus.stream().map(m -> m.id).toList();
    Map<Long, List<Permission>> permsByMenu = loadButtonPermissionsByMenuIds(menuIds);

    return menus.stream().map(m -> permsByMenu.getOrDefault(m.id, List.of())).toList();
  }

  private Map<Long, List<Menu>> loadChildrenByParentIds(List<Long> parentIds) {
    String jpql = "SELECT m.parent.id, m FROM Menu m WHERE m.parent.id IN :parentIds";

    List<Object[]> results =
        session
            .createQuery(jpql, Object[].class)
            .setParameter("parentIds", parentIds)
            .getResultList();

    Map<Long, List<Menu>> map = new HashMap<>();
    for (Object[] row : results) {
      Long parentId = (Long) row[0];
      Menu child = (Menu) row[1];
      map.computeIfAbsent(parentId, k -> new ArrayList<>()).add(child);
    }

    for (Long parentId : parentIds) {
      map.putIfAbsent(parentId, List.of());
    }

    return map;
  }

  private Map<Long, Menu> loadMenusByIds(List<Long> menuIds) {
    if (menuIds.isEmpty()) {
      return Map.of();
    }

    String jpql = "SELECT m FROM Menu m WHERE m.id IN :menuIds";
    List<Menu> menus =
        session.createQuery(jpql, Menu.class).setParameter("menuIds", menuIds).getResultList();

    Map<Long, Menu> map = new HashMap<>();
    for (Menu menu : menus) {
      map.put(menu.id, menu);
    }
    return map;
  }

  private Map<Long, List<Permission>> loadButtonPermissionsByMenuIds(List<Long> menuIds) {
    String jpql = "SELECT p.menu.id, p FROM Permission p WHERE p.menu.id IN :menuIds";

    List<Object[]> results =
        session.createQuery(jpql, Object[].class).setParameter("menuIds", menuIds).getResultList();

    Map<Long, List<Permission>> map = new HashMap<>();
    for (Object[] row : results) {
      Long menuId = (Long) row[0];
      Permission perm = (Permission) row[1];
      map.computeIfAbsent(menuId, k -> new ArrayList<>()).add(perm);
    }

    for (Long menuId : menuIds) {
      map.putIfAbsent(menuId, List.of());
    }

    return map;
  }
}
