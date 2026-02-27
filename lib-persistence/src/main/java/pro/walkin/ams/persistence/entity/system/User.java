package pro.walkin.ams.persistence.entity.system;

import io.quarkus.hibernate.panache.PanacheRepository;
import jakarta.persistence.*;
import org.eclipse.microprofile.graphql.Ignore;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.processing.Find;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.persistence.entity.BaseEntity;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * 用户实体
 *
 * <p>对应数据库表: users
 */
@Entity
@Table(name = "users")
@Filter(name = "tenant-filter")
public class User extends BaseEntity {

  /*
   * 用户名
   */
  @Column(name = "username", nullable = false, unique = true)
  public String username;

  /*
   * 邮箱地址
   */
  @Column(name = "email", unique = true)
  public String email;

  /*
   * 密码哈希
   */
  @Column(name = "password_hash", nullable = false)
  @Ignore
  public String passwordHash;

  /*
   * 用户状态
   */
  @Column(name = "status", nullable = false)
  public String status = "ACTIVE";

  /*
   * 用户角色（多对多关联）
   */
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "user_roles",
      joinColumns = @JoinColumn(name = "user_id"),
      inverseJoinColumns = @JoinColumn(name = "role_id"))
  public Set<Role> roles = new HashSet<>();

  /*
   * 用户偏好设置 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "preferences")
  @Ignore
  public Map<String, Object> preferences;

  /*
   * 最后登录时间
   */
  @Column(name = "last_login_at")
  public Instant lastLoginAt;

  /*
   * 密码最后更新时间
   */
  @Column(name = "password_last_updated")
  public Instant passwordLastUpdated;

  /*
   * 账户锁定时间
   */
  @Column(name = "locked_until")
  public Instant lockedUntil;

  /*
   * 失败登录次数
   */
  @Column(name = "failed_login_attempts")
  public Integer failedLoginAttempts = 0;

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

  public interface Repo extends PanacheRepository<User> {
    @Find
    Optional<User> findByUsername(String username);

    @Find
    Optional<User> findByEmail(String email);

    default List<User> listByTenant(Long tenantId, int page, int size) {
      return find("tenant", tenantId).page(page, size).list();
    }

    default List<User> findByFilters(
        Long tenantId,
        String username,
        String email,
        String status,
        String sortBy,
        String sortOrder,
        int page,
        int size) {
      StringBuilder query = new StringBuilder("tenant = :tenantId");
      java.util.HashMap<String, Object> params = new java.util.HashMap<>();
      params.put("tenantId", tenantId);

      if (username != null && !username.isBlank()) {
        query.append(" and lower(username) like lower(:username)");
        params.put("username", "%" + username + "%");
      }
      if (email != null && !email.isBlank()) {
        query.append(" and lower(email) like lower(:email)");
        params.put("email", "%" + email + "%");
      }
      if (status != null && !status.isBlank()) {
        query.append(" and status = :status");
        params.put("status", status);
      }

      String sortField = mapSortField(sortBy);
      String direction = "DESC".equalsIgnoreCase(sortOrder) ? "DESC" : "ASC";
      query.append(" order by ").append(sortField).append(" ").append(direction);

      return find(query.toString(), params).page(page, size).list();
    }

    default String mapSortField(String sortBy) {
      if (sortBy == null) {
        return "createdAt";
      }
      return switch (sortBy) {
        case "username" -> "username";
        case "email" -> "email";
        case "status" -> "status";
        case "createdAt" -> "createdAt";
        case "updatedAt" -> "updatedAt";
        default -> "createdAt";
      };
    }

    default long countByFilters(Long tenantId, String username, String email, String status) {
      StringBuilder query = new StringBuilder("tenant = :tenantId");
      java.util.HashMap<String, Object> params = new java.util.HashMap<>();
      params.put("tenantId", tenantId);

      if (username != null && !username.isBlank()) {
        query.append(" and lower(username) like lower(:username)");
        params.put("username", "%" + username + "%");
      }
      if (email != null && !email.isBlank()) {
        query.append(" and lower(email) like lower(:email)");
        params.put("email", "%" + email + "%");
      }
      if (status != null && !status.isBlank()) {
        query.append(" and status = :status");
        params.put("status", status);
      }

      return count(query.toString(), params);
    }
  }
}
