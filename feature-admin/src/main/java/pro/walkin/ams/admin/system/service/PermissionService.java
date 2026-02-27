package pro.walkin.ams.admin.system.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;
import pro.walkin.ams.persistence.entity.system.*;

@ApplicationScoped
public class PermissionService {

  private static final Logger LOG = Logger.getLogger(PermissionService.class);

  @Transactional
  public RolePermission grantPermissionToRole(Long roleId, Long permissionId) {
    RolePermission existing =
        RolePermission_.managedBlocking()
            .find("roleId = ?1 and permissionId = ?2", roleId, permissionId)
            .firstResult();
    if (existing != null) {
      LOG.infof("Permission %d already granted to role %d", permissionId, roleId);
      return existing;
    }

    RolePermission rolePermission = new RolePermission();
    rolePermission.roleId = roleId;
    rolePermission.permissionId = permissionId;
    rolePermission.role = Role_.managedBlocking().findById(roleId);
    rolePermission.permission = Permission_.managedBlocking().findById(permissionId);
    rolePermission.persist();

    LOG.infof("Granted permission %d to role %d", permissionId, roleId);
    return rolePermission;
  }

  @Transactional
  public void revokePermissionFromRole(Long roleId, Long permissionId) {
    RolePermission rolePermission =
        RolePermission_.managedBlocking()
            .find("roleId = ?1 and permissionId = ?2", roleId, permissionId)
            .firstResult();
    if (rolePermission != null) {
      rolePermission.delete();
      LOG.infof("Revoked permission %d from role %d", permissionId, roleId);
    }
  }

  @Transactional
  public UserRole assignRoleToUser(Long userId, Long roleId, Long grantedBy) {
    UserRole existing =
        UserRole_.managedBlocking()
            .find("userId = ?1 and roleId = ?2", userId, roleId)
            .firstResult();
    if (existing != null) {
      LOG.infof("Role %d already assigned to user %d", roleId, userId);
      return existing;
    }

    UserRole userRole = new UserRole();
    userRole.userId = userId;
    userRole.roleId = roleId;
    userRole.user = User_.managedBlocking().findById(userId);
    userRole.role = Role_.managedBlocking().findById(roleId);
    userRole.grantedBy = User_.managedBlocking().findById(grantedBy);
    userRole.persist();

    LOG.infof("Assigned role %d to user %d by %d", roleId, userId, grantedBy);
    return userRole;
  }

  @Transactional
  public void revokeRoleFromUser(Long userId, Long roleId) {
    UserRole_.repo()
        .findByUserIdAndRoleId(userId, roleId)
        .ifPresent(
            existing -> {
              existing.delete();
              LOG.infof("Revoked role %d from user %d", roleId, userId);
            });
  }

  public boolean hasPermission(Long userId, String permissionCode) {
    User user = User_.managedBlocking().findById(userId);
    if (user == null) {
      return false;
    }

    List<UserRole> userRoles = UserRole_.repo().listByUserId(userId);
    for (UserRole userRole : userRoles) {
      Role role = Role_.managedBlocking().findById(userRole.roleId);
      if (role != null && role.permissions != null) {
        for (Permission permission : role.permissions) {
          if (permission.code.equals(permissionCode)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  public List<Role> getUserRoles(Long userId) {
    List<UserRole> userRoles = UserRole_.repo().listByUserId(userId);
    return userRoles.stream()
        .map(u -> Role_.managedBlocking().findById(u.roleId))
        .filter(Objects::nonNull)
        .collect(Collectors.toList());
  }

  public List<Permission> getUserPermissions(Long userId) {
    List<RolePermission> rolePermissions = RolePermission_.repo().listOfUser(userId);
    return rolePermissions.stream()
        .map(u -> (Permission) Permission_.managedBlocking().findById(u.permissionId))
        .filter(Objects::nonNull)
        .collect(Collectors.toList());
  }
}
