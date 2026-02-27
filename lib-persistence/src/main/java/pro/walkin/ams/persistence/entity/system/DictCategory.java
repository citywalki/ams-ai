package pro.walkin.ams.persistence.entity.system;

import io.quarkus.hibernate.panache.PanacheRepository;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.processing.Find;
import pro.walkin.ams.persistence.entity.BaseEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dict_category")
public class DictCategory extends BaseEntity {

  @Column(name = "code", nullable = false, length = 64)
  public String code;

  @Column(name = "name", nullable = false, length = 128)
  public String name;

  @Column(name = "description", length = 512)
  public String description;

  @Column(name = "sort")
  public Integer sort = 0;

  @Column(name = "status")
  public Integer status = 1;

  @Column(name = "created_at")
  @CreationTimestamp
  public LocalDateTime createdAt;

  @Column(name = "updated_at")
  @UpdateTimestamp
  public LocalDateTime updatedAt;

  @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
  public List<DictItem> items = new ArrayList<>();

  public interface Repo extends PanacheRepository<DictCategory> {

    @Find
    DictCategory findByCode(String code);

    default long countByCodeAndTenant(String code, Long tenantId) {
      if (tenantId == null) {
        return count("code = ?1 and tenant is null", code);
      }
      return count("code = ?1 and tenant = ?2", code, tenantId);
    }

    default long countByCodeAndTenantExcludingId(String code, Long tenantId, Long excludeId) {
      if (tenantId == null) {
        return count("code = ?1 and tenant is null and id != ?2", code, excludeId);
      }
      return count("code = ?1 and tenant = ?2 and id != ?3", code, tenantId, excludeId);
    }
  }
}
