package pro.walkin.ams.common.security.service;

/**
 * RBAC service interface for role and permission checks. Implementation is provided by
 * feature-admin module.
 */
public interface RbacService {

  /** Check if user has specific permission */
  boolean hasPermission(String token, String permission);

  /** Check if user has any of the specified permissions */
  boolean hasAnyPermission(String token, String[] permissions);

  /** Check if user has all of the specified permissions */
  boolean hasAllPermissions(String token, String[] permissions);

  /** Check if user has specific role */
  boolean hasRole(String token, String role);
}
