package pro.walkin.ams.persistence.entity.system;

import io.quarkus.hibernate.panache.PanacheEntityBase;
import io.quarkus.hibernate.panache.PanacheRepository;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.processing.Find;
import org.hibernate.annotations.processing.HQL;

@Entity
@Table(name = "role_permissions")
@IdClass(RolePermissionId.class)
public class RolePermission extends PanacheEntityBase {

  @Id
  @Column(name = "role_id", nullable = false)
  public Long roleId;

  @Id
  @Column(name = "permission_id", nullable = false)
  public Long permissionId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "role_id", nullable = false, insertable = false, updatable = false)
  public Role role;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "permission_id", nullable = false, insertable = false, updatable = false)
  public Permission permission;

  @Column(name = "granted_at", nullable = false, updatable = false)
  @CreationTimestamp
  public LocalDateTime grantedAt;

  public interface Repo extends PanacheRepository<RolePermission> {

    @Find
    Optional<RolePermission> findByRoleIdAndPermissionId(Long roleId, Long permissionId);

    @HQL("where roleId in (select roleId from UserRole where user.id = :userId)")
    List<RolePermission> listOfUser(Long userId);
  }
}
