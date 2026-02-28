package pro.walkin.ams.graphql.entity.user;

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
import pro.walkin.ams.graphql.connection.UserConnection;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@GraphQLApi
public class UserGraphQLApi {

  @Inject Session session;

  @Query("users")
  @Description("查询用户列表，支持动态过滤")
  @Transactional
  public UserConnection users(
      @Name("where") UserFilterInput where,
      @Name("orderBy") List<OrderByInput> orderBy,
      @DefaultValue("0") @Name("page") int page,
      @DefaultValue("20") @Name("size") int size) {

    CriteriaBuilder builder = session.getCriteriaBuilder();

    CriteriaQuery<User> query = UserCriteriaTranslator.translate(builder, where, orderBy);
    List<User> users =
        session.createQuery(query).setFirstResult(page * size).setMaxResults(size).getResultList();

    CriteriaQuery<Long> countQuery = UserCriteriaTranslator.translateCount(builder, where);
    long total = session.createQuery(countQuery).getSingleResult();

    return new UserConnection(users, total, page, size);
  }

  @Transactional
  public List<Set<Role>> roles(@Source List<User> users) {
    if (users.isEmpty()) {
      return List.of();
    }

    List<Long> userIds = users.stream().map(u -> u.id).toList();
    Map<Long, Set<Role>> rolesByUser = loadRolesByUserIds(userIds);

    return users.stream().map(u -> rolesByUser.getOrDefault(u.id, Set.of())).toList();
  }

  private Map<Long, Set<Role>> loadRolesByUserIds(List<Long> userIds) {
    String jpql = "SELECT u.id, r FROM User u JOIN u.roles r WHERE u.id IN :userIds";

    List<Object[]> results =
        session.createQuery(jpql, Object[].class).setParameter("userIds", userIds).getResultList();

    Map<Long, Set<Role>> map = new HashMap<>();
    for (Object[] row : results) {
      Long userId = (Long) row[0];
      Role role = (Role) row[1];
      map.computeIfAbsent(userId, k -> new HashSet<>()).add(role);
    }

    for (Long userId : userIds) {
      map.putIfAbsent(userId, Set.of());
    }

    return map;
  }
}
