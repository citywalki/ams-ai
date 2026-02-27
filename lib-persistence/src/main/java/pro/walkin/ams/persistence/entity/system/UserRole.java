package pro.walkin.ams.persistence.entity.system;

import io.quarkus.hibernate.panache.PanacheEntityBase;
import io.quarkus.hibernate.panache.PanacheRepository;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.processing.Find;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Entity
@Table(name = "user_roles")
@IdClass(UserRoleId.class)
public class UserRole extends PanacheEntityBase {

  @Id
  @Column(name = "user_id", nullable = false)
  public Long userId;

  @Id
  @Column(name = "role_id", nullable = false)
  public Long roleId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, insertable = false, updatable = false)
  public User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "role_id", nullable = false, insertable = false, updatable = false)
  public Role role;

  @Column(name = "granted_at", nullable = false, updatable = false)
  @CreationTimestamp
  public LocalDateTime grantedAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "granted_by")
  public User grantedBy;

  public interface Repo extends PanacheRepository<UserRole> {

    @Find
    Optional<UserRole> findByUserIdAndRoleId(Long userId, Long roleId);

    @Find
    List<UserRole> listByUserId(Long userId);
  }
}
