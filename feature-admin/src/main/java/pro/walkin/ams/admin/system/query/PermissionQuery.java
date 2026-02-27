package pro.walkin.ams.admin.system.query;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Permission_;

/**
 * 权限查询类
 * 所有权限相关的查询方法都放在这里
 */
@ApplicationScoped
public class PermissionQuery {

    public Optional<Permission> findById(Long id) {
        return Permission_.managedBlocking().findByIdOptional(id);
    }

    public Optional<Permission> findByCode(String code) {
        return Permission_.managedBlocking().find("code", code).firstResultOptional();
    }

    public List<Permission> listByTenant(Long tenantId, String sortBy, String sortOrder, int page, int size) {
        String sortField = mapSortField(sortBy);
        String direction = "DESC".equalsIgnoreCase(sortOrder) ? "DESC" : "ASC";
        return Permission_.managedBlocking()
            .find("tenant = ?1 order by " + sortField + " " + direction, tenantId)
            .page(page, size)
            .list();
    }

    public long countByTenant(Long tenantId) {
        return Permission_.managedBlocking().count("tenant", tenantId);
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
