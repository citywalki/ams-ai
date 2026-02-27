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
import org.hibernate.Session;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.graphql.connection.UserConnection;
import pro.walkin.ams.persistence.entity.system.User;

import java.util.List;

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
}
