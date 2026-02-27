package pro.walkin.ams.admin.system;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import pro.walkin.ams.common.exception.BusinessException;
import pro.walkin.ams.persistence.entity.system.Menu;
import pro.walkin.ams.persistence.entity.system.Menu_;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.User;
import pro.walkin.ams.common.security.TenantContext;

@ApplicationScoped
public class RoleService {

    @Inject Role.Repo roleRepo;
    @Inject Permission.Repo permissionRepo;
    @Inject User.Repo userRepo;
    @Inject Menu.Repo menuRepo;

    @Transactional
    public Role createRole(Role role) {
        Long tenantId = role.tenant != null ? role.tenant : TenantContext.getCurrentTenantId();
        Optional<Role> existingRole = roleRepo.findByCode(role.code);
        if (existingRole.isPresent() && tenantId != null && tenantId.equals(existingRole.get().tenant)) {
            throw new BusinessException("Role code already exists in current tenant");
        }
        if (role.tenant == null) {
            role.tenant = tenantId;
        }
        roleRepo.persist(role);
        return role;
    }

    public Optional<Role> findById(Long id) {
        return roleRepo.findByIdOptional(id);
    }

    public List<Role> findAll(int page, int size) {
        return findAll(page, size, null, null, null);
    }

    public List<Role> findAll(int page, int size, String keyword) {
        return findAll(page, size, keyword, null, null);
    }

    public List<Role> findAll(int page, int size, String keyword, String sortBy, String sortOrder) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }
        return roleRepo.listByTenantAndKeyword(tenantId, keyword, sortBy, sortOrder, page, size);
    }

    public long count() {
        return count(null);
    }

    public long count(String keyword) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return 0;
        }
        return roleRepo.countByTenantAndKeyword(tenantId, keyword);
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
        long assignedUserCount = userRepo.count("select count(u) from User u join u.roles r where r.id = ?1", id);
        if (assignedUserCount > 0) {
            throw new BusinessException("Role is assigned to users and cannot be deleted");
        }
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

    @Transactional
    public void assignPermissions(Long roleId, List<Long> permissionIds) {
        Role role = roleRepo.findById(roleId);
        if (role == null) {
            return;
        }

        role.permissions.clear();
        if (permissionIds == null || permissionIds.isEmpty()) {
            role.updatedAt = java.time.Instant.now();
            return;
        }

        for (Long permissionId : permissionIds) {
            Permission permission = permissionRepo.findById(permissionId);
            if (permission != null) {
                role.permissions.add(permission);
            }
        }
        role.updatedAt = java.time.Instant.now();
    }

    public List<Long> getRoleMenus(Long roleId) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }

        Role role = roleRepo.findById(roleId);
        if (role == null) {
            return List.of();
        }

        List<Menu> menus = Menu_.managedBlocking().find("tenant = ?1", tenantId).list();
        return menus.stream()
            .filter(menu -> menu.rolesAllowed != null && menu.rolesAllowed.contains(role.code))
            .map(menu -> menu.id)
            .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void updateRoleMenus(Long roleId, List<Long> menuIds) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new BusinessException("租户上下文不存在");
        }

        Role role = roleRepo.findById(roleId);
        if (role == null) {
            throw new BusinessException("角色不存在");
        }

        Set<Long> newMenuIdSet = new HashSet<>(menuIds != null ? menuIds : List.of());

        List<Menu> allMenus = Menu_.managedBlocking().find("tenant = ?1", tenantId).list();

        for (Menu menu : allMenus) {
            boolean shouldBeAllowed = newMenuIdSet.contains(menu.id);
            boolean isCurrentlyAllowed = menu.rolesAllowed != null && menu.rolesAllowed.contains(role.code);

            if (shouldBeAllowed != isCurrentlyAllowed) {
                List<String> newRolesAllowed = new java.util.ArrayList<>(menu.rolesAllowed != null ? menu.rolesAllowed : List.of());
                if (shouldBeAllowed) {
                    if (!newRolesAllowed.contains(role.code)) {
                        newRolesAllowed.add(role.code);
                    }
                } else {
                    newRolesAllowed.remove(role.code);
                }
                menu.rolesAllowed = newRolesAllowed;
                menu.persist();
            }
        }
    }
}
