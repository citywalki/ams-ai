package pro.walkin.ams.persistence.entity.modeling;

import io.quarkus.hibernate.panache.PanacheRepository;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.processing.Find;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.persistence.entity.BaseEntity;

/**
 * 处理器配置实体
 *
 * <p>对应数据库表: processor_configs 用于配置告警处理责任链的节点顺序和开关
 */
@Entity
@Table(
    name = "processor_configs",
    uniqueConstraints = {
      @UniqueConstraint(
          columnNames = {"processor_name", "tenant_id"},
          name = "uk_processor_tenant")
    })
@FilterDef(name = "enabled", defaultCondition = "enabled = true")
public class ProcessorConfig extends BaseEntity {

  /** 处理器名称（对应 AlarmProcessor.getName()） */
  @Column(name = "processor_name", nullable = false, length = 100)
  public String processorName;

  /** 是否启用 */
  @Column(name = "enabled", nullable = false)
  public Boolean enabled;

  /** 执行顺序（数值越小越先执行） */
  @Column(name = "execution_order", nullable = false)
  public Integer executionOrder;

  /** 处理器描述 */
  @Column(name = "description", length = 500)
  public String description;

  /** 处理器配置参数（JSON格式） */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "parameters")
  public Map<String, Object> parameters;

  /** 版本号（乐观锁） */
  @Version
  @Column(name = "version")
  public Long version;

  /** 创建时间 */
  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  public Instant createdAt;

  /** 更新时间 */
  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  public Instant updatedAt;

  public interface Repo extends PanacheRepository<ProcessorConfig> {
    /**
     * 根据处理器名称查找配置
     *
     * @param processorName 处理器名称
     * @return 处理器配置
     */
    @Find
    List<ProcessorConfig> findProcessorName(String processorName);

    /**
     * 根据租户ID查找启用的处理器配置，按执行顺序排序
     *
     * @param tenant 租户ID
     * @return 处理器配置列表
     */
    @Find(enabledFetchProfiles = "enabled")
    List<ProcessorConfig> findByTenantOrderByExecutionOrderAsc(Long tenant);
  }
}
