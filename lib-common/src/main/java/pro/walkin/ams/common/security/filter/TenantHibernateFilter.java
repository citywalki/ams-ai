package pro.walkin.ams.common.security.filter;

import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.common.security.TenantContext;

@Provider
@Priority(Priorities.AUTHENTICATION + 10)
public class TenantHibernateFilter implements ContainerRequestFilter, ContainerResponseFilter {

  private static final Logger LOG = LoggerFactory.getLogger(TenantHibernateFilter.class);

  @Inject
  EntityManager entityManager;

  @Override
  public void filter(ContainerRequestContext requestContext) {
    Long tenantId = TenantContext.getCurrentTenantId();
    if (tenantId == null) {
      tenantId = parseTenantId(requestContext.getHeaderString(Constants.Http.HEADER_TENANT_ID));
      if (tenantId != null) {
        TenantContext.setCurrentTenantId(tenantId);
      }
    }

    if (tenantId == null) {
      return;
    }

    try {
      Session session = entityManager.unwrap(Session.class);
      Filter tenantFilter = session.getEnabledFilter("tenant-filter");
      if (tenantFilter == null) {
        session.enableFilter("tenant-filter").setParameter("tenant", tenantId);
      } else {
        tenantFilter.setParameter("tenant", tenantId);
      }
    } catch (RuntimeException e) {
      LOG.debug("Skip enabling tenant filter for current request", e);
    }
  }

  @Override
  public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) {
    try {
      Session session = entityManager.unwrap(Session.class);
      if (session.getEnabledFilter("tenant-filter") != null) {
        session.disableFilter("tenant-filter");
      }
    } catch (RuntimeException e) {
      LOG.debug("Skip disabling tenant filter for current request", e);
    } finally {
      TenantContext.clear();
    }
  }

  private Long parseTenantId(String tenantIdHeader) {
    if (tenantIdHeader == null || tenantIdHeader.isBlank()) {
      return null;
    }
    try {
      return Long.valueOf(tenantIdHeader);
    } catch (NumberFormatException e) {
      LOG.warn("Ignore invalid tenant id header: {}", tenantIdHeader);
      return null;
    }
  }
}
