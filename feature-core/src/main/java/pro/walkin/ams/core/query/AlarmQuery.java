package pro.walkin.ams.core.query;

import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.persistence.entity.running.Alarm;
import pro.walkin.ams.persistence.entity.running.Alarm_;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 告警查询类
 *
 * <p>所有告警相关的查询方法都放在这里
 */
@ApplicationScoped
public class AlarmQuery {

  /**
   * 查询待处理的告警
   *
   * @param offset 偏移量
   * @param limit 限制数量
   * @return 待处理告警列表
   */
  public List<Alarm> fetchPendingAlarms(int offset, int limit) {
    List<Constants.Alarm.Status> statuses =
        List.of(
            Constants.Alarm.Status.NEW,
            Constants.Alarm.Status.ACKNOWLEDGED,
            Constants.Alarm.Status.IN_PROGRESS);

    return Alarm_.managedBlocking()
        .find("status in (:statuses)", Parameters.with("statuses", statuses).map())
        .stream()
        .sorted(
            (a1, a2) -> {
              LocalDateTime t1 = a1.occurredAt != null ? a1.occurredAt : LocalDateTime.MIN;
              LocalDateTime t2 = a2.occurredAt != null ? a2.occurredAt : LocalDateTime.MIN;
              return t1.compareTo(t2);
            })
        .skip(offset)
        .limit(limit)
        .toList();
  }
}
