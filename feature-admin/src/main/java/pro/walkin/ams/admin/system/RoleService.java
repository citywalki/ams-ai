package pro.walkin.ams.admin.system;

import io.quarkus.hibernate.panache.blocking.PanacheBlockingQuery;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import pro.walkin.ams.persistence.entity.system.*;

@ApplicationScoped
public class RoleService {

    @Transactional
    public Role createRole(Role role) {
        role.persist();
        return role;
    }

    public Optional<Role> findById(Long id) {
        return Role_.managedBlocking().findByIdOptional(id);
    }

    public List<Role> findAll(int page, int size) {
        PanacheBlockingQuery<Role> query = Role_.managedBlocking().findAll();
        return query.page(page, size).list();
    }

    public long count() {
        return Role_.managedBlocking().count();
    }

    @Transactional
    public Role updateRole(Long id, Role updatedRole) {
        Role existingRole = Role_.managedBlocking().findById(id);
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
        Role_.managedBlocking().deleteById(id);
    }

    public Optional<Role> findByCode(String code) {
        return Role_.managedBlocking().find("code", code).firstResultOptional();
    }

    @Transactional
    public boolean addPermissionToRole(Long roleId, Long permissionId) {
        Role role = Role_.managedBlocking().findById(roleId);
        Permission permission = Permission_.managedBlocking().findById(permissionId);

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
        Role role = Role_.managedBlocking().findById(roleId);
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
        Role role = Role_.managedBlocking().findById(roleId);
        if (role != null && role.permissions != null) {
            return new java.util.ArrayList<>(role.permissions);
        }
        return List.of();
    }
}
