package pro.walkin.ams.persistence.entity.modeling;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Map;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.persistence.entity.BaseEntity;

/**
 * 通知渠道实体
 *
 * <p>对应数据库表: notification_channels
 */
@Entity
@Table(name = "notification_channels")
public class NotificationChannel extends BaseEntity {

  /*
   * 创建时间
   */
  @Column(name = "created_at")
  @CreationTimestamp
  public Instant createdAt;
  /*
   * 更新时间
   */
  @Column(name = "updated_at")
  @UpdateTimestamp
  public Instant updatedAt;
  /*
   * 渠道名称
   */
  @Column(name = "name")
  String name;
  /*
   * 渠道类型
   */
  @Column(name = "type")
  String type;
  /*
   * 渠道配置 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "config")
  Map<String, Object> config;
  /*
   * 是否启用
   */
  @Column(name = "enabled")
  boolean enabled;
  /*
   * 优先级（数字越大优先级越高）
   */
  @Column(name = "priority")
  int priority;
  /*
   * 频率限制（单位时间内的最大发送次数）
   */
  @Column(name = "rate_limit")
  Integer rateLimit;
}
