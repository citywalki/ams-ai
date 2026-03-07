package pro.walkin.ams.boot.support;

import io.quarkus.test.common.http.TestHTTPResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;

import java.net.URI;

@QuarkusTest
public abstract class E2ETestBase {

  @TestHTTPResource("/api")
  protected URI baseUri;

  @Inject protected EntityManager entityManager;

  protected Long testTenantId;
  protected String authToken;

  @BeforeEach
  @Transactional
  protected void baseSetUp() {
    testTenantId = getOrCreateTestTenant();
    authToken = authenticateAsAdmin();
  }

  private Long getOrCreateTestTenant() {
    return System.currentTimeMillis();
  }

  private String authenticateAsAdmin() {
    return "test-token";
  }

  @Transactional
  protected void cleanTestData(String tableName, Long tenantId) {
    entityManager
        .createNativeQuery("DELETE FROM " + tableName + " WHERE tenant_id = ?1")
        .setParameter(1, tenantId)
        .executeUpdate();
  }
}
