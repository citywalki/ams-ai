package pro.walkin.ams.persistence.entity.running;

import jakarta.persistence.*;
import java.time.Instant;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import pro.walkin.ams.persistence.entity.BaseEntity;

/**
 * 通知记录实体
 *
 * <p>对应数据库表: notifications
 */
@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {

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
   * 关联告警
   */
  @ManyToOne
  @JoinColumn(name = "alarm_id")
  Alarm alarm;
  /*
   * 发送渠道
   */
  @ManyToOne
  @JoinColumn(name = "channel_id")
  pro.walkin.ams.persistence.entity.modeling.NotificationChannel channel;
  /*
   * 使用的模板
   */
  @ManyToOne
  @JoinColumn(name = "template_id")
  pro.walkin.ams.persistence.entity.modeling.NotificationTemplate template;
  /*
   * 通知状态
   */
  @Column(name = "status")
  String status;
  /*
   * 接收人
   */
  @Column(name = "recipient")
  String recipient;
  /*
   * 主题
   */
  @Column(name = "subject")
  String subject;
  /*
   * 内容
   */
  @Column(name = "content")
  String content;
  /*
   * 发送时间
   */
  @Column(name = "sent_at")
  Instant sentAt;
  /*
   * 错误信息
   */
  @Column(name = "error_message")
  String errorMessage;
  /*
   * 重试次数
   */
  @Column(name = "retry_count")
  int retryCount;
  /*
   * 优先级
   */
  @Column(name = "priority")
  int priority;
  /*
   * 送达时间
   */
  @Column(name = "delivered_at")
  Instant deliveredAt;
}
