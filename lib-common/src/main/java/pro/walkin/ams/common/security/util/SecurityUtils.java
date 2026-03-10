package pro.walkin.ams.common.security.util;

import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.jwt.auth.principal.JWTCallerPrincipal;
import jakarta.ws.rs.core.SecurityContext;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.Principal;

/** 安全相关工具类 */
public final class SecurityUtils {

  private static final Logger LOG = LoggerFactory.getLogger(SecurityUtils.class);

  private SecurityUtils() {
    // 工具类，防止实例化
  }

  /**
   * 从 SecurityContext 中提取用户 ID
   *
   * @param securityContext JAX-RS 安全上下文
   * @return 用户 ID
   * @throws RuntimeException 如果无法提取用户ID
   */
  public static Long getUserIdFromSecurityContext(SecurityContext securityContext) {
    if (securityContext != null && securityContext.getUserPrincipal() != null) {
      Object principal = securityContext.getUserPrincipal();

      if (principal instanceof JsonWebToken) {
        JsonWebToken jwt = (JsonWebToken) principal;
        Object userIdClaim = jwt.getClaim("user_id");
        if (userIdClaim != null) {
          try {
            return Long.valueOf(userIdClaim.toString());
          } catch (NumberFormatException e) {
            LOG.error("Invalid user_id claim: {}", userIdClaim, e);
          }
        }
        if (jwt.getSubject() != null) {
          try {
            return Long.parseLong(jwt.getSubject());
          } catch (NumberFormatException e) {
            LOG.error("Invalid subject as user ID: {}", jwt.getSubject(), e);
          }
        }
      }

      if (principal instanceof JWTCallerPrincipal) {
        JWTCallerPrincipal jwtPrincipal = (JWTCallerPrincipal) principal;
        Object userIdClaim = jwtPrincipal.getClaim("user_id");
        if (userIdClaim != null) {
          try {
            return Long.valueOf(userIdClaim.toString());
          } catch (NumberFormatException e) {
            LOG.error("Invalid user_id claim: {}", userIdClaim, e);
          }
        }
      }
    }
    throw new RuntimeException("Unable to extract user ID from security context");
  }

  /**
   * 从 SecurityIdentity 中提取用户 ID
   *
   * @param securityIdentity Quarkus SecurityIdentity
   * @return 用户 ID
   * @throws RuntimeException 如果无法提取用户ID
   */
  public static Long getUserIdFromSecurityIdentity(SecurityIdentity securityIdentity) {
    if (securityIdentity == null) {
      LOG.warn("SecurityIdentity is null - user may not be authenticated");
      throw new RuntimeException(
          "Unable to extract user ID from security identity: identity is null");
    }

    Principal principal = securityIdentity.getPrincipal();
    if (principal == null) {
      LOG.warn("Principal is null in SecurityIdentity - user may not be authenticated");
      throw new RuntimeException(
          "Unable to extract user ID from security identity: principal is null");
    }

    LOG.debug("Principal type: {}, name: {}", principal.getClass().getName(), principal.getName());

    if (principal instanceof JsonWebToken jwt) {
      Object userIdClaim = jwt.getClaim("user_id");
      if (userIdClaim != null) {
        try {
          return Long.valueOf(userIdClaim.toString());
        } catch (NumberFormatException e) {
          LOG.error("Invalid user_id claim: {}", userIdClaim, e);
        }
      }
      if (jwt.getSubject() != null) {
        try {
          return Long.parseLong(jwt.getSubject());
        } catch (NumberFormatException e) {
          LOG.error("Invalid subject as user ID: {}", jwt.getSubject(), e);
        }
      }
    }

    if (principal instanceof JWTCallerPrincipal jwtPrincipal) {
      Object userIdClaim = jwtPrincipal.getClaim("user_id");
      if (userIdClaim != null) {
        try {
          return Long.valueOf(userIdClaim.toString());
        } catch (NumberFormatException e) {
          LOG.error("Invalid user_id claim: {}", userIdClaim, e);
        }
      }
    }

    LOG.error(
        "Unable to extract user ID from principal of type: {}. "
            + "Expected JsonWebToken or JWTCallerPrincipal. Principal name: {}",
        principal.getClass().getName(),
        principal.getName());
    throw new RuntimeException(
        "Unable to extract user ID from security identity: "
            + "unsupported principal type "
            + principal.getClass().getName());
  }

  /**
   * 从 SecurityIdentity 中提取租户 ID
   *
   * @param securityIdentity Quarkus SecurityIdentity
   * @return 租户 ID
   * @throws RuntimeException 如果无法提取租户ID
   */
  public static Long getTenantIdFromSecurityIdentity(SecurityIdentity securityIdentity) {
    if (securityIdentity != null && securityIdentity.getPrincipal() != null) {
      Principal principal = securityIdentity.getPrincipal();

      if (principal instanceof JsonWebToken jwt) {
        Object tenantIdClaim = jwt.getClaim("tenant_id");
        if (tenantIdClaim != null) {
          try {
            return Long.valueOf(tenantIdClaim.toString());
          } catch (NumberFormatException e) {
            LOG.error("Invalid tenant_id claim: {}", tenantIdClaim, e);
          }
        }
      }

      if (principal instanceof JWTCallerPrincipal jwtPrincipal) {
        Object tenantIdClaim = jwtPrincipal.getClaim("tenant_id");
        if (tenantIdClaim != null) {
          try {
            return Long.valueOf(tenantIdClaim.toString());
          } catch (NumberFormatException e) {
            LOG.error("Invalid tenant_id claim: {}", tenantIdClaim, e);
          }
        }
      }
    }
    throw new RuntimeException("Unable to extract tenant ID from security identity");
  }
}
