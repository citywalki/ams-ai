package pro.walkin.ams.persistence.entity.system;

import io.quarkus.hibernate.panache.PanacheRepository;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.processing.Find;
import pro.walkin.ams.persistence.entity.BaseEntity;

/**
 * 角色实体
 *
 * <p>对应数据库表: roles
 */
@Entity
@Table(name = "roles")
public class Role extends BaseEntity {

  /*
   * 角色码，例如: ADMIN, USER, MANAGER
   */
  @Column(name = "code", nullable = false, unique = true)
  public String code;

  /*
   * 角色名称
   */
  @Column(name = "name", nullable = false)
  public String name;

  /*
   * 角色描述
   */
  @Column(name = "description")
  public String description;

  /*
   * 角色拥有的权限集合
   */
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "role_permissions",
      joinColumns = @JoinColumn(name = "role_id"),
      inverseJoinColumns = @JoinColumn(name = "permission_id"))
  public Set<Permission> permissions = new HashSet<>();

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

  public interface Repo extends PanacheRepository<Role> {

    @Find
    Optional<Role> findByCode(String code);
  }
}
