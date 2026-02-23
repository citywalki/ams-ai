package pro.walkin.ams.admin.system;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.security.TenantContext;

@ApplicationScoped
public class RoleService {

    @Inject Role.Repo roleRepo;
    @Inject Permission.Repo permissionRepo;

    @Transactional
    public Role createRole(Role role) {
        role.persist();
        return role;
    }

    public Optional<Role> findById(Long id) {
        return roleRepo.findByIdOptional(id);
    }

    public List<Role> findAll(int page, int size) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }
        return roleRepo.listByTenant(tenantId, page, size);
    }

    public long count() {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return 0;
        }
        return roleRepo.countByTenant(tenantId);
    }

    @Transactional
    public Role updateRole(Long id, Role updatedRole) {
        Role existingRole = roleRepo.findById(id);
        if (existingRole != null) {
            existingRole.code = updatedRole.code;
            existingRole.name = updatedRole.name;
            existingRole.description = updatedRole.description;
            existingRole.updatedAt = java.time.Instant.now();
        }
        return existingRole;
    }

    @Transactional
    public void deleteRole(Long id) {
        roleRepo.deleteById(id);
    }

    public Optional<Role> findByCode(String code) {
        return roleRepo.findByCode(code);
    }

    @Transactional
    public boolean addPermissionToRole(Long roleId, Long permissionId) {
        Role role = roleRepo.findById(roleId);
        Permission permission = permissionRepo.findById(permissionId);

        if (role != null && permission != null) {
            if (role.permissions == null) {
                role.permissions = new HashSet<>();
            }
            boolean exists = role.permissions.stream()
                .anyMatch(p -> p.id != null && p.id.equals(permissionId));

            if (!exists) {
                role.permissions.add(permission);
                role.updatedAt = java.time.Instant.now();
                return true;
            }
        }
        return false;
    }

    @Transactional
    public boolean removePermissionFromRole(Long roleId, Long permissionId) {
        Role role = roleRepo.findById(roleId);
        if (role != null && role.permissions != null) {
            boolean removed = role.permissions.removeIf(p -> p.id != null && p.id.equals(permissionId));
            if (removed) {
                role.updatedAt = java.time.Instant.now();
            }
            return removed;
        }
        return false;
    }

    public List<Permission> getRolePermissions(Long roleId) {
        Role role = roleRepo.findById(roleId);
        if (role != null && role.permissions != null) {
            return new java.util.ArrayList<>(role.permissions);
        }
        return List.of();
    }
}
