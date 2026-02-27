package pro.walkin.ams.graphql.entity.permission;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.graphql.filter.CriteriaFilterHelper;
import pro.walkin.ams.graphql.filter.CriteriaQueryContext;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Permission_;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public final class PermissionCriteriaTranslator {

  private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "code", "name", "createdAt");

  private PermissionCriteriaTranslator() {}

  public static CriteriaQuery<Permission> translate(
      CriteriaBuilder builder, PermissionFilterInput filter, List<OrderByInput> orderBy) {

    CriteriaQuery<Permission> query = builder.createQuery(Permission.class);
    Root<Permission> root = query.from(Permission.class);

    CriteriaQueryContext<Permission> ctx = new CriteriaQueryContext<>(builder, query, root);

    if (filter != null) {
      translateFilter(ctx, filter);
    }

    if (orderBy != null && !orderBy.isEmpty()) {
      for (OrderByInput ob : orderBy) {
        if (ob.field != null && ALLOWED_SORT_FIELDS.contains(ob.field)) {
          Order order =
              "DESC".equalsIgnoreCase(ob.direction)
                  ? builder.desc(root.get(ob.field))
                  : builder.asc(root.get(ob.field));
          ctx.addOrder(order);
        }
      }
    }

    if (orderBy == null || orderBy.isEmpty()) {
      ctx.addOrder(builder.desc(root.get(Permission_.id)));
    }

    return ctx.build();
  }

  public static CriteriaQuery<Long> translateCount(
      CriteriaBuilder builder, PermissionFilterInput filter) {

    CriteriaQuery<Long> query = builder.createQuery(Long.class);
    Root<Permission> root = query.from(Permission.class);

    query.select(builder.count(root));

    if (filter != null) {
      List<Predicate> predicates = new ArrayList<>();
      translateFilterToPredicates(builder, root, predicates, filter);
      if (!predicates.isEmpty()) {
        query.where(builder.and(predicates.toArray(new Predicate[0])));
      }
    }

    return query;
  }

  private static void translateFilter(
      CriteriaQueryContext<Permission> ctx, PermissionFilterInput filter) {
    if (filter == null) {
      return;
    }

    CriteriaBuilder builder = ctx.getBuilder();
    Root<Permission> root = ctx.getRoot();

    ctx.addPredicate(
        CriteriaFilterHelper.translateLongFilter(builder, root.get(Permission_.id), filter.id));

    ctx.addPredicate(
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Permission_.code), filter.code));

    ctx.addPredicate(
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Permission_.name), filter.name));

    ctx.addPredicate(
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Permission_.description), filter.description));

    translateLogicalOperators(ctx, filter);
  }

  private static void translateFilterToPredicates(
      CriteriaBuilder builder,
      Root<Permission> root,
      List<Predicate> predicates,
      PermissionFilterInput filter) {

    if (filter == null) {
      return;
    }

    Predicate idPredicate =
        CriteriaFilterHelper.translateLongFilter(builder, root.get(Permission_.id), filter.id);
    if (idPredicate != null) {
      predicates.add(idPredicate);
    }

    Predicate codePredicate =
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Permission_.code), filter.code);
    if (codePredicate != null) {
      predicates.add(codePredicate);
    }

    Predicate namePredicate =
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Permission_.name), filter.name);
    if (namePredicate != null) {
      predicates.add(namePredicate);
    }

    Predicate descPredicate =
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Permission_.description), filter.description);
    if (descPredicate != null) {
      predicates.add(descPredicate);
    }

    translateLogicalOperatorsToPredicates(builder, root, predicates, filter);
  }

  private static void translateLogicalOperators(
      CriteriaQueryContext<Permission> ctx, PermissionFilterInput filter) {
    if (filter == null) {
      return;
    }

    CriteriaBuilder builder = ctx.getBuilder();
    Root<Permission> root = ctx.getRoot();

    if (filter._and != null && !filter._and.isEmpty()) {
      List<Predicate> andPredicates = new ArrayList<>();
      for (PermissionFilterInput f : filter._and) {
        List<Predicate> subPredicates = new ArrayList<>();
        translateFilterToPredicates(builder, root, subPredicates, f);
        if (!subPredicates.isEmpty()) {
          andPredicates.add(builder.and(subPredicates.toArray(new Predicate[0])));
        }
      }
      if (!andPredicates.isEmpty()) {
        ctx.addPredicate(builder.and(andPredicates.toArray(new Predicate[0])));
      }
    }

    if (filter._or != null && !filter._or.isEmpty()) {
      List<Predicate> orPredicates = new ArrayList<>();
      for (PermissionFilterInput f : filter._or) {
        List<Predicate> subPredicates = new ArrayList<>();
        translateFilterToPredicates(builder, root, subPredicates, f);
        if (!subPredicates.isEmpty()) {
          orPredicates.add(builder.and(subPredicates.toArray(new Predicate[0])));
        }
      }
      if (!orPredicates.isEmpty()) {
        ctx.addPredicate(builder.or(orPredicates.toArray(new Predicate[0])));
      }
    }
  }

  private static void translateLogicalOperatorsToPredicates(
      CriteriaBuilder builder,
      Root<Permission> root,
      List<Predicate> predicates,
      PermissionFilterInput filter) {

    if (filter == null) {
      return;
    }

    if (filter._and != null && !filter._and.isEmpty()) {
      List<Predicate> andPredicates = new ArrayList<>();
      for (PermissionFilterInput f : filter._and) {
        List<Predicate> subPredicates = new ArrayList<>();
        translateFilterToPredicates(builder, root, subPredicates, f);
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
      for (PermissionFilterInput f : filter._or) {
        List<Predicate> subPredicates = new ArrayList<>();
        translateFilterToPredicates(builder, root, subPredicates, f);
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
