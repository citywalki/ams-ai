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
import org.hibernate.Session;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.graphql.connection.PermissionConnection;
import pro.walkin.ams.persistence.entity.system.Permission;

import java.util.List;

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
}
