package pro.walkin.ams.admin.system.query;

import jakarta.enterprise.context.ApplicationScoped;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.security.service.RbacChecker;
import pro.walkin.ams.persistence.entity.system.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/** RBAC权限查询类 所有角色权限相关的查询方法都放在这里 */
@ApplicationScoped
public class RbacQuery implements RbacChecker {
  private static final Logger LOG = LoggerFactory.getLogger(RbacQuery.class);

  // ========== RolePermission 查询 ==========

  public Optional<RolePermission> findRolePermissionByRoleIdAndPermissionId(
      Long roleId, Long permissionId) {
    return RolePermission_.managedBlocking()
        .find("roleId = ?1 and permissionId = ?2", roleId, permissionId)
        .firstResultOptional();
  }

  public List<RolePermission> listRolePermissionsByUserId(Long userId) {
    return RolePermission_.repo().listOfUser(userId);
  }

  // ========== UserRole 查询 ==========

  public Optional<UserRole> findUserRoleByUserIdAndRoleId(Long userId, Long roleId) {
    return UserRole_.repo().findByUserIdAndRoleId(userId, roleId);
  }

  public List<UserRole> listUserRolesByUserId(Long userId) {
    return UserRole_.repo().listByUserId(userId);
  }

  // ========== User 查询 ==========

  public Optional<User> findUserById(Long userId) {
    return User_.managedBlocking().findByIdOptional(userId);
  }

  public User getUserById(Long userId) {
    return User_.managedBlocking().findById(userId);
  }

  // ========== Role 查询 ==========

  public Role findRoleById(Long roleId) {
    return Role_.managedBlocking().findById(roleId);
  }

  public Optional<Role> findRoleByIdOptional(Long roleId) {
    return Role_.managedBlocking().findByIdOptional(roleId);
  }

  // ========== Permission 查询 ==========

  public Permission findPermissionById(Long permissionId) {
    return Permission_.managedBlocking().findById(permissionId);
  }

  public Optional<Permission> findPermissionByIdOptional(Long permissionId) {
    return Permission_.managedBlocking().findByIdOptional(permissionId);
  }

  // ========== 用户角色和权限查询（从 RbacService 迁移） ==========

  /**
   * 获取用户的所有角色编码
   *
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @return 角色编码集合
   */
  public Set<String> getUserRoles(Long userId, Long tenantId) {
    LOG.debug("Fetching roles from database for user {} in tenant {}", userId, tenantId);

    if (userId == null || tenantId == null) {
      LOG.warn("Invalid parameters: userId={}, tenantId={}", userId, tenantId);
      return Set.of();
    }

    Optional<User> userOpt = findUserById(userId);
    if (userOpt.isEmpty()) {
      LOG.warn("User {} not found", userId);
      return Set.of();
    }

    User user = userOpt.get();
    if (!tenantId.equals(user.tenant)) {
      LOG.warn("User {} does not belong to tenant {}", userId, tenantId);
      return Set.of();
    }

    List<UserRole> userRoles = listUserRolesByUserId(userId);
    Set<String> roles = new HashSet<>();
    for (UserRole userRole : userRoles) {
      if (userRole.role != null && tenantId.equals(userRole.role.tenant)) {
        roles.add(userRole.role.code);
      }
    }

    LOG.debug("Found {} roles for user {} in tenant {}", roles.size(), userId, tenantId);
    return roles;
  }

  /**
   * 获取用户的所有权限编码
   *
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @return 权限编码集合
   */
  public Set<String> getUserPermissions(Long userId, Long tenantId) {
    LOG.debug("Fetching permissions from database for user {} in tenant {}", userId, tenantId);

    if (userId == null || tenantId == null) {
      LOG.warn("Invalid parameters: userId={}, tenantId={}", userId, tenantId);
      return Set.of();
    }

    Optional<User> userOpt = findUserById(userId);
    if (userOpt.isEmpty()) {
      LOG.warn("User {} not found", userId);
      return Set.of();
    }

    User user = userOpt.get();
    if (!tenantId.equals(user.tenant)) {
      LOG.warn("User {} does not belong to tenant {}", userId, tenantId);
      return Set.of();
    }

    List<RolePermission> rolePermissions = listRolePermissionsByUserId(userId);
    Set<String> permissions = new HashSet<>();
    for (RolePermission rp : rolePermissions) {
      if (rp.permission != null && rp.role != null && tenantId.equals(rp.role.tenant)) {
        permissions.add(rp.permission.code);
      }
    }

    LOG.debug(
        "Found {} permissions for user {} in tenant {}", permissions.size(), userId, tenantId);
    return permissions;
  }

  // ========== RbacChecker 接口实现 ==========

  @Override
  public boolean hasPermission(Long userId, String permission, Long tenantId) {
    if (userId == null || permission == null || tenantId == null) {
      return false;
    }
    return getUserPermissions(userId, tenantId).contains(permission);
  }

  @Override
  public boolean hasAnyPermission(Long userId, String[] permissions, Long tenantId) {
    if (permissions == null || permissions.length == 0) {
      return false;
    }
    Set<String> userPermissions = getUserPermissions(userId, tenantId);
    for (String perm : permissions) {
      if (userPermissions.contains(perm)) {
        return true;
      }
    }
    return false;
  }

  @Override
  public boolean hasAllPermissions(Long userId, String[] permissions, Long tenantId) {
    if (permissions == null || permissions.length == 0) {
      return true;
    }
    return getUserPermissions(userId, tenantId).containsAll(Set.of(permissions));
  }

  @Override
  public boolean hasRole(Long userId, String role, Long tenantId) {
    if (userId == null || role == null || tenantId == null) {
      return false;
    }
    return getUserRoles(userId, tenantId).contains(role);
  }
}
