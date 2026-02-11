package pro.walkin.ams.core.event;

import java.time.LocalDateTime;
import java.util.Map;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.persistence.entity.running.Alarm;

/** 告警更新事件 */
public record AlarmUpdatedEvent(
    /* 告警ID */
    Long alarmId,
    /* 租户ID */
    Long tenantId,
    /* 更新前的状态 */
    Constants.Alarm.Status previousStatus,
    /* 更新后的状态 */
    Constants.Alarm.Status newStatus,
    /* 更新前的严重程度 */
    String previousSeverity,
    /* 更新后的严重程度 */
    Constants.Alarm.Severity newSeverity,
    /* 更新的元数据 */
    Map<String, Object> metadata,
    /* 更新时间 */
    LocalDateTime updatedAt,
    /* 操作用户ID */
    String userId) {
  public AlarmUpdatedEvent(
      Alarm alarm,
      Constants.Alarm.Status previousStatus,
      String previousSeverity,
      Map<String, Object> metadata,
      String userId) {
    this(
        alarm.id,
        alarm.tenant,
        previousStatus,
        alarm.status,
        previousSeverity,
        alarm.severity,
        metadata,
        alarm.updatedAt != null ? alarm.updatedAt : LocalDateTime.now(),
        userId);
  }
}
