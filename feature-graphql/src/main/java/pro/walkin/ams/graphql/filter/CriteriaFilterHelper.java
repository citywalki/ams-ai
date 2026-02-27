package pro.walkin.ams.graphql.filter;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.graphql.filter.input.BooleanFilterInput;
import pro.walkin.ams.graphql.filter.input.DateTimeFilterInput;
import pro.walkin.ams.graphql.filter.input.EnumFilterInput;
import pro.walkin.ams.graphql.filter.input.IntFilterInput;
import pro.walkin.ams.graphql.filter.input.LongFilterInput;
import pro.walkin.ams.graphql.filter.input.StringFilterInput;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

public final class CriteriaFilterHelper {

  private CriteriaFilterHelper() {}

  public static Predicate translateStringFilter(
      CriteriaBuilder builder, Path<String> path, StringFilterInput filter) {
    if (filter == null) {
      return null;
    }

    List<Predicate> predicates = new ArrayList<>();

    if (filter._eq != null) {
      predicates.add(builder.equal(path, filter._eq));
    }
    if (filter._neq != null) {
      predicates.add(builder.notEqual(path, filter._neq));
    }
    if (filter._like != null) {
      predicates.add(builder.like(path, filter._like));
    }
    if (filter._ilike != null) {
      predicates.add(builder.like(builder.lower(path), "%" + filter._ilike.toLowerCase() + "%"));
    }
    if (filter._startsWith != null) {
      predicates.add(builder.like(path, filter._startsWith + "%"));
    }
    if (filter._endsWith != null) {
      predicates.add(builder.like(path, "%" + filter._endsWith));
    }
    if (filter._in != null && !filter._in.isEmpty()) {
      predicates.add(path.in(filter._in));
    }
    if (filter._nin != null && !filter._nin.isEmpty()) {
      predicates.add(builder.not(path.in(filter._nin)));
    }
    if (filter._isNull != null) {
      predicates.add(filter._isNull ? builder.isNull(path) : builder.isNotNull(path));
    }

    return predicates.isEmpty() ? null : builder.and(predicates.toArray(new Predicate[0]));
  }

  public static Predicate translateLongFilter(
      CriteriaBuilder builder, Path<Long> path, LongFilterInput filter) {
    if (filter == null) {
      return null;
    }

    List<Predicate> predicates = new ArrayList<>();

    if (filter._eq != null) {
      predicates.add(builder.equal(path, parseLong(filter._eq)));
    }
    if (filter._neq != null) {
      predicates.add(builder.notEqual(path, parseLong(filter._neq)));
    }
    if (filter._gt != null) {
      predicates.add(builder.greaterThan(path, parseLong(filter._gt)));
    }
    if (filter._gte != null) {
      predicates.add(builder.greaterThanOrEqualTo(path, parseLong(filter._gte)));
    }
    if (filter._lt != null) {
      predicates.add(builder.lessThan(path, parseLong(filter._lt)));
    }
    if (filter._lte != null) {
      predicates.add(builder.lessThanOrEqualTo(path, parseLong(filter._lte)));
    }
    if (filter._in != null && !filter._in.isEmpty()) {
      List<Long> values = filter._in.stream().map(CriteriaFilterHelper::parseLong).toList();
      predicates.add(path.in(values));
    }
    if (filter._nin != null && !filter._nin.isEmpty()) {
      List<Long> values = filter._nin.stream().map(CriteriaFilterHelper::parseLong).toList();
      predicates.add(builder.not(path.in(values)));
    }
    if (filter._isNull != null) {
      predicates.add(filter._isNull ? builder.isNull(path) : builder.isNotNull(path));
    }

    return predicates.isEmpty() ? null : builder.and(predicates.toArray(new Predicate[0]));
  }

  public static Predicate translateDateTimeFilter(
      CriteriaBuilder builder, Path<Instant> path, DateTimeFilterInput filter) {
    if (filter == null) {
      return null;
    }

    List<Predicate> predicates = new ArrayList<>();

    if (filter._eq != null) {
      predicates.add(builder.equal(path, parseInstant(filter._eq)));
    }
    if (filter._neq != null) {
      predicates.add(builder.notEqual(path, parseInstant(filter._neq)));
    }
    if (filter._gt != null) {
      predicates.add(builder.greaterThan(path, parseInstant(filter._gt)));
    }
    if (filter._gte != null) {
      predicates.add(builder.greaterThanOrEqualTo(path, parseInstant(filter._gte)));
    }
    if (filter._lt != null) {
      predicates.add(builder.lessThan(path, parseInstant(filter._lt)));
    }
    if (filter._lte != null) {
      predicates.add(builder.lessThanOrEqualTo(path, parseInstant(filter._lte)));
    }
    if (filter._isNull != null) {
      predicates.add(filter._isNull ? builder.isNull(path) : builder.isNotNull(path));
    }

    return predicates.isEmpty() ? null : builder.and(predicates.toArray(new Predicate[0]));
  }

  public static Predicate translateLocalDateTimeFilter(
      CriteriaBuilder builder, Path<LocalDateTime> path, DateTimeFilterInput filter) {
    if (filter == null) {
      return null;
    }

    List<Predicate> predicates = new ArrayList<>();

    if (filter._eq != null) {
      predicates.add(builder.equal(path, parseLocalDateTime(filter._eq)));
    }
    if (filter._neq != null) {
      predicates.add(builder.notEqual(path, parseLocalDateTime(filter._neq)));
    }
    if (filter._gt != null) {
      predicates.add(builder.greaterThan(path, parseLocalDateTime(filter._gt)));
    }
    if (filter._gte != null) {
      predicates.add(builder.greaterThanOrEqualTo(path, parseLocalDateTime(filter._gte)));
    }
    if (filter._lt != null) {
      predicates.add(builder.lessThan(path, parseLocalDateTime(filter._lt)));
    }
    if (filter._lte != null) {
      predicates.add(builder.lessThanOrEqualTo(path, parseLocalDateTime(filter._lte)));
    }
    if (filter._isNull != null) {
      predicates.add(filter._isNull ? builder.isNull(path) : builder.isNotNull(path));
    }

    return predicates.isEmpty() ? null : builder.and(predicates.toArray(new Predicate[0]));
  }

  public static Predicate translateEnumFilter(
      CriteriaBuilder builder, Path<String> path, EnumFilterInput filter) {
    if (filter == null) {
      return null;
    }

    List<Predicate> predicates = new ArrayList<>();

    if (filter._eq != null) {
      predicates.add(builder.equal(path, filter._eq));
    }
    if (filter._neq != null) {
      predicates.add(builder.notEqual(path, filter._neq));
    }
    if (filter._in != null && !filter._in.isEmpty()) {
      predicates.add(path.in(filter._in));
    }
    if (filter._nin != null && !filter._nin.isEmpty()) {
      predicates.add(builder.not(path.in(filter._nin)));
    }
    if (filter._isNull != null) {
      predicates.add(filter._isNull ? builder.isNull(path) : builder.isNotNull(path));
    }

    return predicates.isEmpty() ? null : builder.and(predicates.toArray(new Predicate[0]));
  }

  public static <E extends Enum<E>> Predicate translateTypedEnumFilter(
      CriteriaBuilder builder, Path<E> path, EnumFilterInput filter, Class<E> enumClass) {
    if (filter == null) {
      return null;
    }

    List<Predicate> predicates = new ArrayList<>();

    if (filter._eq != null) {
      E enumValue = parseEnum(filter._eq, enumClass);
      predicates.add(builder.equal(path, enumValue));
    }
    if (filter._neq != null) {
      E enumValue = parseEnum(filter._neq, enumClass);
      predicates.add(builder.notEqual(path, enumValue));
    }
    if (filter._in != null && !filter._in.isEmpty()) {
      List<E> values = filter._in.stream().map(v -> parseEnum(v, enumClass)).toList();
      predicates.add(path.in(values));
    }
    if (filter._nin != null && !filter._nin.isEmpty()) {
      List<E> values = filter._nin.stream().map(v -> parseEnum(v, enumClass)).toList();
      predicates.add(builder.not(path.in(values)));
    }
    if (filter._isNull != null) {
      predicates.add(filter._isNull ? builder.isNull(path) : builder.isNotNull(path));
    }

    return predicates.isEmpty() ? null : builder.and(predicates.toArray(new Predicate[0]));
  }

  public static Predicate translateIntFilter(
      CriteriaBuilder builder, Path<Integer> path, IntFilterInput filter) {
    if (filter == null) {
      return null;
    }

    List<Predicate> predicates = new ArrayList<>();

    if (filter._eq != null) {
      predicates.add(builder.equal(path, filter._eq));
    }
    if (filter._neq != null) {
      predicates.add(builder.notEqual(path, filter._neq));
    }
    if (filter._gt != null) {
      predicates.add(builder.greaterThan(path, filter._gt));
    }
    if (filter._gte != null) {
      predicates.add(builder.greaterThanOrEqualTo(path, filter._gte));
    }
    if (filter._lt != null) {
      predicates.add(builder.lessThan(path, filter._lt));
    }
    if (filter._lte != null) {
      predicates.add(builder.lessThanOrEqualTo(path, filter._lte));
    }
    if (filter._in != null && !filter._in.isEmpty()) {
      predicates.add(path.in(filter._in));
    }
    if (filter._nin != null && !filter._nin.isEmpty()) {
      predicates.add(builder.not(path.in(filter._nin)));
    }
    if (filter._isNull != null) {
      predicates.add(filter._isNull ? builder.isNull(path) : builder.isNotNull(path));
    }

    return predicates.isEmpty() ? null : builder.and(predicates.toArray(new Predicate[0]));
  }

  public static Predicate translateBooleanFilter(
      CriteriaBuilder builder, Path<Boolean> path, BooleanFilterInput filter) {
    if (filter == null) {
      return null;
    }

    List<Predicate> predicates = new ArrayList<>();

    if (filter._eq != null) {
      predicates.add(builder.equal(path, filter._eq));
    }
    if (filter._neq != null) {
      predicates.add(builder.notEqual(path, filter._neq));
    }
    if (filter._isNull != null) {
      predicates.add(filter._isNull ? builder.isNull(path) : builder.isNotNull(path));
    }

    return predicates.isEmpty() ? null : builder.and(predicates.toArray(new Predicate[0]));
  }

  public static <T> void addStringPredicate(
      CriteriaBuilder builder,
      Root<T> root,
      String fieldName,
      StringFilterInput filter,
      List<Predicate> predicates) {
    Predicate predicate = translateStringFilter(builder, root.get(fieldName), filter);
    if (predicate != null) {
      predicates.add(predicate);
    }
  }

  public static <T> void addLongPredicate(
      CriteriaBuilder builder,
      Root<T> root,
      String fieldName,
      LongFilterInput filter,
      List<Predicate> predicates) {
    Predicate predicate = translateLongFilter(builder, root.get(fieldName), filter);
    if (predicate != null) {
      predicates.add(predicate);
    }
  }

  public static <T> void addIntPredicate(
      CriteriaBuilder builder,
      Root<T> root,
      String fieldName,
      IntFilterInput filter,
      List<Predicate> predicates) {
    Predicate predicate = translateIntFilter(builder, root.get(fieldName), filter);
    if (predicate != null) {
      predicates.add(predicate);
    }
  }

  public static <T> void addEnumPredicate(
      CriteriaBuilder builder,
      Root<T> root,
      String fieldName,
      EnumFilterInput filter,
      List<Predicate> predicates) {
    Predicate predicate = translateEnumFilter(builder, root.get(fieldName), filter);
    if (predicate != null) {
      predicates.add(predicate);
    }
  }

  public static <T> void addBooleanPredicate(
      CriteriaBuilder builder,
      Root<T> root,
      String fieldName,
      BooleanFilterInput filter,
      List<Predicate> predicates) {
    Predicate predicate = translateBooleanFilter(builder, root.get(fieldName), filter);
    if (predicate != null) {
      predicates.add(predicate);
    }
  }

  public static <T> void applyOrderBy(
      CriteriaBuilder builder,
      CriteriaQuery<T> query,
      Root<T> root,
      List<OrderByInput> orderBy) {
    if (orderBy == null || orderBy.isEmpty()) {
      return;
    }

    List<Order> orders = new ArrayList<>();
    for (OrderByInput ob : orderBy) {
      if (ob.field != null) {
        Order order =
            "DESC".equalsIgnoreCase(ob.direction)
                ? builder.desc(root.get(ob.field))
                : builder.asc(root.get(ob.field));
        orders.add(order);
      }
    }

    if (!orders.isEmpty()) {
      query.orderBy(orders);
    }
  }

  private static long parseLong(String value) {
    try {
      return Long.parseLong(value);
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("Invalid long value: " + value, e);
    }
  }

  private static Instant parseInstant(String value) {
    try {
      return Instant.parse(value);
    } catch (DateTimeParseException e) {
      try {
        return DateTimeFormatter.ISO_LOCAL_DATE_TIME.parse(value, Instant::from);
      } catch (DateTimeParseException e2) {
        throw new IllegalArgumentException("Invalid datetime value: " + value, e2);
      }
    }
  }

  private static LocalDateTime parseLocalDateTime(String value) {
    try {
      return LocalDateTime.parse(value, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    } catch (DateTimeParseException e) {
      try {
        return LocalDateTime.parse(value, DateTimeFormatter.ISO_DATE_TIME);
      } catch (DateTimeParseException e2) {
        throw new IllegalArgumentException("Invalid datetime value: " + value, e2);
      }
    }
  }

  private static <E extends Enum<E>> E parseEnum(String value, Class<E> enumClass) {
    try {
      return Enum.valueOf(enumClass, value);
    } catch (IllegalArgumentException e) {
      for (E enumConstant : enumClass.getEnumConstants()) {
        if (enumConstant.name().equalsIgnoreCase(value)) {
          return enumConstant;
        }
      }
      throw new IllegalArgumentException(
          "Invalid enum value: " + value + " for enum " + enumClass.getName(), e);
    }
  }
}
