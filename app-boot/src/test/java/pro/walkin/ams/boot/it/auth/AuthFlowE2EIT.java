package pro.walkin.ams.boot.it.auth;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import pro.walkin.ams.boot.client.AuthApiClient;
import pro.walkin.ams.boot.client.UserApiClient;
import pro.walkin.ams.boot.support.E2ETestBase;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@QuarkusTest
@DisplayName("认证流程端到端测试")
class AuthFlowE2EIT extends E2ETestBase {

  @Inject @RestClient AuthApiClient authApi;

  @Inject @RestClient UserApiClient userApi;

  @Test
  @DisplayName("AUTH-FLOW-01: 完整登录-操作-登出流程")
  void shouldCompleteFullAuthFlow() {
    // Step 1: 登录
    Map<String, String> credentials = Map.of("username", "admin", "password", "admin123");
    var loginResponse = authApi.login(credentials);
    assertThat(loginResponse.getStatus()).isEqualTo(200);

    Map<String, Object> loginBody = loginResponse.readEntity(Map.class);
    String token = (String) loginBody.get("accessToken");
    String authHeader = "Bearer " + token;

    // Step 2: 获取用户信息
    var meResponse = authApi.getCurrentUser(authHeader);
    assertThat(meResponse.getStatus()).isEqualTo(200);

    // Step 3: 使用 token 访问受保护资源（用户列表）
    var usersResponse = userApi.listUsers(authHeader, String.valueOf(testTenantId));
    assertThat(usersResponse.getStatus()).isEqualTo(200);

    // Step 4: 登出
    var logoutResponse = authApi.logout(authHeader);
    assertThat(logoutResponse.getStatus()).isEqualTo(200);

    // Step 5: 验证 token 已失效
    var afterLogoutResponse = authApi.getCurrentUser(authHeader);
    assertThat(afterLogoutResponse.getStatus()).isEqualTo(401);
  }
}
