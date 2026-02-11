package pro.walkin.ams.persistence.entity;

import io.quarkus.hibernate.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.FilterDef;
import pro.walkin.ams.persistence.generator.SnowflakeIdGeneratorType;

@MappedSuperclass
@FilterDef(name = "tenant-filter", defaultCondition = "tenant = :tenant")
public abstract class BaseEntity extends PanacheEntityBase {

  @Id @SnowflakeIdGeneratorType public Long id;

  /*
   * 所属租户
   */
  @Column(name = "tenant_id", nullable = false)
  public Long tenant;

  @Override
  public String toString() {
    return this.getClass().getSimpleName() + "<" + id + ">";
  }
}
