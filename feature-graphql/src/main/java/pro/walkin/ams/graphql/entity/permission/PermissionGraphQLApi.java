package pro.walkin.ams.graphql.entity.permission;

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
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.graphql.connection.PermissionConnection;
import pro.walkin.ams.persistence.entity.system.Menu;
import pro.walkin.ams.persistence.entity.system.Permission;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@GraphQLApi
public class PermissionGraphQLApi {

  @Inject Session session;

  @Query("permissions")
  @Description("查询权限列表，支持动态过滤")
  @Transactional
  public PermissionConnection permissions(
      @Name("where") PermissionFilterInput where,
      @Name("orderBy") List<OrderByInput> orderBy,
      @DefaultValue("0") @Name("page") int page,
      @DefaultValue("20") @Name("size") int size) {

    CriteriaBuilder builder = session.getCriteriaBuilder();

    CriteriaQuery<Permission> query =
        PermissionCriteriaTranslator.translate(builder, where, orderBy);
    List<Permission> permissions =
        session.createQuery(query).setFirstResult(page * size).setMaxResults(size).getResultList();

    CriteriaQuery<Long> countQuery = PermissionCriteriaTranslator.translateCount(builder, where);
    long total = session.createQuery(countQuery).getSingleResult();

    return new PermissionConnection(permissions, total, page, size);
  }

  @Transactional
  public List<Menu> menu(@Source List<Permission> permissions) {
    if (permissions.isEmpty()) {
      return List.of();
    }

    List<Long> menuIds =
        permissions.stream()
            .map(p -> p.menu != null ? p.menu.id : null)
            .filter(id -> id != null)
            .distinct()
            .toList();

    if (menuIds.isEmpty()) {
      return permissions.stream().map(p -> (Menu) null).toList();
    }

    Map<Long, Menu> menuMap = loadMenusByIds(menuIds);

    return permissions.stream().map(p -> p.menu != null ? menuMap.get(p.menu.id) : null).toList();
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
}
