package pro.walkin.ams.graphql.entity.role;

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
import pro.walkin.ams.graphql.connection.RoleConnection;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Role;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@GraphQLApi
public class RoleGraphQLApi {

  @Inject Session session;

  @Query("roles")
  @Description("查询角色列表，支持动态过滤")
  @Transactional
  public RoleConnection roles(
      @Name("where") RoleFilterInput where,
      @Name("orderBy") List<OrderByInput> orderBy,
      @DefaultValue("0") @Name("page") int page,
      @DefaultValue("20") @Name("size") int size) {

    CriteriaBuilder builder = session.getCriteriaBuilder();

    CriteriaQuery<Role> query = RoleCriteriaTranslator.translate(builder, where, orderBy);
    List<Role> roles =
        session.createQuery(query).setFirstResult(page * size).setMaxResults(size).getResultList();

    CriteriaQuery<Long> countQuery = RoleCriteriaTranslator.translateCount(builder, where);
    long total = session.createQuery(countQuery).getSingleResult();

    return new RoleConnection(roles, total, page, size);
  }

  @Transactional
  public List<Set<Permission>> permissions(@Source List<Role> roles) {
    if (roles.isEmpty()) {
      return List.of();
    }

    List<Long> roleIds = roles.stream().map(r -> r.id).toList();
    Map<Long, Set<Permission>> permsByRole = loadPermissionsByRoleIds(roleIds);

    return roles.stream().map(r -> permsByRole.getOrDefault(r.id, Set.of())).toList();
  }

  private Map<Long, Set<Permission>> loadPermissionsByRoleIds(List<Long> roleIds) {
    String jpql = "SELECT r.id, p FROM Role r JOIN r.permissions p WHERE r.id IN :roleIds";

    List<Object[]> results =
        session.createQuery(jpql, Object[].class).setParameter("roleIds", roleIds).getResultList();

    Map<Long, Set<Permission>> map = new HashMap<>();
    for (Object[] row : results) {
      Long roleId = (Long) row[0];
      Permission perm = (Permission) row[1];
      map.computeIfAbsent(roleId, k -> new HashSet<>()).add(perm);
    }

    for (Long roleId : roleIds) {
      map.putIfAbsent(roleId, Set.of());
    }

    return map;
  }
}
