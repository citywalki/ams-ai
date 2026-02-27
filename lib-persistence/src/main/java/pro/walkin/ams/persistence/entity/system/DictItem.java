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
@Table(name = "dict_item")
public class DictItem extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id", insertable = false, updatable = false)
  public DictCategory category;

  @Column(name = "category_id", nullable = false)
  public Long categoryId;

  @Column(name = "parent_id")
  public Long parentId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parent_id", insertable = false, updatable = false)
  public DictItem parent;

  @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
  public List<DictItem> children = new ArrayList<>();

  @Column(name = "code", nullable = false, length = 64)
  public String code;

  @Column(name = "name", nullable = false, length = 128)
  public String name;

  @Column(name = "value", length = 512)
  public String value;

  @Column(name = "sort")
  public Integer sort = 0;

  @Column(name = "status")
  public Integer status = 1;

  @Column(name = "remark", length = 256)
  public String remark;

  @Column(name = "created_at")
  @CreationTimestamp
  public LocalDateTime createdAt;

  @Column(name = "updated_at")
  @UpdateTimestamp
  public LocalDateTime updatedAt;

  public interface Repo extends PanacheRepository<DictItem> {

    @Find
    DictItem findByCode(String code);

    default long countByCodeAndCategoryId(String code, Long categoryId) {
      return count("code = ?1 and categoryId = ?2", code, categoryId);
    }

    default long countByCodeAndCategoryIdExcludingId(String code, Long categoryId, Long excludeId) {
      return count("code = ?1 and categoryId = ?2 and id != ?3", code, categoryId, excludeId);
    }

    default long countByParentId(Long parentId) {
      return count("parentId", parentId);
    }
  }
}
