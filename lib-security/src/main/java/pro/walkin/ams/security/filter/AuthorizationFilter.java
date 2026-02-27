package pro.walkin.ams.security.filter;

import jakarta.annotation.Priority;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ResourceInfo;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;
import java.lang.reflect.Method;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.security.annotation.RequirePermission;
import pro.walkin.ams.common.security.annotation.RequirePermissions;
import pro.walkin.ams.common.security.annotation.RequireRole;
import pro.walkin.ams.security.service.RbacService;

/**
 * 授权过滤器
 *
 * <p>检查用户是否具有访问受保护资源所需的权限
 */
@Provider
@Priority(Priorities.AUTHORIZATION)
public class AuthorizationFilter implements ContainerRequestFilter {

  private static final Logger LOG = LoggerFactory.getLogger(AuthorizationFilter.class);

  @Inject RbacService rbacService;

  @Context ResourceInfo resourceInfo;

  @Override
  public void filter(ContainerRequestContext requestContext) throws IOException {
    // 检查当前资源是否标记了@PermitAll注解
    if (isPermittedWithoutAuthorization()) {
      return;
    }

    // 获取JWT令牌
    String token = (String) requestContext.getProperty("jwt.token");
    if (token == null) {
      LOG.warn("No JWT token in request context for authorization check");
      requestContext.abortWith(
          Response.status(Response.Status.UNAUTHORIZED)
              .entity("{\"error\":\"Authentication required for authorization check\"}")
              .build());
      return;
    }

    // 检查@RequirePermission注解
    if (hasRequirePermissionAnnotation()) {
      RequirePermission annotation = getRequirePermissionAnnotation();
      if (!rbacService.hasPermission(token, annotation.value())) {
        LOG.warn("Access denied: User does not have required permission: {}", annotation.value());
        requestContext.abortWith(
            Response.status(Response.Status.FORBIDDEN)
                .entity("{\"error\":\"Insufficient permissions\"}")
                .build());
        return;
      }
    }

    // 检查@RequireRole注解
    if (hasRequireRoleAnnotation()) {
      RequireRole annotation = getRequireRoleAnnotation();
      String[] requiredRoles = annotation.value();
      boolean hasRole =
          Arrays.stream(requiredRoles).anyMatch(role -> rbacService.hasRole(token, role));

      if (!hasRole) {
        LOG.warn(
            "Access denied: User does not have required role: {}", String.join(",", requiredRoles));
        requestContext.abortWith(
            Response.status(Response.Status.FORBIDDEN)
                .entity("{\"error\":\"Insufficient role\"}")
                .build());
        return;
      }
    }

    // 检查@RequirePermissions注解
    if (hasRequirePermissionsAnnotation()) {
      RequirePermissions annotation = getRequirePermissionsAnnotation();
      boolean hasPermission =
          switch (annotation.operator()) {
            case ALL -> rbacService.hasAllPermissions(token, annotation.value());
            case ANY -> rbacService.hasAnyPermission(token, annotation.value());
          };

      if (!hasPermission) {
        LOG.warn(
            "Access denied: User does not satisfy required permissions: {}",
            String.join(",", annotation.value()));
        requestContext.abortWith(
            Response.status(Response.Status.FORBIDDEN)
                .entity("{\"error\":\"Insufficient permissions\"}")
                .build());
        return;
      }
    }

    // 如果没有任何权限注解，可以根据配置决定是否拒绝访问
    // 在这里我们可以有一个默认策略，比如没有显式授权注解的资源需要基本的身份验证
  }

  /** 检查资源是否标记了@PermitAll注解 */
  private boolean isPermittedWithoutAuthorization() {
    Method method = resourceInfo.getResourceMethod();
    Class<?> resourceClass = resourceInfo.getResourceClass();

    return method != null
        && (method.isAnnotationPresent(PermitAll.class)
            || resourceClass.isAnnotationPresent(PermitAll.class));
  }

  /** 检查资源是否标记了@RequirePermission注解 */
  private boolean hasRequirePermissionAnnotation() {
    Method method = resourceInfo.getResourceMethod();
    Class<?> resourceClass = resourceInfo.getResourceClass();

    return method != null
        && (method.isAnnotationPresent(RequirePermission.class)
            || resourceClass.isAnnotationPresent(RequirePermission.class));
  }

  /** 检查资源是否标记了@RequirePermissions注解 */
  private boolean hasRequirePermissionsAnnotation() {
    Method method = resourceInfo.getResourceMethod();
    Class<?> resourceClass = resourceInfo.getResourceClass();

    return method != null
        && (method.isAnnotationPresent(RequirePermissions.class)
            || resourceClass.isAnnotationPresent(RequirePermissions.class));
  }

  /** 检查资源是否标记了@RequireRole注解 */
  private boolean hasRequireRoleAnnotation() {
    Method method = resourceInfo.getResourceMethod();
    Class<?> resourceClass = resourceInfo.getResourceClass();

    return method != null
        && (method.isAnnotationPresent(RequireRole.class)
            || resourceClass.isAnnotationPresent(RequireRole.class));
  }

  /** 获取@RequirePermission注解 */
  private RequirePermission getRequirePermissionAnnotation() {
    Method method = resourceInfo.getResourceMethod();

    if (method.isAnnotationPresent(RequirePermission.class)) {
      return method.getAnnotation(RequirePermission.class);
    }

    Class<?> resourceClass = resourceInfo.getResourceClass();
    if (resourceClass.isAnnotationPresent(RequirePermission.class)) {
      return resourceClass.getAnnotation(RequirePermission.class);
    }

    return null;
  }

  /** 获取@RequirePermissions注解 */
  private RequirePermissions getRequirePermissionsAnnotation() {
    Method method = resourceInfo.getResourceMethod();

    if (method.isAnnotationPresent(RequirePermissions.class)) {
      return method.getAnnotation(RequirePermissions.class);
    }

    Class<?> resourceClass = resourceInfo.getResourceClass();
    if (resourceClass.isAnnotationPresent(RequirePermissions.class)) {
      return resourceClass.getAnnotation(RequirePermissions.class);
    }

    return null;
  }

  /** 获取@RequireRole注解 */
  private RequireRole getRequireRoleAnnotation() {
    Method method = resourceInfo.getResourceMethod();

    if (method.isAnnotationPresent(RequireRole.class)) {
      return method.getAnnotation(RequireRole.class);
    }

    Class<?> resourceClass = resourceInfo.getResourceClass();
    if (resourceClass.isAnnotationPresent(RequireRole.class)) {
      return resourceClass.getAnnotation(RequireRole.class);
    }

    return null;
  }
}
