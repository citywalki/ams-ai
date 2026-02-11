package pro.walkin.ams.security.filter;

import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.security.service.TokenService;
import pro.walkin.ams.security.service.RbacService;
import pro.walkin.ams.security.TenantContext;

import java.io.IOException;

/**
 * 认证过滤器
 *
 * 拦截请求并验证JWT令牌
 */
@Provider
@Priority(Priorities.AUTHENTICATION)
public class AuthenticationFilter implements ContainerRequestFilter {

    private static final Logger LOG = LoggerFactory.getLogger(AuthenticationFilter.class);

    @Inject
    TokenService tokenService;

    @Inject
    RbacService rbacService;

    private static final String AUTHENTICATION_SCHEME = "Bearer";

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        // 获取请求路径
        String path = requestContext.getUriInfo().getPath();

        // 跳过公共端点的认证
        if (isPublicEndpoint(path)) {
            return;
        }

        // 获取Authorization头
        String authorizationHeader = requestContext.getHeaderString(Constants.Auth.JWT_HEADER);

        if (authorizationHeader == null || !authorizationHeader.startsWith(AUTHENTICATION_SCHEME)) {
            LOG.warn("Missing or invalid Authorization header for path: {}", path);
            requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Authorization header required\"}")
                    .build());
            return;
        }

        // 提取JWT令牌
        String token = authorizationHeader.substring(AUTHENTICATION_SCHEME.length()).trim();

        // 验证令牌是否过期
        if (tokenService.isTokenExpired(token)) {
            LOG.warn("Expired token for path: {}", path);
            requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Token has expired\"}")
                    .build());
            return;
        }

        // 尝试验证令牌格式和内容
        try {
            tokenService.validateAccessToken(token);
        } catch (Exception e) {
            LOG.warn("Invalid token for path: {}", path, e);
            requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid token\"}")
                    .build());
            return;
        }

        // 在请求上下文中存储令牌供后续使用
        requestContext.setProperty("jwt.token", token);

        // 设置租户上下文
        try {
            var principal = tokenService.validateAccessToken(token);
            var tenantIdClaim = principal.getClaim(Constants.Auth.CLAIM_TENANT_ID);
            if (tenantIdClaim != null) {
                String tenantId = tenantIdClaim.toString();
                TenantContext.setCurrentTenant(tenantId);
            }
        } catch (Exception e) {
            LOG.warn("Failed to set tenant context from token", e);
        }
    }

    /**
     * 判断是否为公共端点（无需认证）
     */
    private boolean isPublicEndpoint(String path) {
        // 登录和注册端点不需要认证
        return path.startsWith("/api/auth/login") ||
               path.startsWith("/api/auth/register") ||
               path.startsWith("/api/auth/refresh") ||
               path.startsWith("/health") ||
               path.startsWith("/openapi") ||
               path.startsWith("/q/") || // Quarkus管理端点
               path.equals("/");
    }
}