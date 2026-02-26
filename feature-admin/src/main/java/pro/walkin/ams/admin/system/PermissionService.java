package pro.walkin.ams.admin.system;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.security.TenantContext;

@ApplicationScoped
public class PermissionService {

    @Inject Permission.Repo permissionRepo;

    @Transactional
    public Permission createPermission(Permission permission) {
        permission.persist();
        return permission;
    }

    public Optional<Permission> findById(Long id) {
        return permissionRepo.findByIdOptional(id);
    }

    public List<Permission> findAll(int page, int size) {
        return findAll(page, size, null, null);
    }

    public List<Permission> findAll(int page, int size, String sortBy, String sortOrder) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }
        return permissionRepo.listByTenant(tenantId, sortBy, sortOrder, page, size);
    }

    public long count() {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return 0;
        }
        return permissionRepo.countByTenant(tenantId);
    }

    @Transactional
    public Permission updatePermission(Long id, Permission updatedPermission) {
        Permission existingPermission = permissionRepo.findById(id);
        if (existingPermission != null) {
            existingPermission.code = updatedPermission.code;
            existingPermission.name = updatedPermission.name;
            existingPermission.description = updatedPermission.description;
        }
        return existingPermission;
    }

    @Transactional
    public void deletePermission(Long id) {
        permissionRepo.deleteById(id);
    }

    public Optional<Permission> findByCode(String code) {
        return permissionRepo.findByCode(code);
    }
}