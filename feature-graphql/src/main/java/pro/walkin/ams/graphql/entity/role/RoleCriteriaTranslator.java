package pro.walkin.ams.graphql.entity.role;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.graphql.entity.permission.PermissionFilterInput;
import pro.walkin.ams.graphql.filter.CriteriaFilterHelper;
import pro.walkin.ams.graphql.filter.CriteriaQueryContext;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Permission_;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.Role_;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public final class RoleCriteriaTranslator {

  private static final Set<String> ALLOWED_SORT_FIELDS =
      Set.of("id", "code", "name", "createdAt", "updatedAt");

  private RoleCriteriaTranslator() {}

  public static CriteriaQuery<Role> translate(
      CriteriaBuilder builder, RoleFilterInput filter, List<OrderByInput> orderBy) {

    CriteriaQuery<Role> query = builder.createQuery(Role.class);
    Root<Role> root = query.from(Role.class);

    CriteriaQueryContext<Role> ctx = new CriteriaQueryContext<>(builder, query, root);

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
      ctx.addOrder(builder.desc(root.get(Role_.createdAt)));
    }

    return ctx.build();
  }

  public static CriteriaQuery<Long> translateCount(
      CriteriaBuilder builder, RoleFilterInput filter) {

    CriteriaQuery<Long> query = builder.createQuery(Long.class);
    Root<Role> root = query.from(Role.class);

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

  private static void translateFilter(CriteriaQueryContext<Role> ctx, RoleFilterInput filter) {
    if (filter == null) {
      return;
    }

    CriteriaBuilder builder = ctx.getBuilder();
    Root<Role> root = ctx.getRoot();

    ctx.addPredicate(
        CriteriaFilterHelper.translateLongFilter(builder, root.get(Role_.id), filter.id));

    ctx.addPredicate(
        CriteriaFilterHelper.translateStringFilter(builder, root.get(Role_.code), filter.code));

    ctx.addPredicate(
        CriteriaFilterHelper.translateStringFilter(builder, root.get(Role_.name), filter.name));

    ctx.addPredicate(
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Role_.description), filter.description));

    ctx.addPredicate(
        CriteriaFilterHelper.translateDateTimeFilter(
            builder, root.get(Role_.createdAt), filter.createdAt));

    ctx.addPredicate(
        CriteriaFilterHelper.translateDateTimeFilter(
            builder, root.get(Role_.updatedAt), filter.updatedAt));

    translatePermissionsFilter(ctx, filter.permissions);

    translateLogicalOperators(ctx, filter);
  }

  private static void translateFilterToPredicates(
      CriteriaBuilder builder,
      Root<Role> root,
      List<Predicate> predicates,
      RoleFilterInput filter) {

    if (filter == null) {
      return;
    }

    Predicate idPredicate =
        CriteriaFilterHelper.translateLongFilter(builder, root.get(Role_.id), filter.id);
    if (idPredicate != null) {
      predicates.add(idPredicate);
    }

    Predicate codePredicate =
        CriteriaFilterHelper.translateStringFilter(builder, root.get(Role_.code), filter.code);
    if (codePredicate != null) {
      predicates.add(codePredicate);
    }

    Predicate namePredicate =
        CriteriaFilterHelper.translateStringFilter(builder, root.get(Role_.name), filter.name);
    if (namePredicate != null) {
      predicates.add(namePredicate);
    }

    Predicate descPredicate =
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Role_.description), filter.description);
    if (descPredicate != null) {
      predicates.add(descPredicate);
    }

    Predicate createdAtPredicate =
        CriteriaFilterHelper.translateDateTimeFilter(
            builder, root.get(Role_.createdAt), filter.createdAt);
    if (createdAtPredicate != null) {
      predicates.add(createdAtPredicate);
    }

    Predicate updatedAtPredicate =
        CriteriaFilterHelper.translateDateTimeFilter(
            builder, root.get(Role_.updatedAt), filter.updatedAt);
    if (updatedAtPredicate != null) {
      predicates.add(updatedAtPredicate);
    }

    translatePermissionsFilterToPredicates(builder, root, predicates, filter.permissions);

    translateLogicalOperatorsToPredicates(builder, root, predicates, filter);
  }

  private static void translatePermissionsFilter(
      CriteriaQueryContext<Role> ctx, PermissionFilterInput permFilter) {
    if (permFilter == null) {
      return;
    }

    CriteriaBuilder builder = ctx.getBuilder();
    Root<Role> root = ctx.getRoot();

    Join<Role, Permission> permJoin = root.join(Role_.permissions);

    List<Predicate> permPredicates = new ArrayList<>();

    if (permFilter.id != null) {
      permPredicates.add(
          CriteriaFilterHelper.translateLongFilter(
              builder, permJoin.get(Permission_.id), permFilter.id));
    }

    if (permFilter.code != null) {
      permPredicates.add(
          CriteriaFilterHelper.translateStringFilter(
              builder, permJoin.get(Permission_.code), permFilter.code));
    }

    if (permFilter.name != null) {
      permPredicates.add(
          CriteriaFilterHelper.translateStringFilter(
              builder, permJoin.get(Permission_.name), permFilter.name));
    }

    if (permFilter.description != null) {
      permPredicates.add(
          CriteriaFilterHelper.translateStringFilter(
              builder, permJoin.get(Permission_.description), permFilter.description));
    }

    if (!permPredicates.isEmpty()) {
      ctx.addPredicate(builder.and(permPredicates.toArray(new Predicate[0])));
      ctx.setDistinct(true);
    }
  }

  private static void translatePermissionsFilterToPredicates(
      CriteriaBuilder builder,
      Root<Role> root,
      List<Predicate> predicates,
      PermissionFilterInput permFilter) {

    if (permFilter == null) {
      return;
    }

    Join<Role, Permission> permJoin = root.join(Role_.permissions);

    List<Predicate> permPredicates = new ArrayList<>();

    if (permFilter.id != null) {
      Predicate p =
          CriteriaFilterHelper.translateLongFilter(
              builder, permJoin.get(Permission_.id), permFilter.id);
      if (p != null) {
        permPredicates.add(p);
      }
    }

    if (permFilter.code != null) {
      Predicate p =
          CriteriaFilterHelper.translateStringFilter(
              builder, permJoin.get(Permission_.code), permFilter.code);
      if (p != null) {
        permPredicates.add(p);
      }
    }

    if (permFilter.name != null) {
      Predicate p =
          CriteriaFilterHelper.translateStringFilter(
              builder, permJoin.get(Permission_.name), permFilter.name);
      if (p != null) {
        permPredicates.add(p);
      }
    }

    if (permFilter.description != null) {
      Predicate p =
          CriteriaFilterHelper.translateStringFilter(
              builder, permJoin.get(Permission_.description), permFilter.description);
      if (p != null) {
        permPredicates.add(p);
      }
    }

    if (!permPredicates.isEmpty()) {
      predicates.add(builder.and(permPredicates.toArray(new Predicate[0])));
    }
  }

  private static void translateLogicalOperators(
      CriteriaQueryContext<Role> ctx, RoleFilterInput filter) {
    if (filter == null) {
      return;
    }

    CriteriaBuilder builder = ctx.getBuilder();
    Root<Role> root = ctx.getRoot();

    if (filter._and != null && !filter._and.isEmpty()) {
      List<Predicate> andPredicates = new ArrayList<>();
      for (RoleFilterInput f : filter._and) {
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
      for (RoleFilterInput f : filter._or) {
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
      Root<Role> root,
      List<Predicate> predicates,
      RoleFilterInput filter) {

    if (filter == null) {
      return;
    }

    if (filter._and != null && !filter._and.isEmpty()) {
      List<Predicate> andPredicates = new ArrayList<>();
      for (RoleFilterInput f : filter._and) {
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
      for (RoleFilterInput f : filter._or) {
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
