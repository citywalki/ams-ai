package pro.walkin.ams.common.dto;

import pro.walkin.ams.common.Constants;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 告警事件
 *
 * <p>Serializable: Hazelcast 默认要求，但后续建议优化为特定序列化
 */
public record AlertEvent(
    /*
     指纹 (Fingerprint)
    */
    String id,

    /*
     来源 ID (Connector ID)
    */
    String sourceId,

    /* 告警摘要 */
    String summary,

    /* 归一化后的标签 */
    Map<String, String> labels,

    /* 出现次数（聚合字段） */
    int occurrenceCount,

    /* 首次出现时间（聚合字段） */
    LocalDateTime firstSeenAt,

    /* 最后出现时间（聚合字段） */
    LocalDateTime lastSeenAt,

    /* 状态：FIRING, RESOLVED */
    String status,
    String severity)
    implements Serializable {

  /** 紧凑构造器，提供默认值 */
  public AlertEvent {
    if (occurrenceCount <= 0) {
      occurrenceCount = 1;
    }
    if (firstSeenAt == null) {
      firstSeenAt = LocalDateTime.now();
    }
    if (lastSeenAt == null) {
      lastSeenAt = LocalDateTime.now();
    }
    if (status == null || status.isBlank()) {
      status = "FIRING";
    }
  }

  /** 创建builder风格的工厂方法 */
  public static Builder builder() {
    return new Builder();
  }

  public static class Builder {
    private String id;
    private String sourceId;
    private String summary;
    private Map<String, String> labels;
    private int occurrenceCount = 1;
    private LocalDateTime firstSeenAt = LocalDateTime.now();
    private LocalDateTime lastSeenAt = LocalDateTime.now();
    private String status = "FIRING";
    private String severity = "UNKNOWN";

    public Builder id(String id) {
      this.id = id;
      return this;
    }

    public Builder sourceId(String sourceId) {
      this.sourceId = sourceId;
      return this;
    }

    public Builder summary(String summary) {
      this.summary = summary;
      return this;
    }

    public Builder labels(Map<String, String> labels) {
      this.labels = labels;
      return this;
    }

    public Builder occurrenceCount(int occurrenceCount) {
      this.occurrenceCount = occurrenceCount;
      return this;
    }

    public Builder firstSeenAt(LocalDateTime firstSeenAt) {
      this.firstSeenAt = firstSeenAt;
      return this;
    }

    public Builder lastSeenAt(LocalDateTime lastSeenAt) {
      this.lastSeenAt = lastSeenAt;
      return this;
    }

    public Builder status(String status) {
      this.status = status;
      return this;
    }

    public Builder severity(String severity) {
      this.severity = severity;
      return this;
    }

    public AlertEvent build() {
      return new AlertEvent(
          id,
          sourceId,
          summary,
          labels,
          occurrenceCount,
          firstSeenAt,
          lastSeenAt,
          status,
          severity);
    }
  }
}
