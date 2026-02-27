package pro.walkin.ams.common.security.filter;

import io.smallrye.jwt.auth.principal.JWTCallerPrincipal;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.common.security.service.TokenService;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class JwtAuthFilter implements ContainerRequestFilter {

  private static final Logger LOG = Logger.getLogger(JwtAuthFilter.class);

  @Inject TokenService tokenService;

  @Override
  public void filter(ContainerRequestContext requestContext) {
    // 获取请求路径
    String path = requestContext.getUriInfo().getPath();

    // 跳过公共端点的认证
    if (isPublicEndpoint(path)) {
      return;
    }

    String authHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      requestContext.abortWith(
          Response.status(Response.Status.UNAUTHORIZED)
              .entity("{\"error\":\"Missing or invalid Authorization header\"}")
              .build());
      return;
    }

    String token = authHeader.substring(7);

    requestContext.setProperty("jwt.token", token);

    try {
      JWTCallerPrincipal principal = tokenService.validateAccessToken(token);

      Object userIdClaim = principal.getClaim("user_id");
      Object tenantIdClaim = principal.getClaim("tenant_id");

      if (userIdClaim == null || tenantIdClaim == null) {
        LOG.error("Missing required claims in token");
        requestContext.abortWith(
            Response.status(Response.Status.UNAUTHORIZED)
                .entity("{\"error\":\"Invalid token: missing claims\"}")
                .build());
        return;
      }

      Long userId = Long.valueOf(userIdClaim.toString());
      String tenantId = tenantIdClaim.toString();

      TenantContext.setCurrentTenantId(Long.valueOf(tenantId));

      final JWTCallerPrincipal finalPrincipal = principal;
      SecurityContext securityContext =
          new SecurityContext() {
            @Override
            public java.security.Principal getUserPrincipal() {
              return finalPrincipal;
            }

            @Override
            public boolean isUserInRole(String role) {
              return principal.getGroups() != null && principal.getGroups().contains(role);
            }

            @Override
            public boolean isSecure() {
              return true;
            }

            @Override
            public String getAuthenticationScheme() {
              return "Bearer";
            }
          };

      requestContext.setSecurityContext(securityContext);

    } catch (Exception e) {
      LOG.errorf("JWT validation failed: %s", e.getMessage());
      requestContext.abortWith(
          Response.status(Response.Status.UNAUTHORIZED)
              .entity("{\"error\":\"Invalid or expired token\"}")
              .build());
    }
  }

  /** 判断是否为公共端点（无需认证） */
  private boolean isPublicEndpoint(String path) {
    // 登录和注册端点不需要认证
    return path.startsWith("/api/auth/login")
        || path.startsWith("/api/auth/register")
        || path.startsWith("/api/auth/refresh")
        || path.startsWith("/health")
        || path.startsWith("/openapi")
        || path.startsWith("/q/")
        || // Quarkus管理端点
        path.equals("/");
  }
}
