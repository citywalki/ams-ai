package pro.walkin.ams.persistence.entity.running;

import io.quarkus.hibernate.panache.PanacheRepository;
import io.quarkus.panache.common.Parameters;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.processing.Find;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.persistence.entity.BaseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/**
 * 告警实体
 *
 * <p>对应数据库表: alarms
 */
@Entity
@Table(name = "alarms")
public class Alarm extends BaseEntity {

  @Column(name = "created_at")
  @CreationTimestamp
  public LocalDateTime createdAt;

  @Column(name = "updated_at")
  @UpdateTimestamp
  public LocalDateTime updatedAt;

  /*
   * 告警标题
   */
  @Column(name = "title")
  public String title;

  /*
   * 告警描述
   */
  @Column(name = "description")
  public String description;

  /*
   * 严重程度
   */
  @Enumerated(EnumType.STRING)
  @Column(name = "severity")
  public Constants.Alarm.Severity severity;

  /*
   * 状态
   */
  @Enumerated(EnumType.STRING)
  @Column(name = "status")
  public Constants.Alarm.Status status;

  /*
   * 告警来源
   */
  @Column(name = "source")
  public String source;

  /*
   * 来源ID
   */
  @Column(name = "source_id")
  public String sourceId;

  /*
   * 指纹（用于告警聚合）
   */
  @Column(name = "fingerprint")
  public String fingerprint;

  /*
   * 原始告警元数据 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "metadata")
  public Map<String, Object> metadata;

  /*
   * 告警发生时间
   */
  @Column(name = "occurred_at")
  public LocalDateTime occurredAt;

  /*
   * 确认时间
   */
  @Column(name = "acknowledged_at")
  public LocalDateTime acknowledgedAt;

  /*
   * 解决时间
   */
  @Column(name = "resolved_at")
  public LocalDateTime resolvedAt;

  /*
   * 关闭时间
   */
  @Column(name = "closed_at")
  public LocalDateTime closedAt;

  /**
   * 更新告警严重程度
   *
   * @param newSeverity 新的严重程度
   */
  public void updateAlarmSeverity(Constants.Alarm.Severity newSeverity) {
    this.severity = newSeverity;
  }

  public interface Repo extends PanacheRepository<Alarm> {

    @Find
    Stream<Alarm> findBySourceId(String sourceId);

    default List<Alarm> fetchPendingAlarms(int offset, int limit) {
      List<Constants.Alarm.Status> statuses =
          List.of(
              Constants.Alarm.Status.NEW,
              Constants.Alarm.Status.ACKNOWLEDGED,
              Constants.Alarm.Status.IN_PROGRESS);

      return find("status in (:statuses)", Parameters.with("statuses", statuses).map()).stream()
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
}
