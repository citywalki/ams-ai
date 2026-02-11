package pro.walkin.ams.persistence.entity.system;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Map;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.persistence.entity.BaseEntity;

/**
 * 审计日志实体
 *
 * <p>对应数据库表: audit_logs
 */
@Entity
@Table(name = "audit_logs")
public class AuditLog extends BaseEntity {

  /*
   * 操作用户（可为空，表示系统操作）
   */
  @ManyToOne
  @JoinColumn(name = "user_id")
  User user;

  /*
   * 操作动作
   */
  @Column(name = "action")
  String action;

  /*
   * 资源类型
   */
  @Column(name = "resource_type")
  String resourceType;

  /*
   * 资源ID
   */
  @Column(name = "resource_id")
  String resourceId;

  /*
   * 旧值 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "old_values")
  Map<String, Object> oldValues;

  /*
   * 新值 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "new_values")
  Map<String, Object> newValues;

  /*
   * IP地址
   */
  @Column(name = "ip_address")
  String ipAddress;

  /*
   * 用户代理
   */
  @Column(name = "user_agent")
  String userAgent;

  /*
   * 状态码
   */
  @Column(name = "status_code")
  Integer statusCode;

  /*
   * 创建时间
   */
  @Column(name = "created_at")
  Instant createdAt;
}
