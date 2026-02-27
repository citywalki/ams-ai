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
import org.hibernate.Session;
import pro.walkin.ams.graphql.connection.MenuConnection;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.persistence.entity.system.Menu;

import java.util.List;

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
}
