package pro.walkin.ams.core.event;

import pro.walkin.ams.common.Constants;
import pro.walkin.ams.persistence.entity.running.Alarm;

import java.time.LocalDateTime;

/** 告警创建事件 */
public record AlarmCreatedEvent(
    /* 告警ID */
    Long alarmId,
    /* 租户ID */
    Long tenantId,
    /* 告警标题 */
    String title,
    /* 告警描述 */
    String description,
    /* 严重程度 */
    Constants.Alarm.Severity severity,
    /* 告警来源 */
    String source,
    /* 来源ID */
    String sourceId,
    /* 指纹 */
    String fingerprint,
    /* 告警发生时间 */
    LocalDateTime occurredAt,
    /* 创建时间 */
    LocalDateTime createdAt) {
  public AlarmCreatedEvent(Alarm alarm) {
    this(
        alarm.id,
        alarm.tenant,
        alarm.title,
        alarm.description,
        alarm.severity,
        alarm.source,
        alarm.sourceId,
        alarm.fingerprint,
        alarm.occurredAt,
        alarm.createdAt);
  }
}
