package pro.walkin.ams.graphql.security;

import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.interceptor.AroundInvoke;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;
import jakarta.persistence.EntityManager;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.exception.AuthException;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.common.security.util.SecurityUtils;

/**
 * GraphQL 安全与租户上下文拦截器
 *
 * <p>JAX-RS ContainerRequestFilter 不会对 GraphQL 请求生效（GraphQL 走 Vert.x 路由）， 因此需要通过 CDI 拦截器在 GraphQL
 * 方法执行前进行安全检查并设置租户上下文。
 *
 * <p><b>安全功能：</b>
 *
 * <ul>
 *   <li>强制要求认证：拒绝匿名用户访问任何 GraphQL 接口
 *   <li>租户验证：确保已认证用户具有有效的租户信息
 *   <li>自动启用 Hibernate 租户过滤器
 * </ul>
 *
 * <p>Priority 设置为 Interceptor.Priority.PLATFORM_BEFORE + 210，确保在 @Transactional (200) 之后运行（即在事务内部），
 * 以便访问 Hibernate Session。
 */
@TenantAware
@Interceptor
@Priority(Interceptor.Priority.PLATFORM_BEFORE + 210)
public class GraphQLTenantInterceptor {

  private static final Logger LOG = LoggerFactory.getLogger(GraphQLTenantInterceptor.class);

  @Inject SecurityIdentity securityIdentity;

  @Inject EntityManager entityManager;

  @AroundInvoke
  Object intercept(InvocationContext context) throws Exception {
    // 强制要求认证：匿名用户不允许访问 GraphQL 接口
    if (securityIdentity.isAnonymous()) {
      LOG.warn("拒绝匿名用户访问 GraphQL 接口: {}", context.getMethod().getName());
      throw new AuthException("认证失败：请先登录");
    }

    Long tenantId = null;
    try {
      tenantId = SecurityUtils.getTenantIdFromSecurityIdentity(securityIdentity);
    } catch (RuntimeException e) {
      LOG.warn("已认证用户但无法提取租户ID: {}", e.getMessage());
      throw new AuthException("认证失败：无效的租户信息");
    }

    if (tenantId == null) {
      LOG.warn("已认证用户但租户ID为空");
      throw new AuthException("认证失败：缺少租户信息");
    }

    TenantContext.setCurrentTenantId(tenantId);
    enableHibernateFilter(tenantId);

    try {
      return context.proceed();
    } finally {
      TenantContext.clear();
    }
  }

  private void enableHibernateFilter(Long tenantId) {
    try {
      Session session = entityManager.unwrap(Session.class);
      org.hibernate.Filter tenantFilter = session.getEnabledFilter("tenant-filter");
      if (tenantFilter == null) {
        session.enableFilter("tenant-filter").setParameter("tenant", tenantId);
      } else {
        tenantFilter.setParameter("tenant", tenantId);
      }
    } catch (RuntimeException e) {
      LOG.debug("跳过启用 Hibernate 租户过滤器: {}", e.getMessage());
    }
  }
}
