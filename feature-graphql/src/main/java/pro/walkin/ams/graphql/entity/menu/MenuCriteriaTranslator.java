package pro.walkin.ams.graphql.entity.menu;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.graphql.filter.CriteriaFilterHelper;
import pro.walkin.ams.persistence.entity.system.Menu;

import java.util.ArrayList;
import java.util.List;

public class MenuCriteriaTranslator {

  public static CriteriaQuery<Menu> translate(
      CriteriaBuilder builder, MenuFilterInput where, List<OrderByInput> orderBy) {
    CriteriaQuery<Menu> query = builder.createQuery(Menu.class);
    Root<Menu> root = query.from(Menu.class);

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

  public static CriteriaQuery<Long> translateCount(CriteriaBuilder builder, MenuFilterInput where) {
    CriteriaQuery<Long> query = builder.createQuery(Long.class);
    Root<Menu> root = query.from(Menu.class);

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
      CriteriaBuilder builder, Root<Menu> root, MenuFilterInput filter, List<Predicate> predicates) {
    CriteriaFilterHelper.addLongPredicate(builder, root, "id", filter.id, predicates);
    CriteriaFilterHelper.addStringPredicate(builder, root, "key", filter.key, predicates);
    CriteriaFilterHelper.addStringPredicate(builder, root, "label", filter.label, predicates);
    CriteriaFilterHelper.addStringPredicate(builder, root, "route", filter.route, predicates);
    CriteriaFilterHelper.addLongPredicate(builder, root, "parentId", filter.parentId, predicates);
    CriteriaFilterHelper.addEnumPredicate(builder, root, "menuType", filter.menuType, predicates);
    CriteriaFilterHelper.addBooleanPredicate(builder, root, "isVisible", filter.isVisible, predicates);

    if (filter._and != null && !filter._and.isEmpty()) {
      List<Predicate> andPredicates = new ArrayList<>();
      for (MenuFilterInput andFilter : filter._and) {
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
      for (MenuFilterInput orFilter : filter._or) {
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
