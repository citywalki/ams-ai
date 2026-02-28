package pro.walkin.ams.graphql.entity.alarm;

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
import pro.walkin.ams.graphql.connection.AlarmConnection;
import pro.walkin.ams.graphql.connection.OrderByInput;
import pro.walkin.ams.persistence.entity.running.Alarm;

import java.util.List;

@GraphQLApi
public class AlarmGraphQLApi {

  @Inject Session session;

  @Query("alarms")
  @Description("查询告警列表，支持动态过滤")
  @Transactional
  public AlarmConnection alarms(
      @Name("where") AlarmFilterInput where,
      @Name("orderBy") List<OrderByInput> orderBy,
      @DefaultValue("0") @Name("page") int page,
      @DefaultValue("50") @Name("size") int size) {

    CriteriaBuilder builder = session.getCriteriaBuilder();

    CriteriaQuery<Alarm> query = AlarmCriteriaTranslator.translate(builder, where, orderBy);
    List<Alarm> alarms =
        session.createQuery(query).setFirstResult(page * size).setMaxResults(size).getResultList();

    CriteriaQuery<Long> countQuery = AlarmCriteriaTranslator.translateCount(builder, where);
    long total = session.createQuery(countQuery).getSingleResult();

    return new AlarmConnection(alarms, total, page, size);
  }
}
