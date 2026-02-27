package pro.walkin.ams.graphql.entity.dict;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.graphql.filter.CriteriaFilterHelper;
import pro.walkin.ams.persistence.entity.system.DictCategory;

import java.util.ArrayList;
import java.util.List;

public class DictCategoryCriteriaTranslator {

  public static CriteriaQuery<DictCategory> translate(
      CriteriaBuilder builder, DictCategoryFilterInput where, List<OrderByInput> orderBy) {
    CriteriaQuery<DictCategory> query = builder.createQuery(DictCategory.class);
    Root<DictCategory> root = query.from(DictCategory.class);

    List<Predicate> predicates = new ArrayList<>();
    if (where != null) {
      addPredicates(builder, root, where, predicates);
    }

    if (!predicates.isEmpty()) {
      query.where(predicates.toArray(new Predicate[0]));
    }

    if (orderBy != null && !orderBy.isEmpty()) {
      CriteriaFilterHelper.applyOrderBy(builder, query, root, orderBy);
    }

    return query;
  }

  public static CriteriaQuery<Long> translateCount(CriteriaBuilder builder, DictCategoryFilterInput where) {
    CriteriaQuery<Long> query = builder.createQuery(Long.class);
    Root<DictCategory> root = query.from(DictCategory.class);

    query.select(builder.count(root));

    List<Predicate> predicates = new ArrayList<>();
    if (where != null) {
      addPredicates(builder, root, where, predicates);
    }

    if (!predicates.isEmpty()) {
      query.where(predicates.toArray(new Predicate[0]));
    }

    return query;
  }

  private static void addPredicates(
      CriteriaBuilder builder, Root<DictCategory> root, DictCategoryFilterInput filter, List<Predicate> predicates) {
    CriteriaFilterHelper.addLongPredicate(builder, root, "id", filter.id, predicates);
    CriteriaFilterHelper.addStringPredicate(builder, root, "code", filter.code, predicates);
    CriteriaFilterHelper.addStringPredicate(builder, root, "name", filter.name, predicates);
    CriteriaFilterHelper.addStringPredicate(builder, root, "description", filter.description, predicates);
    CriteriaFilterHelper.addIntPredicate(builder, root, "sort", filter.sort, predicates);
    CriteriaFilterHelper.addIntPredicate(builder, root, "status", filter.status, predicates);

    if (filter._and != null && !filter._and.isEmpty()) {
      List<Predicate> andPredicates = new ArrayList<>();
      for (DictCategoryFilterInput andFilter : filter._and) {
        List<Predicate> subPredicates = new ArrayList<>();
        addPredicates(builder, root, andFilter, subPredicates);
        if (!subPredicates.isEmpty()) {
          andPredicates.add(builder.and(subPredicates.toArray(new Predicate[0])));
        }
      }
      if (!andPredicates.isEmpty()) {
        predicates.add(builder.and(andPredicates.toArray(new Predicate[0])));
      }
    }

    if (filter._or != null && !filter._or.isEmpty()) {
      List<Predicate> orPredicates = new ArrayList<>();
      for (DictCategoryFilterInput orFilter : filter._or) {
        List<Predicate> subPredicates = new ArrayList<>();
        addPredicates(builder, root, orFilter, subPredicates);
        if (!subPredicates.isEmpty()) {
          orPredicates.add(builder.and(subPredicates.toArray(new Predicate[0])));
        }
      }
      if (!orPredicates.isEmpty()) {
        predicates.add(builder.or(orPredicates.toArray(new Predicate[0])));
      }
    }
  }
}
