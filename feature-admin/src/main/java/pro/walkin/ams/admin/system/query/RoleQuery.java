package pro.walkin.ams.admin.system.query;

import jakarta.enterprise.context.ApplicationScoped;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.Role_;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

/** 角色查询类 所有角色相关的查询方法都放在这里 */
@ApplicationScoped
public class RoleQuery {

  public Optional<Role> findById(Long id) {
    return Role_.managedBlocking().findByIdOptional(id);
  }

  public Optional<Role> findByCode(String code) {
    return Role_.managedBlocking().find("code", code).firstResultOptional();
  }

  public List<Role> listByTenant(Long tenantId, int page, int size) {
    return Role_.managedBlocking().find("tenant", tenantId).page(page, size).list();
  }

  public List<Role> listByTenantAndKeyword(
      Long tenantId, String keyword, String sortBy, String sortOrder, int page, int size) {
    StringBuilder query = new StringBuilder("tenant = :tenantId");
    HashMap<String, Object> params = new HashMap<>();
    params.put("tenantId", tenantId);

    if (keyword != null && !keyword.isBlank()) {
      String pattern = "%" + keyword.trim().toLowerCase() + "%";
      query.append(" and (lower(code) like :pattern or lower(name) like :pattern)");
      params.put("pattern", pattern);
    }

    String sortField = mapSortField(sortBy);
    String direction = "DESC".equalsIgnoreCase(sortOrder) ? "DESC" : "ASC";
    query.append(" order by ").append(sortField).append(" ").append(direction);

    return Role_.managedBlocking().find(query.toString(), params).page(page, size).list();
  }

  public long countByTenant(Long tenantId) {
    return Role_.managedBlocking().count("tenant", tenantId);
  }

  public long countByTenantAndKeyword(Long tenantId, String keyword) {
    if (keyword == null || keyword.isBlank()) {
      return countByTenant(tenantId);
    }
    String pattern = "%" + keyword.trim().toLowerCase() + "%";
    HashMap<String, Object> params = new HashMap<>();
    params.put("tenant", tenantId);
    params.put("pattern", pattern);
    return Role_.managedBlocking()
        .count(
            "tenant = :tenant and (lower(code) like :pattern or lower(name) like :pattern)",
            params);
  }

  private String mapSortField(String sortBy) {
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
}
