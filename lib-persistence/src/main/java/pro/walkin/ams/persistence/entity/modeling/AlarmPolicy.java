package pro.walkin.ams.persistence.entity.modeling;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.persistence.entity.BaseEntity;

import java.time.Instant;
import java.util.Map;

/**
 * 告警策略实体
 *
 * <p>对应数据库表: alarm_policies 注意: 无 plugin_name 字段，策略插件匹配由代码层 StrategyFactory 根据 tenant.code 自动加载
 */
@Entity
@Table(name = "alarm_policies")
public class AlarmPolicy extends BaseEntity {

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
   * 策略名称
   */
  @Column(name = "name")
  String name;

  /*
   * 策略类型
   */
  @Column(name = "type")
  String type;

  /*
   * 是否启用
   */
  @Column(name = "enabled")
  boolean enabled;

  /*
   * 条件配置 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "conditions")
  Map<String, Object> conditions;

  /*
   * 动作配置 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "actions")
  Map<String, Object> actions;

  /*
   * 优先级（数字越大优先级越高）
   */
  @Column(name = "priority")
  int priority;
}
