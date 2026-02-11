package pro.walkin.ams.security.util;

import io.smallrye.jwt.auth.principal.JWTCallerPrincipal;
import jakarta.ws.rs.core.SecurityContext;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
}
