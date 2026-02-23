package pro.walkin.ams.admin.system;

import io.quarkus.hibernate.panache.blocking.PanacheBlockingQuery;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import pro.walkin.ams.persistence.entity.system.*;
import pro.walkin.ams.security.TenantContext;

@ApplicationScoped
public class PermissionService {

    @Transactional
    public Permission createPermission(Permission permission) {
        permission.persist();
        return permission;
    }

    public Optional<Permission> findById(Long id) {
        return Permission_.managedBlocking().findByIdOptional(id);
    }

    public List<Permission> findAll(int page, int size) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }
        PanacheBlockingQuery<Permission> query = Permission_.managedBlocking().find("tenant", tenantId);
        return query.page(page, size).list();
    }

    public long count() {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return 0;
        }
        return Permission_.managedBlocking().count("tenant", tenantId);
    }

    @Transactional
    public Permission updatePermission(Long id, Permission updatedPermission) {
        Permission existingPermission = Permission_.managedBlocking().findById(id);
        if (existingPermission != null) {
            existingPermission.code = updatedPermission.code;
            existingPermission.name = updatedPermission.name;
            existingPermission.description = updatedPermission.description;
        }
        return existingPermission;
    }

    @Transactional
    public void deletePermission(Long id) {
        Permission_.managedBlocking().deleteById(id);
    }

    public Optional<Permission> findByCode(String code) {
        return Permission_.managedBlocking().find("code", code).firstResultOptional();
    }
}