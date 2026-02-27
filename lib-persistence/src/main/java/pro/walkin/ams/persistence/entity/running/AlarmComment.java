package pro.walkin.ams.persistence.entity.running;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.persistence.entity.BaseEntity;
import pro.walkin.ams.persistence.entity.system.User;

import java.time.Instant;
import java.util.Map;

/**
 * 告警评论实体
 *
 * <p>对应数据库表: alarm_comments
 */
@Entity
@Table(name = "alarm_comments")
public class AlarmComment extends BaseEntity {

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
   * 评论用户
   */
  @ManyToOne
  @JoinColumn(name = "user_id")
  User user;

  /*
   * 评论内容
   */
  @Column(name = "content")
  String content;

  /*
   * 是否为内部评论
   */
  @Column(name = "is_internal")
  boolean isInternal;

  /*
   * 元数据 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "metadata")
  Map<String, Object> metadata;
}
