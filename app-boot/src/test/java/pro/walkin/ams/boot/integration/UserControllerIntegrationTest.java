package pro.walkin.ams.boot.integration;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import pro.walkin.ams.boot.client.AuthApiClient;
import pro.walkin.ams.boot.client.GraphQLClient;
import pro.walkin.ams.boot.client.UserApiClient;
import pro.walkin.ams.boot.support.GraphQLTestBase;
import pro.walkin.ams.boot.support.TestConstants;
import pro.walkin.ams.boot.support.TestDataBuilder;

import java.util.Map;

import static org.assertj.core.api.Assertions.*;

/**
 * 用户管理集成测试
 */
@QuarkusTest
@DisplayName("用户管理集成测试")
class UserControllerIntegrationTest extends GraphQLTestBase {

  @Inject @RestClient AuthApiClient authApi;

  @Inject @RestClient UserApiClient userApi;

  @Inject @RestClient GraphQLClient graphQLClient;

  private String authToken;
  private Long createdUserId;

  @BeforeEach
  void setUpAuth() {
    var loginResponse = authApi.login(
        Map.of("username", TestConstants.ADMIN_USERNAME, "password", TestConstants.ADMIN_PASSWORD));
    @SuppressWarnings("unchecked")
    Map<String, Object> body = loginResponse.readEntity(Map.class);
    authToken = "Bearer " + body.get("accessToken");
  }

  @AfterEach
  @Transactional
  void cleanUp() {
    if (createdUserId != null) {
      cleanTestData("users", createdUserId);
    }
  }

  @Test
  @DisplayName("USER-INT-01: 创建用户成功")
  void shouldCreateUser() {
    // Given
    String uniqueCode = TestDataBuilder.uniqueCode("USER");
    Map<String, Object> userData = Map.of(
        "username", uniqueCode,
        "email", uniqueCode + "@test.com",
        "password", "password123",
        "status", "ACTIVE");

    // When
    var response = userApi.createUser(
        authToken, String.valueOf(TestConstants.DEFAULT_TENANT_ID), userData);

    // Then
    assertThat(response.getStatus()).isEqualTo(TestConstants.HTTP_CREATED);

    @SuppressWarnings("unchecked")
    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body).containsKeys("id", "username", "email");
    assertThat(body.get("username")).isEqualTo(uniqueCode);

    Object idValue = body.get("id");
    createdUserId = idValue instanceof Number
        ? ((Number) idValue).longValue()
        : Long.parseLong(idValue.toString());
  }

  @Test
  @DisplayName("USER-INT-02: 查询用户列表成功")
  void shouldListUsers() {
    // Given
    String query = """
        query {
            users {
                content {
                    id
                    username
                    email
                }
                totalElements
                page
                size
            }
        }
        """;

    // When
    var response = graphQLClient.executeQuery(authToken, createQuery(query, null));

    // Then
    assertThat(response.getStatus()).isEqualTo(TestConstants.HTTP_OK);

    @SuppressWarnings("unchecked")
    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body).containsKey("data");

    @SuppressWarnings("unchecked")
    Map<String, Object> data = (Map<String, Object>) body.get("data");
    @SuppressWarnings("unchecked")
    Map<String, Object> users = (Map<String, Object>) data.get("users");

    assertThat(users).containsKeys("content", "totalElements", "page", "size");
    assertThat(users.get("content")).isNotNull();
  }

  @Test
  @DisplayName("USER-INT-03: 根据ID查询用户成功")
  void shouldGetUserById() {
    // Given - 先创建一个用户
    String uniqueCode = TestDataBuilder.uniqueCode("USER");
    Map<String, Object> userData = Map.of(
        "username", uniqueCode,
        "email", uniqueCode + "@test.com",
        "password", "password123",
        "status", "ACTIVE");

    var createResponse = userApi.createUser(
        authToken, String.valueOf(TestConstants.DEFAULT_TENANT_ID), userData);
    assertThat(createResponse.getStatus()).isEqualTo(TestConstants.HTTP_CREATED);

    @SuppressWarnings("unchecked")
    Map<String, Object> createBody = createResponse.readEntity(Map.class);
    Object idValue = createBody.get("id");
    Long userId = idValue instanceof Number
        ? ((Number) idValue).longValue()
        : Long.parseLong(idValue.toString());
    createdUserId = userId;

    // When - 查询用户
    String query = """
        query($id: String!) {
            users(where: {id: {_eq: $id}}) {
                content {
                    id
                    username
                    email
                    status
                }
                totalElements
            }
        }
        """;

    var response = graphQLClient.executeQuery(
        authToken, createQuery(query, Map.of("id", String.valueOf(userId))));

    // Then
    assertThat(response.getStatus()).isEqualTo(TestConstants.HTTP_OK);

    @SuppressWarnings("unchecked")
    Map<String, Object> body = response.readEntity(Map.class);
    @SuppressWarnings("unchecked")
    Map<String, Object> data = (Map<String, Object>) body.get("data");
    @SuppressWarnings("unchecked")
    Map<String, Object> users = (Map<String, Object>) data.get("users");

    assertThat(users.get("totalElements")).isEqualTo(1);
  }

  @Test
  @DisplayName("USER-INT-04: 更新用户成功")
  void shouldUpdateUser() {
    // Given - 先创建一个用户
    String uniqueCode = TestDataBuilder.uniqueCode("USER");
    Map<String, Object> userData = Map.of(
        "username", uniqueCode,
        "email", uniqueCode + "@test.com",
        "password", "password123",
        "status", "ACTIVE");

    var createResponse = userApi.createUser(
        authToken, String.valueOf(TestConstants.DEFAULT_TENANT_ID), userData);
    assertThat(createResponse.getStatus()).isEqualTo(TestConstants.HTTP_CREATED);

    @SuppressWarnings("unchecked")
    Map<String, Object> createBody = createResponse.readEntity(Map.class);
    Object idValue = createBody.get("id");
    Long userId = idValue instanceof Number
        ? ((Number) idValue).longValue()
        : Long.parseLong(idValue.toString());
    createdUserId = userId;

    // When - 更新用户
    Map<String, Object> updateData = Map.of(
        "email", "updated" + userId + "@test.com",
        "status", "INACTIVE");

    var response = userApi.updateUser(
        authToken, String.valueOf(TestConstants.DEFAULT_TENANT_ID), userId, updateData);

    // Then
    assertThat(response.getStatus()).isEqualTo(TestConstants.HTTP_OK);

    @SuppressWarnings("unchecked")
    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body.get("email")).isEqualTo("updated" + userId + "@test.com");
  }

  @Test
  @DisplayName("USER-INT-05: 删除用户成功")
  void shouldDeleteUser() {
    // Given - 先创建一个用户
    String uniqueCode = TestDataBuilder.uniqueCode("USER");
    Map<String, Object> userData = Map.of(
        "username", uniqueCode,
        "email", uniqueCode + "@test.com",
        "password", "password123",
        "status", "ACTIVE");

    var createResponse = userApi.createUser(
        authToken, String.valueOf(TestConstants.DEFAULT_TENANT_ID), userData);
    assertThat(createResponse.getStatus()).isEqualTo(TestConstants.HTTP_CREATED);

    @SuppressWarnings("unchecked")
    Map<String, Object> createBody = createResponse.readEntity(Map.class);
    Object idValue = createBody.get("id");
    Long userId = idValue instanceof Number
        ? ((Number) idValue).longValue()
        : Long.parseLong(idValue.toString());

    // When - 删除用户
    var response = userApi.deleteUser(
        authToken, String.valueOf(TestConstants.DEFAULT_TENANT_ID), userId);

    // Then
    assertThat(response.getStatus()).isEqualTo(TestConstants.HTTP_NO_CONTENT);
    createdUserId = null; // 已删除，无需再清理
  }

  @Test
  @DisplayName("USER-INT-06: 创建重复用户失败")
  void shouldFailToCreateDuplicateUser() {
    // Given - 创建第一个用户
    String username = TestDataBuilder.uniqueCode("USER");
    Map<String, Object> userData = Map.of(
        "username", username,
        "email", username + "@test.com",
        "password", "password123",
        "status", "ACTIVE");

    var firstResponse = userApi.createUser(
        authToken, String.valueOf(TestConstants.DEFAULT_TENANT_ID), userData);
    assertThat(firstResponse.getStatus()).isEqualTo(TestConstants.HTTP_CREATED);

    @SuppressWarnings("unchecked")
    Map<String, Object> firstBody = firstResponse.readEntity(Map.class);
    Object idValue = firstBody.get("id");
    createdUserId = idValue instanceof Number
        ? ((Number) idValue).longValue()
        : Long.parseLong(idValue.toString());

    // When/Then - 创建重复用户应失败
    assertThatThrownBy(() -> userApi.createUser(
        authToken, String.valueOf(TestConstants.DEFAULT_TENANT_ID), userData))
        .isInstanceOf(jakarta.ws.rs.WebApplicationException.class)
        .satisfies(ex -> {
          jakarta.ws.rs.WebApplicationException wae = (jakarta.ws.rs.WebApplicationException) ex;
          assertThat(wae.getResponse().getStatus()).isEqualTo(TestConstants.HTTP_BAD_REQUEST);
        });
  }
}
