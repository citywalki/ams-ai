package pro.walkin.ams.persistence.entity.modeling;

import io.quarkus.hibernate.panache.PanacheRepository;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.NaturalId;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.processing.Find;
import pro.walkin.ams.persistence.entity.BaseEntity;

/**
 * 标签映射规则表
 *
 * <p>对应数据库表: label_mapping
 */
@Entity
@Table(name = "label_mapping")
public class LabelMapping extends BaseEntity {

  /*
   * 来源ID，如 "prometheus-k8s"
   */
  @NaturalId
  @Column(name = "source_id")
  public String sourceId;

  /*
   * 原始标签名，如 "instance"
   */
  @Column(name = "source_key")
  public String sourceKey;

  /*
   * 统一后的标签名，如 "target_host"
   */
  @Column(name = "target_key")
  public String targetKey;

  /*
   * 创建时间
   */
  @Column(name = "created_at")
  @CreationTimestamp
  public LocalDateTime createdAt;

  /*
   * 更新时间
   */
  @Column(name = "updated_at")
  @UpdateTimestamp
  public LocalDateTime updatedAt;

  public interface Repo extends PanacheRepository<LabelMapping> {

    @Find
    List<LabelMapping> findBySourceId(String sourceId);
  }
}
