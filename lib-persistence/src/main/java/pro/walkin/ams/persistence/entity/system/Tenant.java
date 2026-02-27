package pro.walkin.ams.persistence.entity.system;

import io.quarkus.hibernate.panache.PanacheEntityBase;
import io.quarkus.hibernate.panache.PanacheRepository;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.eclipse.microprofile.graphql.Ignore;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.NaturalId;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.processing.Find;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.persistence.generator.SnowflakeIdGeneratorType;

import java.time.Instant;
import java.util.Map;

/**
 * 租户实体
 *
 * <p>对应数据库表: tenants
 */
@Entity
@Table(name = "tenants")
public class Tenant extends PanacheEntityBase {

  @Id @SnowflakeIdGeneratorType public Long id;

  /*
   * 业务线代码，唯一标识
   */
  @NaturalId
  @Column(name = "code")
  public String code;

  /*
   * 业务线名称
   */
  @Column(name = "name")
  public String name;

  /*
   * 状态
   */
  @Column(name = "status")
  public String status;

  /*
   * 业务线专属配置 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "config")
  @Ignore
  public Map<String, Object> config;

  /*
   * 资源配额配置 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "quota")
  @Ignore
  public Map<String, Object> quota;

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

  public interface Repo extends PanacheRepository<Tenant> {

    @Find
    Tenant findByCode(String code);
  }
}
