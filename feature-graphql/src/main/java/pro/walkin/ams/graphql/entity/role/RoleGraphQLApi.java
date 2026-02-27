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
import org.hibernate.Session;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.graphql.connection.RoleConnection;
import pro.walkin.ams.persistence.entity.system.Role;

import java.util.List;

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
}
