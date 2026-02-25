package pro.walkin.ams.boot;

import jakarta.annotation.security.PermitAll;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.stream.Collectors;

@Path("/q/test/tenant-role-codes")
@ApplicationScoped
@PermitAll
public class TenantRoleProbeResource {

  @Inject
  EntityManager entityManager;

  @GET
  @Produces(MediaType.TEXT_PLAIN)
  public String listRoleCodes(
      @HeaderParam("X-Tenant-Id") String tenantId,
      @QueryParam("prefix") String prefix) {
    String codePrefix = prefix == null ? "" : prefix;
    @SuppressWarnings("unchecked")
    List<String> roleCodes = entityManager
        .createQuery("select r.code from Role r where r.code like :pattern order by r.code")
        .setParameter("pattern", codePrefix + "%")
        .getResultList();

    return roleCodes.stream()
        .sorted()
        .collect(Collectors.joining(","));
  }
}
