package pro.walkin.ams.common.security.service;

/**
 * RBAC checker interface for role and permission checks. Implemented by RbacQuery in feature-admin
 * module.
 */
public interface RbacChecker {

  /** Check if user has specific permission */
  boolean hasPermission(Long userId, String permission, Long tenantId);

  /** Check if user has any of the specified permissions */
  boolean hasAnyPermission(Long userId, String[] permissions, Long tenantId);

  /** Check if user has all of the specified permissions */
  boolean hasAllPermissions(Long userId, String[] permissions, Long tenantId);

  /** Check if user has specific role */
  boolean hasRole(Long userId, String role, Long tenantId);
}
