package pro.walkin.ams.boot.it.auth;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import pro.walkin.ams.boot.client.AuthApiClient;
import pro.walkin.ams.boot.support.E2ETestBase;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthControllerE2EIT extends E2ETestBase {

  @Inject @RestClient AuthApiClient authApi;

  private static String accessToken;
  private static String refreshToken;

  @Test
  @Order(1)
  @DisplayName("AUTH-E2E-01: 使用有效凭据登录成功")
  void shouldLoginWithValidCredentials() {
    // Given
    Map<String, String> credentials = Map.of("username", "admin", "password", "admin123");

    // When
    var response = authApi.login(credentials);

    // Then
    assertThat(response.getStatus()).isEqualTo(200);

    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body).containsKeys("accessToken", "refreshToken", "expiresIn");
    assertThat(body.get("tokenType")).isEqualTo("Bearer");

    accessToken = (String) body.get("accessToken");
    refreshToken = (String) body.get("refreshToken");
  }

  @Test
  @Order(2)
  @DisplayName("AUTH-E2E-02: 使用无效凭据登录失败")
  void shouldFailLoginWithInvalidCredentials() {
    // Given
    Map<String, String> credentials = Map.of("username", "admin", "password", "wrongpassword");

    // When/Then - RestClient 会将 401 转换为异常
    try {
      authApi.login(credentials);
      org.junit.jupiter.api.Assertions.fail("Expected exception for invalid credentials");
    } catch (jakarta.ws.rs.WebApplicationException e) {
      assertThat(e.getResponse().getStatus()).isEqualTo(401);
    }
  }

  @Test
  @Order(3)
  @DisplayName("AUTH-E2E-03: 获取当前用户信息成功")
  void shouldGetCurrentUser() {
    // Given
    String authHeader = "Bearer " + accessToken;

    // When
    var response = authApi.getCurrentUser(authHeader);

    // Then
    assertThat(response.getStatus()).isEqualTo(200);

    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body).containsKeys("id", "username", "email");
    assertThat(body.get("username")).isEqualTo("admin");
  }

  @Test
  @Order(4)
  @DisplayName("AUTH-E2E-04: 刷新令牌成功")
  void shouldRefreshToken() {
    // Given
    Map<String, String> request = Map.of("refreshToken", refreshToken);

    // When
    var response = authApi.refreshToken(request);

    // Then
    assertThat(response.getStatus()).isEqualTo(200);

    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body).containsKey("accessToken");
  }

  @Test
  @Order(5)
  @DisplayName("AUTH-E2E-05: 登出成功")
  void shouldLogoutSuccessfully() {
    // Given
    String authHeader = "Bearer " + accessToken;

    // When
    var response = authApi.logout(authHeader);

    // Then
    assertThat(response.getStatus()).isEqualTo(200);
  }
}
