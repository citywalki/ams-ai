package pro.walkin.ams.graphql.filter;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.util.ArrayList;
import java.util.List;

public class CriteriaQueryContext<E> {

  private final CriteriaBuilder builder;
  private final CriteriaQuery<E> query;
  private final Root<E> root;
  private final List<Predicate> predicates = new ArrayList<>();
  private final List<Order> orders = new ArrayList<>();
  private boolean distinct = false;

  public CriteriaQueryContext(CriteriaBuilder builder, CriteriaQuery<E> query, Root<E> root) {
    this.builder = builder;
    this.query = query;
    this.root = root;
  }

  public CriteriaBuilder getBuilder() {
    return builder;
  }

  public Root<E> getRoot() {
    return root;
  }

  public void addPredicate(Predicate predicate) {
    if (predicate != null) {
      predicates.add(predicate);
    }
  }

  public void addOrder(Order order) {
    if (order != null) {
      orders.add(order);
    }
  }

  public void setDistinct(boolean distinct) {
    this.distinct = distinct;
  }

  public CriteriaQuery<E> build() {
    if (!predicates.isEmpty()) {
      query.where(builder.and(predicates.toArray(new Predicate[0])));
    }
    if (!orders.isEmpty()) {
      query.orderBy(orders);
    }
    if (distinct) {
      query.distinct(true);
    }
    return query;
  }

  public boolean hasPredicates() {
    return !predicates.isEmpty();
  }
}
