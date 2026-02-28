package pro.walkin.ams.graphql.entity.alarm;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.graphql.filter.CriteriaFilterHelper;
import pro.walkin.ams.graphql.filter.CriteriaQueryContext;
import pro.walkin.ams.persistence.entity.running.Alarm;
import pro.walkin.ams.persistence.entity.running.Alarm_;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public final class AlarmCriteriaTranslator {

  private static final Set<String> ALLOWED_SORT_FIELDS =
      Set.of("id", "title", "severity", "status", "source", "createdAt", "occurredAt");

  private AlarmCriteriaTranslator() {}

  public static CriteriaQuery<Alarm> translate(
      CriteriaBuilder builder, AlarmFilterInput filter, List<OrderByInput> orderBy) {

    CriteriaQuery<Alarm> query = builder.createQuery(Alarm.class);
    Root<Alarm> root = query.from(Alarm.class);

    CriteriaQueryContext<Alarm> ctx = new CriteriaQueryContext<>(builder, query, root);

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
      ctx.addOrder(builder.desc(root.get(Alarm_.occurredAt)));
    }

    return ctx.build();
  }

  public static CriteriaQuery<Long> translateCount(
      CriteriaBuilder builder, AlarmFilterInput filter) {

    CriteriaQuery<Long> query = builder.createQuery(Long.class);
    Root<Alarm> root = query.from(Alarm.class);

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

  private static void translateFilter(CriteriaQueryContext<Alarm> ctx, AlarmFilterInput filter) {
    if (filter == null) {
      return;
    }

    CriteriaBuilder builder = ctx.getBuilder();
    Root<Alarm> root = ctx.getRoot();

    ctx.addPredicate(
        CriteriaFilterHelper.translateLongFilter(builder, root.get(Alarm_.id), filter.id));

    ctx.addPredicate(
        CriteriaFilterHelper.translateStringFilter(builder, root.get(Alarm_.title), filter.title));

    ctx.addPredicate(
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Alarm_.description), filter.description));

    ctx.addPredicate(
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Alarm_.source), filter.source));

    ctx.addPredicate(
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Alarm_.sourceId), filter.sourceId));

    ctx.addPredicate(
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Alarm_.fingerprint), filter.fingerprint));

    ctx.addPredicate(
        CriteriaFilterHelper.translateTypedEnumFilter(
            builder, root.get(Alarm_.severity), filter.severity, Constants.Alarm.Severity.class));

    ctx.addPredicate(
        CriteriaFilterHelper.translateTypedEnumFilter(
            builder, root.get(Alarm_.status), filter.status, Constants.Alarm.Status.class));

    ctx.addPredicate(
        CriteriaFilterHelper.translateLocalDateTimeFilter(
            builder, root.get(Alarm_.createdAt), filter.createdAt));

    ctx.addPredicate(
        CriteriaFilterHelper.translateLocalDateTimeFilter(
            builder, root.get(Alarm_.updatedAt), filter.updatedAt));

    ctx.addPredicate(
        CriteriaFilterHelper.translateLocalDateTimeFilter(
            builder, root.get(Alarm_.occurredAt), filter.occurredAt));

    translateLogicalOperators(ctx, filter);
  }

  private static void translateFilterToPredicates(
      CriteriaBuilder builder,
      Root<Alarm> root,
      List<Predicate> predicates,
      AlarmFilterInput filter) {

    if (filter == null) {
      return;
    }

    Predicate idPredicate =
        CriteriaFilterHelper.translateLongFilter(builder, root.get(Alarm_.id), filter.id);
    if (idPredicate != null) {
      predicates.add(idPredicate);
    }

    Predicate titlePredicate =
        CriteriaFilterHelper.translateStringFilter(builder, root.get(Alarm_.title), filter.title);
    if (titlePredicate != null) {
      predicates.add(titlePredicate);
    }

    Predicate descPredicate =
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Alarm_.description), filter.description);
    if (descPredicate != null) {
      predicates.add(descPredicate);
    }

    Predicate sourcePredicate =
        CriteriaFilterHelper.translateStringFilter(builder, root.get(Alarm_.source), filter.source);
    if (sourcePredicate != null) {
      predicates.add(sourcePredicate);
    }

    Predicate sourceIdPredicate =
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Alarm_.sourceId), filter.sourceId);
    if (sourceIdPredicate != null) {
      predicates.add(sourceIdPredicate);
    }

    Predicate fingerprintPredicate =
        CriteriaFilterHelper.translateStringFilter(
            builder, root.get(Alarm_.fingerprint), filter.fingerprint);
    if (fingerprintPredicate != null) {
      predicates.add(fingerprintPredicate);
    }

    Predicate severityPredicate =
        CriteriaFilterHelper.translateTypedEnumFilter(
            builder, root.get(Alarm_.severity), filter.severity, Constants.Alarm.Severity.class);
    if (severityPredicate != null) {
      predicates.add(severityPredicate);
    }

    Predicate statusPredicate =
        CriteriaFilterHelper.translateTypedEnumFilter(
            builder, root.get(Alarm_.status), filter.status, Constants.Alarm.Status.class);
    if (statusPredicate != null) {
      predicates.add(statusPredicate);
    }

    Predicate createdAtPredicate =
        CriteriaFilterHelper.translateLocalDateTimeFilter(
            builder, root.get(Alarm_.createdAt), filter.createdAt);
    if (createdAtPredicate != null) {
      predicates.add(createdAtPredicate);
    }

    Predicate updatedAtPredicate =
        CriteriaFilterHelper.translateLocalDateTimeFilter(
            builder, root.get(Alarm_.updatedAt), filter.updatedAt);
    if (updatedAtPredicate != null) {
      predicates.add(updatedAtPredicate);
    }

    Predicate occurredAtPredicate =
        CriteriaFilterHelper.translateLocalDateTimeFilter(
            builder, root.get(Alarm_.occurredAt), filter.occurredAt);
    if (occurredAtPredicate != null) {
      predicates.add(occurredAtPredicate);
    }

    translateLogicalOperatorsToPredicates(builder, root, predicates, filter);
  }

  private static void translateLogicalOperators(
      CriteriaQueryContext<Alarm> ctx, AlarmFilterInput filter) {
    if (filter == null) {
      return;
    }

    CriteriaBuilder builder = ctx.getBuilder();
    Root<Alarm> root = ctx.getRoot();

    if (filter._and != null && !filter._and.isEmpty()) {
      List<Predicate> andPredicates = new ArrayList<>();
      for (AlarmFilterInput f : filter._and) {
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
      for (AlarmFilterInput f : filter._or) {
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
      Root<Alarm> root,
      List<Predicate> predicates,
      AlarmFilterInput filter) {

    if (filter == null) {
      return;
    }

    if (filter._and != null && !filter._and.isEmpty()) {
      List<Predicate> andPredicates = new ArrayList<>();
      for (AlarmFilterInput f : filter._and) {
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
      for (AlarmFilterInput f : filter._or) {
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
