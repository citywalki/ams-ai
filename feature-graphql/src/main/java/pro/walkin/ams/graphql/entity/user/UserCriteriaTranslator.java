package pro.walkin.ams.graphql.entity.user;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.graphql.entity.permission.PermissionFilterInput;
import pro.walkin.ams.graphql.entity.role.RoleFilterInput;
import pro.walkin.ams.graphql.filter.CriteriaFilterHelper;
import pro.walkin.ams.graphql.filter.CriteriaQueryContext;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Permission_;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.Role_;
import pro.walkin.ams.persistence.entity.system.User;
import pro.walkin.ams.persistence.entity.system.User_;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public final class UserCriteriaTranslator {

  private static final Set<String> ALLOWED_SORT_FIELDS =
      Set.of("id", "username", "email", "status", "createdAt", "updatedAt");

  private UserCriteriaTranslator() {}

  public static CriteriaQuery<User> translate(
      CriteriaBuilder builder, UserFilterInput filter, List<OrderByInput> orderBy) {

    CriteriaQuery<User> query = builder.createQuery(User.class);
    Root<User> root = query.from(User.class);

    CriteriaQueryContext<User> ctx = new CriteriaQueryContext<>(builder, query, root);

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
      ctx.addOrder(builder.desc(root.get(User_.createdAt)));
    }

    return ctx.build();
  }

  public static CriteriaQuery<Long> translateCount(
      CriteriaBuilder builder, UserFilterInput filter) {

    CriteriaQuery<Long> query = builder.createQuery(Long.class);
    Root<User> root = query.from(User.class);

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

  private static void translateFilter(CriteriaQueryContext<User> ctx, UserFilterInput filter) {
    if (filter == null) {
      return;
    }

    CriteriaBuilder builder = ctx.getBuilder();
    Root<User> root = ctx.getRoot();

    ctx.addPredicate(
        CriteriaFilterHelper.translateLongFilter(builder, root.get(User_.id), filter.id));

    ctx.addPredicate(
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(User_.username), filter.username));

    ctx.addPredicate(
        CriteriaFilterHelper.translateStringFilter(builder, root.get(User_.email), filter.email));

    ctx.addPredicate(
        CriteriaFilterHelper.translateEnumFilter(builder, root.get(User_.status), filter.status));

    ctx.addPredicate(
        CriteriaFilterHelper.translateDateTimeFilter(
            builder, root.get(User_.createdAt), filter.createdAt));

    ctx.addPredicate(
        CriteriaFilterHelper.translateDateTimeFilter(
            builder, root.get(User_.updatedAt), filter.updatedAt));

    translateRolesFilter(ctx, filter.roles);

    translateLogicalOperators(ctx, filter);
  }

  private static void translateFilterToPredicates(
      CriteriaBuilder builder,
      Root<User> root,
      List<Predicate> predicates,
      UserFilterInput filter) {

    if (filter == null) {
      return;
    }

    Predicate idPredicate =
        CriteriaFilterHelper.translateLongFilter(builder, root.get(User_.id), filter.id);
    if (idPredicate != null) {
      predicates.add(idPredicate);
    }

    Predicate usernamePredicate =
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(User_.username), filter.username);
    if (usernamePredicate != null) {
      predicates.add(usernamePredicate);
    }

    Predicate emailPredicate =
        CriteriaFilterHelper.translateStringFilter(builder, root.get(User_.email), filter.email);
    if (emailPredicate != null) {
      predicates.add(emailPredicate);
    }

    Predicate statusPredicate =
        CriteriaFilterHelper.translateEnumFilter(builder, root.get(User_.status), filter.status);
    if (statusPredicate != null) {
      predicates.add(statusPredicate);
    }

    Predicate createdAtPredicate =
        CriteriaFilterHelper.translateDateTimeFilter(
            builder, root.get(User_.createdAt), filter.createdAt);
    if (createdAtPredicate != null) {
      predicates.add(createdAtPredicate);
    }

    Predicate updatedAtPredicate =
        CriteriaFilterHelper.translateDateTimeFilter(
            builder, root.get(User_.updatedAt), filter.updatedAt);
    if (updatedAtPredicate != null) {
      predicates.add(updatedAtPredicate);
    }

    translateRolesFilterToPredicates(builder, root, predicates, filter.roles);

    translateLogicalOperatorsToPredicates(builder, root, predicates, filter);
  }

  private static void translateRolesFilter(
      CriteriaQueryContext<User> ctx, RoleFilterInput rolesFilter) {
    if (rolesFilter == null) {
      return;
    }

    CriteriaBuilder builder = ctx.getBuilder();
    Root<User> root = ctx.getRoot();

    Join<User, Role> roleJoin = root.join(User_.roles);

    List<Predicate> rolePredicates = new ArrayList<>();

    if (rolesFilter.id != null) {
      rolePredicates.add(
          CriteriaFilterHelper.translateLongFilter(
              builder, roleJoin.get(Role_.id), rolesFilter.id));
    }

    if (rolesFilter.code != null) {
      rolePredicates.add(
          CriteriaFilterHelper.translateStringFilter(
              builder, roleJoin.get(Role_.code), rolesFilter.code));
    }

    if (rolesFilter.name != null) {
      rolePredicates.add(
          CriteriaFilterHelper.translateStringFilter(
              builder, roleJoin.get(Role_.name), rolesFilter.name));
    }

    if (rolesFilter.permissions != null) {
      Join<Role, Permission> permJoin = roleJoin.join(Role_.permissions);
      translatePermissionsFilter(builder, permJoin, rolePredicates, rolesFilter.permissions);
    }

    if (!rolePredicates.isEmpty()) {
      ctx.addPredicate(builder.and(rolePredicates.toArray(new Predicate[0])));
      ctx.setDistinct(true);
    }
  }

  private static void translateRolesFilterToPredicates(
      CriteriaBuilder builder,
      Root<User> root,
      List<Predicate> predicates,
      RoleFilterInput rolesFilter) {

    if (rolesFilter == null) {
      return;
    }

    Join<User, Role> roleJoin = root.join(User_.roles);

    List<Predicate> rolePredicates = new ArrayList<>();

    if (rolesFilter.id != null) {
      Predicate p =
          CriteriaFilterHelper.translateLongFilter(builder, roleJoin.get(Role_.id), rolesFilter.id);
      if (p != null) {
        rolePredicates.add(p);
      }
    }

    if (rolesFilter.code != null) {
      Predicate p =
          CriteriaFilterHelper.translateStringFilter(
              builder, roleJoin.get(Role_.code), rolesFilter.code);
      if (p != null) {
        rolePredicates.add(p);
      }
    }

    if (rolesFilter.name != null) {
      Predicate p =
          CriteriaFilterHelper.translateStringFilter(
              builder, roleJoin.get(Role_.name), rolesFilter.name);
      if (p != null) {
        rolePredicates.add(p);
      }
    }

    if (rolesFilter.permissions != null) {
      Join<Role, Permission> permJoin = roleJoin.join(Role_.permissions);
      translatePermissionsFilter(builder, permJoin, rolePredicates, rolesFilter.permissions);
    }

    if (!rolePredicates.isEmpty()) {
      predicates.add(builder.and(rolePredicates.toArray(new Predicate[0])));
    }
  }

  private static void translatePermissionsFilter(
      CriteriaBuilder builder,
      Join<Role, Permission> permJoin,
      List<Predicate> predicates,
      PermissionFilterInput permFilter) {

    if (permFilter == null) {
      return;
    }

    if (permFilter.id != null) {
      Predicate p =
          CriteriaFilterHelper.translateLongFilter(
              builder, permJoin.get(Permission_.id), permFilter.id);
      if (p != null) {
        predicates.add(p);
      }
    }

    if (permFilter.code != null) {
      Predicate p =
          CriteriaFilterHelper.translateStringFilter(
              builder, permJoin.get(Permission_.code), permFilter.code);
      if (p != null) {
        predicates.add(p);
      }
    }

    if (permFilter.name != null) {
      Predicate p =
          CriteriaFilterHelper.translateStringFilter(
              builder, permJoin.get(Permission_.name), permFilter.name);
      if (p != null) {
        predicates.add(p);
      }
    }
  }

  private static void translateLogicalOperators(
      CriteriaQueryContext<User> ctx, UserFilterInput filter) {
    if (filter == null) {
      return;
    }

    CriteriaBuilder builder = ctx.getBuilder();
    Root<User> root = ctx.getRoot();

    if (filter._and != null && !filter._and.isEmpty()) {
      List<Predicate> andPredicates = new ArrayList<>();
      for (UserFilterInput f : filter._and) {
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
      for (UserFilterInput f : filter._or) {
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
      Root<User> root,
      List<Predicate> predicates,
      UserFilterInput filter) {

    if (filter == null) {
      return;
    }

    if (filter._and != null && !filter._and.isEmpty()) {
      List<Predicate> andPredicates = new ArrayList<>();
      for (UserFilterInput f : filter._and) {
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
      for (UserFilterInput f : filter._or) {
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
