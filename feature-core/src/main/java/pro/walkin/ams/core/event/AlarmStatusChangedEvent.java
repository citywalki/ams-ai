package pro.walkin.ams.core.event;

import pro.walkin.ams.common.Constants;
import pro.walkin.ams.persistence.entity.running.Alarm;

import java.time.Instant;

/** 告警状态变更事件 */
public record AlarmStatusChangedEvent(
    /** 告警ID */
    Long alarmId,
    /** 租户ID */
    Long tenantId,
    /** 变更前的状态 */
    Constants.Alarm.Status previousStatus,
    /** 变更后的状态 */
    Constants.Alarm.Status newStatus,
    /** 变更时间 */
    Instant changedAt,
    /** 操作用户ID */
    String userId,
    /** 操作备注 */
    String comment) {
  public AlarmStatusChangedEvent(
      Alarm alarm,
      Constants.Alarm.Status previousStatus,
      Constants.Alarm.Status newStatus,
      String userId,
      String comment) {
    this(alarm.id, alarm.tenant, previousStatus, newStatus, Instant.now(), userId, comment);
  }
}
