package pro.walkin.ams.persistence.entity.modeling;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import pro.walkin.ams.persistence.entity.BaseEntity;

import java.time.LocalDateTime;

/**
 * 告警来源实体
 *
 * <p>对应数据库表: alert_source
 */
@Entity
@Table(name = "alert_source")
public class AlertSource extends BaseEntity {

  @Column(name = "created_at")
  @CreationTimestamp
  public LocalDateTime createdAt;

  @Column(name = "updated_at")
  @UpdateTimestamp
  public LocalDateTime updatedAt;

  /** 友好名称 */
  @Column(name = "name")
  public String name;

  /** 协议类型: HTTP, RABBITMQ, KAFKA, etc. */
  @Column(name = "protocol")
  public String protocol;

  /** 是否启用 */
  @Column(name = "is_enabled")
  public Boolean isEnabled;

  /** 存储特定协议的配置，如 Queue 名称或 Topic，建议存为 JSON 字符串 */
  @Column(name = "connection_config")
  public String connectionConfig;
}
