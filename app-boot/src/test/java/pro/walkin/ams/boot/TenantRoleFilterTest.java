package pro.walkin.ams.boot;

import static org.assertj.core.api.Assertions.assertThat;

import io.quarkus.test.common.http.TestHTTPResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@QuarkusTest
class TenantRoleFilterTest {

  @Inject
  EntityManager entityManager;

  @TestHTTPResource("/q/test/tenant-role-codes")
  URI roleProbeUri;

  private Long tenantAId;
  private Long tenantBId;
  private String tenantARoleCode;
  private String tenantBRoleCode;
  private String codePrefix;

  @BeforeEach
  @Transactional
  void setUpData() {
    @SuppressWarnings("unchecked")
    List<Number> tenants = entityManager
        .createNativeQuery("select id from tenants order by id limit 2")
        .getResultList();
    assertThat(tenants).hasSizeGreaterThanOrEqualTo(2);

    tenantAId = tenants.get(0).longValue();
    tenantBId = tenants.get(1).longValue();

    codePrefix = "TENANT_ROLE_FILTER_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    tenantARoleCode = codePrefix + "_A";
    tenantBRoleCode = codePrefix + "_B";
    long baseId = System.currentTimeMillis();

    entityManager.createNativeQuery("insert into roles (id, code, name, tenant_id) values (?1, ?2, ?3, ?4)")
        .setParameter(1, baseId)
        .setParameter(2, tenantARoleCode)
        .setParameter(3, "Tenant A Role")
        .setParameter(4, tenantAId)
        .executeUpdate();

    entityManager.createNativeQuery("insert into roles (id, code, name, tenant_id) values (?1, ?2, ?3, ?4)")
        .setParameter(1, baseId + 1)
        .setParameter(2, tenantBRoleCode)
        .setParameter(3, "Tenant B Role")
        .setParameter(4, tenantBId)
        .executeUpdate();
  }

  @Test
  @DisplayName("should only return roles of current tenant")
  void shouldOnlyReturnRolesOfCurrentTenant() throws Exception {
    String encodedPrefix = URLEncoder.encode(codePrefix, StandardCharsets.UTF_8);
    URI requestUri = URI.create(roleProbeUri.toString() + "?prefix=" + encodedPrefix);

    HttpRequest request = HttpRequest.newBuilder(requestUri)
        .header("X-Tenant-Id", tenantAId.toString())
        .GET()
        .build();

    HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).isEqualTo(tenantARoleCode);
    assertThat(response.body()).doesNotContain(tenantBRoleCode);
  }
}
