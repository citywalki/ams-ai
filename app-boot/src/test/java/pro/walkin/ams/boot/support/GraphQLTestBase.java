package pro.walkin.ams.boot.support;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import pro.walkin.ams.boot.client.AuthApiClient;
import pro.walkin.ams.boot.client.GraphQLClient;

import java.util.Map;

@QuarkusTest
public abstract class GraphQLTestBase extends E2ETestBase {

  @Inject @RestClient protected GraphQLClient graphQLClient;

  @Inject @RestClient protected AuthApiClient authApi;

  protected String getAuthToken() {
    var response = authApi.login(Map.of("username", "admin", "password", "admin123"));
    Map<String, Object> body = response.readEntity(Map.class);
    return "Bearer " + body.get("accessToken");
  }

  protected Map<String, Object> createQuery(String query, Map<String, Object> variables) {
    return Map.of("query", query, "variables", variables != null ? variables : Map.of());
  }
}
