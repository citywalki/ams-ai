package pro.walkin.ams.admin.system.service;

import io.quarkus.cache.Cache;
import io.quarkus.cache.CacheName;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.persistence.entity.system.RolePermission;
import pro.walkin.ams.persistence.entity.system.User;
import pro.walkin.ams.persistence.entity.system.UserRole;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.admin.auth.service.TokenService;

@ApplicationScoped
@Transactional
public class RbacService implements pro.walkin.ams.common.security.service.RbacService {
    private static final Logger LOG = LoggerFactory.getLogger(RbacService.class);
    private static final String USER_PERMISSIONS_CACHE = "user-permissions";

    @Inject
    @CacheName(USER_PERMISSIONS_CACHE)
    Cache cache;

    @Inject
    TokenService tokenService;

    @Inject
    User.Repo userRepo;

    @Inject
    UserRole.Repo userRoleRepo;

    @Inject
    RolePermission.Repo rolePermissionRepo;

    public boolean hasPermission(Long userId, String permission) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            LOG.warn("No tenant context available for permission check");
            return false;
        }
        return hasPermission(userId, permission, tenantId);
    }

    public boolean hasRole(Long userId, String role) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            LOG.warn("No tenant context available for role check");
      return false;
    }
    return hasRole(userId, role, tenantId);
  }

  public boolean hasRole(String token, String role) {
    Long userId = tokenService.getUserIdFromToken(token);
    Long tenantId = getTenantIdFromToken(token);
    if (userId == null || tenantId == null) {
      LOG.warn("Cannot extract user or tenant from token");
            return false;
        }
        return hasRole(userId, role, tenantId);
    }

    public boolean hasPermission(String token, String permission) {
        Long userId = tokenService.getUserIdFromToken(token);
        Long tenantId = getTenantIdFromToken(token);
        if (userId == null || tenantId == null) {
            LOG.warn("Cannot extract user or tenant from token");
            return false;
        }
        return hasPermission(userId, permission, tenantId);
    }

    public boolean hasAllPermissions(String token, String[] permissions) {
        Long userId = tokenService.getUserIdFromToken(token);
        Long tenantId = getTenantIdFromToken(token);
        if (userId == null || tenantId == null) {
            LOG.warn("Cannot extract user or tenant from token");
            return false;
        }
        return hasAllPermissions(userId, List.of(permissions), tenantId);
    }

    public boolean hasAnyPermission(String token, String[] permissions) {
        Long userId = tokenService.getUserIdFromToken(token);
        Long tenantId = getTenantIdFromToken(token);
        if (userId == null || tenantId == null) {
            LOG.warn("Cannot extract user or tenant from token");
            return false;
        }
        return hasAnyPermission(userId, List.of(permissions), tenantId);
    }

    public boolean hasPermission(Long userId, String permission, Long tenantId) {
        if (userId == null || permission == null || tenantId == null) {
            LOG.warn("Invalid parameters: userId={}, permission={}, tenantId={}", userId, permission, tenantId);
            return false;
        }
        Set<String> userPermissions = getUserPermissions(userId, tenantId);
        return userPermissions.contains(permission);
    }

    public boolean hasAllPermissions(Long userId, List<String> permissions, Long tenantId) {
        if (permissions == null || permissions.isEmpty()) {
            return true;
        }
        Set<String> userPermissions = getUserPermissions(userId, tenantId);
        return userPermissions.containsAll(permissions);
    }

    public boolean hasAnyPermission(Long userId, List<String> permissions, Long tenantId) {
        if (permissions == null || permissions.isEmpty()) {
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

    public boolean hasRole(Long userId, String role, Long tenantId) {
        if (userId == null || role == null || tenantId == null) {
            return false;
        }
        List<UserRole> userRoles = userRoleRepo.listByUserId(userId);
        for (UserRole userRole : userRoles) {
            if (userRole.role != null && role.equals(userRole.role.code) && tenantId.equals(userRole.role.tenant)) {
                return true;
            }
        }
        return false;
    }

  public boolean hasAnyRole(Long userId, String[] roles, Long tenantId) {
    if (roles == null || roles.length == 0) {
      return false;
    }
    Set<String> userRoles = getUserRoles(userId, tenantId);
    for (String role : roles) {
      if (userRoles.contains(role)) {
        return true;
      }
    }
    return false;
  }

  public Set<String> getUserRoles(Long userId, Long tenantId) {
    LOG.debug("Fetching roles from database for user {} in tenant {}", userId, tenantId);
    Optional<User> userOpt = userRepo.findByIdOptional(userId);
    if (userOpt.isEmpty()) {
      LOG.warn("User {} not found", userId);
      return Set.of();
    }
    User user = userOpt.get();
    if (!tenantId.equals(user.tenant)) {
      LOG.warn("User {} does not belong to tenant {}", userId, tenantId);
      return Set.of();
    }
    List<UserRole> userRoles = userRoleRepo.listByUserId(userId);
    Set<String> roles = new HashSet<>();
    for (UserRole userRole : userRoles) {
      if (userRole.role != null && tenantId.equals(userRole.role.tenant)) {
        roles.add(userRole.role.code);
      }
    }
    LOG.debug("Found {} roles for user {} in tenant {}", roles.size(), userId, tenantId);
    return roles;
  }

    public Set<String> getUserPermissions(Long userId, Long tenantId) {
        String cacheKey = userId + ":" + tenantId;
        Uni<Set<String>> uni = cache.get(cacheKey, key -> {
            LOG.debug("Fetching permissions from database for user {} in tenant {}", userId, tenantId);
            Optional<User> userOpt = userRepo.findByIdOptional(userId);
            if (userOpt.isEmpty()) {
                LOG.warn("User {} not found", userId);
                return Set.of();
            }
            User user = userOpt.get();
            if (!tenantId.equals(user.tenant)) {
                LOG.warn("User {} does not belong to tenant {}", userId, tenantId);
                return Set.of();
            }
            List<RolePermission> rolePermissions = rolePermissionRepo.listOfUser(userId);
            Set<String> permissions = new HashSet<>();
            for (RolePermission rp : rolePermissions) {
                if (rp.permission != null && tenantId.equals(rp.role.tenant)) {
                    permissions.add(rp.permission.code);
                }
            }
            LOG.debug("Found {} permissions for user {} in tenant {}", permissions.size(), userId, tenantId);
            return permissions;
        });
        return uni.await().indefinitely();
    }

    public void invalidateUserPermissions(Long userId, Long tenantId) {
        String cacheKey = userId + ":" + tenantId;
        cache.invalidate(cacheKey).await().indefinitely();
        LOG.debug("Invalidated permissions cache for user {} in tenant {}", userId, tenantId);
    }

    public void invalidatePermissionsByRole(Long roleId) {
        cache.invalidateAll().await().indefinitely();
        LOG.debug("Invalidated all permissions cache due to role {} permission change", roleId);
    }

    private Long getTenantIdFromToken(String token) {
    try {
      var principal = tokenService.validateAccessToken(token);
      if (principal == null) {
        return null;
      }
      var tenantIdClaim = principal.getClaim("tenant_id");
      return tenantIdClaim != null ? Long.valueOf(tenantIdClaim.toString()) : null;
    } catch (Exception e) {
      LOG.warn("Failed to extract tenant_id from token", e);
      return null;
    }
  }
}
