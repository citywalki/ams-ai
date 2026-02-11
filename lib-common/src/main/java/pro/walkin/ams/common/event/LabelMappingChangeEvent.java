package pro.walkin.ams.common.event;

import java.io.Serializable;

/** 标签映射变更事件 */
public record LabelMappingChangeEvent(
    /** 来源 ID，如果为 null，表示刷新所有源 */
    String sourceId,

    /** 时间戳 */
    long timestamp)
    implements Serializable {

  /** 紧凑构造器，提供默认值 */
  public LabelMappingChangeEvent {
    if (timestamp == 0) {
      timestamp = System.currentTimeMillis();
    }
  }

  /** 创建全源刷新事件 */
  public static LabelMappingChangeEvent forAllSources() {
    return new LabelMappingChangeEvent(null, System.currentTimeMillis());
  }

  /** 创建指定源的事件 */
  public static LabelMappingChangeEvent forSource(String sourceId) {
    return new LabelMappingChangeEvent(sourceId, System.currentTimeMillis());
  }
}
