package pro.walkin.ams.boot.support;

import io.quarkus.test.common.http.TestHTTPResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

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
    testTenantId = TestConstants.DEFAULT_TENANT_ID;
    authToken = authenticateAsAdmin();
  }

  /** 使用管理员账号登录获取真实 token */
  private String authenticateAsAdmin() {
    try {
      String jsonBody =
          String.format(
              "{\"username\": \"%s\", \"password\": \"%s\"}",
              TestConstants.ADMIN_USERNAME, TestConstants.ADMIN_PASSWORD);

      HttpRequest request =
          HttpRequest.newBuilder()
              .uri(URI.create(baseUri.toString() + "/auth/login"))
              .header("Content-Type", "application/json")
              .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
              .build();

      HttpResponse<String> response =
          HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

      assertThat(response.statusCode()).as("Login should succeed").isEqualTo(TestConstants.HTTP_OK);

      @SuppressWarnings("unchecked")
      Map<String, Object> body =
          new com.fasterxml.jackson.databind.ObjectMapper().readValue(response.body(), Map.class);

      return (String) body.get("accessToken");
    } catch (Exception e) {
      throw new RuntimeException("Failed to authenticate", e);
    }
  }

  @Transactional
  protected void cleanTestData(String tableName, Long tenantId) {
    entityManager
        .createNativeQuery("DELETE FROM " + tableName + " WHERE tenant_id = ?1")
        .setParameter(1, tenantId)
        .executeUpdate();
  }

  /** 获取 Authorization Header */
  protected String getAuthHeader() {
    return "Bearer " + authToken;
  }
}
