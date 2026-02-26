package pro.walkin.ams.persistence.entity.system;

import io.quarkus.hibernate.panache.PanacheRepository;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
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
@Filter(name = "tenant-filter")
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
    
    default List<Role> listByTenant(Long tenantId, int page, int size) {
        return find("tenant", tenantId).page(page, size).list();
    }

    default List<Role> listByTenantAndKeyword(Long tenantId, String keyword, String sortBy, String sortOrder, int page, int size) {
      StringBuilder query = new StringBuilder("tenant = :tenantId");
      java.util.HashMap<String, Object> params = new java.util.HashMap<>();
      params.put("tenantId", tenantId);

      if (keyword != null && !keyword.isBlank()) {
        String pattern = "%" + keyword.trim().toLowerCase() + "%";
        query.append(" and (lower(code) like :pattern or lower(name) like :pattern)");
        params.put("pattern", pattern);
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
        case "code" -> "code";
        case "name" -> "name";
        case "createdAt" -> "createdAt";
        case "updatedAt" -> "updatedAt";
        default -> "createdAt";
      };
    }
    
    default long countByTenant(Long tenantId) {
        return count("tenant", tenantId);
    }

    default long countByTenantAndKeyword(Long tenantId, String keyword) {
      if (keyword == null || keyword.isBlank()) {
        return countByTenant(tenantId);
      }
      String pattern = "%" + keyword.trim().toLowerCase() + "%";
      java.util.HashMap<String, Object> params = new java.util.HashMap<>();
      params.put("tenant", tenantId);
      params.put("pattern", pattern);
      return count(
          "tenant = :tenant and (lower(code) like :pattern or lower(name) like :pattern)", params);
    }
  }
}
