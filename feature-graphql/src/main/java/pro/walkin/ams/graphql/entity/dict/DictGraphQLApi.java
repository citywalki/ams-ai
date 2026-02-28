package pro.walkin.ams.graphql.entity.dict;

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
import pro.walkin.ams.graphql.connection.DictCategoryConnection;
import pro.walkin.ams.graphql.connection.DictItemConnection;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.persistence.entity.system.DictCategory;
import pro.walkin.ams.persistence.entity.system.DictItem;

import java.util.List;

@GraphQLApi
public class DictGraphQLApi {

  @Inject Session session;

  @Query("dictCategories")
  @Description("查询字典分类列表，支持动态过滤")
  @Transactional
  public DictCategoryConnection dictCategories(
      @Name("where") DictCategoryFilterInput where,
      @Name("orderBy") List<OrderByInput> orderBy,
      @DefaultValue("0") @Name("page") int page,
      @DefaultValue("20") @Name("size") int size) {

    CriteriaBuilder builder = session.getCriteriaBuilder();

    CriteriaQuery<DictCategory> query =
        DictCategoryCriteriaTranslator.translate(builder, where, orderBy);
    List<DictCategory> categories =
        session.createQuery(query).setFirstResult(page * size).setMaxResults(size).getResultList();

    CriteriaQuery<Long> countQuery = DictCategoryCriteriaTranslator.translateCount(builder, where);
    long total = session.createQuery(countQuery).getSingleResult();

    return new DictCategoryConnection(categories, total, page, size);
  }

  @Query("dictItems")
  @Description("查询字典项列表，支持动态过滤")
  @Transactional
  public DictItemConnection dictItems(
      @Name("where") DictItemFilterInput where,
      @Name("orderBy") List<OrderByInput> orderBy,
      @DefaultValue("0") @Name("page") int page,
      @DefaultValue("20") @Name("size") int size) {

    CriteriaBuilder builder = session.getCriteriaBuilder();

    CriteriaQuery<DictItem> query = DictItemCriteriaTranslator.translate(builder, where, orderBy);
    List<DictItem> items =
        session.createQuery(query).setFirstResult(page * size).setMaxResults(size).getResultList();

    CriteriaQuery<Long> countQuery = DictItemCriteriaTranslator.translateCount(builder, where);
    long total = session.createQuery(countQuery).getSingleResult();

    return new DictItemConnection(items, total, page, size);
  }
}
