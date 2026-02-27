package pro.walkin.ams.core.event;

import pro.walkin.ams.common.Constants;
import pro.walkin.ams.persistence.entity.running.Alarm;

import java.time.Instant;

/** 告警升级事件 */
public record AlarmEscalatedEvent(
    /** 告警ID */
    Long alarmId,
    /** 租户ID */
    Long tenantId,
    /** 升级前的严重程度 */
    Constants.Alarm.Severity previousSeverity,
    /** 升级后的严重程度 */
    Constants.Alarm.Severity newSeverity,
    /** 升级前的优先级 */
    int previousPriority,
    /** 升级后的优先级 */
    int newPriority,
    /** 升级原因 */
    String reason,
    /** 升级时间 */
    Instant escalatedAt,
    /** 告警持续时间（秒） */
    long durationSeconds) {
  public AlarmEscalatedEvent(
      Alarm alarm,
      Constants.Alarm.Severity previousSeverity,
      Constants.Alarm.Severity newSeverity,
      int previousPriority,
      int newPriority,
      String reason,
      long durationSeconds) {
    this(
        alarm.id,
        alarm.tenant,
        previousSeverity,
        newSeverity,
        previousPriority,
        newPriority,
        reason,
        Instant.now(),
        durationSeconds);
  }
}
