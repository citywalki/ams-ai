package pro.walkin.ams.persistence.entity.modeling;

import io.quarkus.hibernate.panache.PanacheRepository;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.processing.Find;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.persistence.entity.BaseEntity;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * 告警规则实体
 *
 * <p>对应数据库表: alarm_rules
 */
@Entity
@Table(name = "alarm_rules")
public class AlarmRule extends BaseEntity {

  /** 规则名称 */
  @Column(name = "name")
  public String name;

  /** 规则类型 */
  @Column(name = "rule_type")
  public String ruleType;

  /** 规则描述 */
  @Column(name = "description")
  public String description;

  /** 规则条件（JSON格式） */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "conditions")
  public Map<String, Object> conditions;

  /** 规则动作（JSON格式） */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "actions")
  public Map<String, Object> actions;

  /** 优先级 */
  @Column(name = "priority")
  public Integer priority;

  /** 是否启用 */
  @Column(name = "enabled")
  public Boolean enabled;

  /** 版本号（乐观锁） */
  @Version
  @Column(name = "version")
  public Long version;

  /** 生效时间 */
  @Column(name = "effective_from")
  public Instant effectiveFrom;

  /** 失效时间 */
  @Column(name = "effective_until")
  public Instant effectiveUntil;

  /** 创建时间 */
  @Column(name = "created_at")
  @CreationTimestamp
  public Instant createdAt;

  /** 更新时间 */
  @Column(name = "updated_at")
  @UpdateTimestamp
  public Instant updatedAt;

  public interface Repo extends PanacheRepository<AlarmRule> {

    @Find
    List<AlarmRule> findByTenantAndEnabled(Long tenant, boolean enabled);

    @Find
    List<AlarmRule> findByTenantAndEnabledOrderByPriorityDesc(Long tenant, boolean enabled);
  }
}
