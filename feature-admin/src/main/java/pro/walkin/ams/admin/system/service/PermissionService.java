package pro.walkin.ams.admin.system.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;
import pro.walkin.ams.admin.system.query.RbacQuery;
import pro.walkin.ams.persistence.entity.system.*;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@ApplicationScoped
public class PermissionService {

  private static final Logger LOG = Logger.getLogger(PermissionService.class);

  @Inject RbacQuery rbacQuery;

  @Transactional
  public RolePermission grantPermissionToRole(Long roleId, Long permissionId) {
    RolePermission existing =
        rbacQuery.findRolePermissionByRoleIdAndPermissionId(roleId, permissionId).orElse(null);
    if (existing != null) {
      LOG.infof("Permission %d already granted to role %d", permissionId, roleId);
      return existing;
    }

    RolePermission rolePermission = new RolePermission();
    rolePermission.roleId = roleId;
    rolePermission.permissionId = permissionId;
    rolePermission.role = rbacQuery.findRoleById(roleId);
    rolePermission.permission = rbacQuery.findPermissionById(permissionId);
    rolePermission.persist();

    LOG.infof("Granted permission %d to role %d", permissionId, roleId);
    return rolePermission;
  }

  @Transactional
  public void revokePermissionFromRole(Long roleId, Long permissionId) {
    rbacQuery
        .findRolePermissionByRoleIdAndPermissionId(roleId, permissionId)
        .ifPresent(
            rolePermission -> {
              rolePermission.delete();
              LOG.infof("Revoked permission %d from role %d", permissionId, roleId);
            });
  }

  @Transactional
  public UserRole assignRoleToUser(Long userId, Long roleId, Long grantedBy) {
    UserRole existing = rbacQuery.findUserRoleByUserIdAndRoleId(userId, roleId).orElse(null);
    if (existing != null) {
      LOG.infof("Role %d already assigned to user %d", roleId, userId);
      return existing;
    }

    UserRole userRole = new UserRole();
    userRole.userId = userId;
    userRole.roleId = roleId;
    userRole.user = rbacQuery.getUserById(userId);
    userRole.role = rbacQuery.findRoleById(roleId);
    userRole.grantedBy = rbacQuery.getUserById(grantedBy);
    userRole.persist();

    LOG.infof("Assigned role %d to user %d by %d", roleId, userId, grantedBy);
    return userRole;
  }

  @Transactional
  public void revokeRoleFromUser(Long userId, Long roleId) {
    rbacQuery
        .findUserRoleByUserIdAndRoleId(userId, roleId)
        .ifPresent(
            existing -> {
              existing.delete();
              LOG.infof("Revoked role %d from user %d", roleId, userId);
            });
  }

  public boolean hasPermission(Long userId, String permissionCode) {
    User user = rbacQuery.getUserById(userId);
    if (user == null) {
      return false;
    }

    List<UserRole> userRoles = rbacQuery.listUserRolesByUserId(userId);
    for (UserRole userRole : userRoles) {
      Role role = rbacQuery.findRoleById(userRole.roleId);
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
    List<UserRole> userRoles = rbacQuery.listUserRolesByUserId(userId);
    return userRoles.stream()
        .map(u -> rbacQuery.findRoleById(u.roleId))
        .filter(Objects::nonNull)
        .collect(Collectors.toList());
  }

  public List<Permission> getUserPermissions(Long userId) {
    List<RolePermission> rolePermissions = rbacQuery.listRolePermissionsByUserId(userId);
    return rolePermissions.stream()
        .map(u -> rbacQuery.findPermissionById(u.permissionId))
        .filter(Objects::nonNull)
        .collect(Collectors.toList());
  }
}
