package pro.walkin.ams.persistence.entity.modeling;

import jakarta.persistence.*;
import org.eclipse.microprofile.graphql.Ignore;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.persistence.entity.BaseEntity;

import java.time.Instant;
import java.util.Map;

/**
 * 通知模板实体
 *
 * <p>对应数据库表: notification_templates
 */
@Entity
@Table(name = "notification_templates")
public class NotificationTemplate extends BaseEntity {

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
   * 模板名称
   */
  @Column(name = "name")
  String name;

  /*
   * 渠道类型
   */
  @Column(name = "channel_type")
  String channelType;

  /*
   * 内容类型
   */
  @Column(name = "content_type")
  String contentType;

  /*
   * 主题模板
   */
  @Column(name = "subject_template")
  String subjectTemplate;

  /*
   * 正文模板
   */
  @Column(name = "body_template")
  String bodyTemplate;

  /*
   * 变量定义 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "variables")
  @Ignore
  Map<String, Object> variables;
}
