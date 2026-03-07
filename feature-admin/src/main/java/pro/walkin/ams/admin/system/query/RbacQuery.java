package pro.walkin.ams.admin.system.query;

import jakarta.enterprise.context.ApplicationScoped;
import pro.walkin.ams.persistence.entity.system.*;

import java.util.List;
import java.util.Optional;

/**
 * RBAC权限查询类 所有角色权限相关的查询方法都放在这里
 */
@ApplicationScoped
public class RbacQuery {

  // ========== RolePermission 查询 ==========

  public Optional<RolePermission> findRolePermissionByRoleIdAndPermissionId(Long roleId, Long permissionId) {
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
}
