package pro.walkin.ams.persistence.entity.system;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import pro.walkin.ams.persistence.entity.BaseEntity;

import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken extends BaseEntity {

  @Column(name = "token", nullable = false, unique = true)
  public String token;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  public User user;

  @Column(name = "expires_at", nullable = false)
  public Instant expiresAt;

  @Column(name = "revoked", nullable = false)
  public Boolean revoked = false;

  @Column(name = "created_at", nullable = false, updatable = false)
  @CreationTimestamp
  public Instant createdAt;

  @Column(name = "last_used_at")
  public Instant lastUsedAt;

  public boolean isExpired() {
    return Instant.now().isAfter(expiresAt);
  }

  public boolean isValid() {
    return !revoked && !isExpired();
  }

  public void revoke() {
    this.revoked = true;
  }
}
