package pro.walkin.ams.common.event;

import java.io.Serializable;

/** 告警规则变更事件 */
public record AlarmRuleChangeEvent(
    /** 租户 ID，如果为 null，表示刷新所有租户 */
    Long tenantId,

    /** 时间戳 */
    long timestamp)
    implements Serializable {

  /** 紧凑构造器，提供默认值 */
  public AlarmRuleChangeEvent {
    if (timestamp == 0) {
      timestamp = System.currentTimeMillis();
    }
  }

  /** 创建全租户刷新事件 */
  public static AlarmRuleChangeEvent forAllTenants() {
    return new AlarmRuleChangeEvent(null, System.currentTimeMillis());
  }

  /** 创建指定租户的事件 */
  public static AlarmRuleChangeEvent forTenant(Long tenantId) {
    return new AlarmRuleChangeEvent(tenantId, System.currentTimeMillis());
  }
}
