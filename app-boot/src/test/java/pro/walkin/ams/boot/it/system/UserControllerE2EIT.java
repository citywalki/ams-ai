package pro.walkin.ams.boot.it.system;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestMethodOrder;
import pro.walkin.ams.boot.client.AuthApiClient;
import pro.walkin.ams.boot.client.GraphQLClient;
import pro.walkin.ams.boot.client.UserApiClient;
import pro.walkin.ams.boot.support.GraphQLTestBase;
import pro.walkin.ams.boot.support.TestDataFactory;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("用户管理 E2E 测试")
class UserControllerE2EIT extends GraphQLTestBase {

  @Inject @RestClient AuthApiClient authApi;

  @Inject @RestClient UserApiClient userApi;

  @Inject @RestClient GraphQLClient graphQLClient;

  private String authToken;
  private Long createdUserId;

  @BeforeAll
  void setUpAuth() {
    var loginResponse = authApi.login(Map.of("username", "admin", "password", "admin123"));
    Map<String, Object> body = loginResponse.readEntity(Map.class);
    authToken = "Bearer " + body.get("accessToken");
  }

  @Test
  @Order(1)
  @DisplayName("USER-E2E-01: 创建用户成功")
  void shouldCreateUser() {
    // Given
    String uniqueCode = TestDataFactory.uniqueCode("USER");
    Map<String, Object> userData =
        Map.of(
            "username",
            uniqueCode,
            "email",
            uniqueCode + "@test.com",
            "password",
            "password123",
            "status",
            "ACTIVE");

    // When
    var response = userApi.createUser(authToken, String.valueOf(testTenantId), userData);

    // Then
    assertThat(response.getStatus()).isEqualTo(201);

    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body).containsKeys("id", "username", "email");
    assertThat(body.get("username")).isEqualTo(uniqueCode);

    createdUserId = ((Number) body.get("id")).longValue();
  }

  @Test
  @Order(2)
  @DisplayName("USER-E2E-02: 查询用户列表成功")
  void shouldListUsers() {
    // Given
    String query =
        """
            query {
                users {
                    data {
                        id
                        username
                        email
                    }
                    total
                    page
                    size
                }
            }
            """;

    // When
    var response = graphQLClient.executeQuery(authToken, createQuery(query, null));

    // Then
    assertThat(response.getStatus()).isEqualTo(200);

    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body).containsKey("data");

    Map<String, Object> data = (Map<String, Object>) body.get("data");
    Map<String, Object> users = (Map<String, Object>) data.get("users");

    assertThat(users).containsKeys("data", "total", "page", "size");

    List<Map<String, Object>> userList = (List<Map<String, Object>>) users.get("data");
    assertThat(userList).isNotEmpty();
  }

  @Test
  @Order(3)
  @DisplayName("USER-E2E-03: 根据ID查询用户成功")
  void shouldGetUserById() {
    // Given
    assertThat(createdUserId).isNotNull();

    String query =
        """
            query($id: Long!) {
                user(id: $id) {
                    id
                    username
                    email
                    status
                }
            }
            """;

    // When
    var response =
        graphQLClient.executeQuery(authToken, createQuery(query, Map.of("id", createdUserId)));

    // Then
    assertThat(response.getStatus()).isEqualTo(200);

    Map<String, Object> body = response.readEntity(Map.class);
    Map<String, Object> data = (Map<String, Object>) body.get("data");
    Map<String, Object> user = (Map<String, Object>) data.get("user");

    assertThat(user.get("id")).isEqualTo(createdUserId.intValue());
    assertThat(user).containsKeys("username", "email", "status");
  }

  @Test
  @Order(4)
  @DisplayName("USER-E2E-04: 更新用户成功")
  void shouldUpdateUser() {
    // Given
    assertThat(createdUserId).isNotNull();
    Map<String, Object> updateData =
        Map.of("email", "updated" + createdUserId + "@test.com", "status", "INACTIVE");

    // When
    var response =
        userApi.updateUser(authToken, String.valueOf(testTenantId), createdUserId, updateData);

    // Then
    assertThat(response.getStatus()).isEqualTo(200);

    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body.get("email")).isEqualTo("updated" + createdUserId + "@test.com");
  }

  @Test
  @Order(5)
  @DisplayName("USER-E2E-05: 删除用户成功")
  void shouldDeleteUser() {
    // Given
    assertThat(createdUserId).isNotNull();

    // When
    var response = userApi.deleteUser(authToken, String.valueOf(testTenantId), createdUserId);

    // Then
    assertThat(response.getStatus()).isEqualTo(204);

    // Verify deletion via GraphQL
    String query =
        """
            query($id: Long!) {
                user(id: $id) {
                    id
                }
            }
            """;
    var getResponse =
        graphQLClient.executeQuery(authToken, createQuery(query, Map.of("id", createdUserId)));

    // When user is not found, GraphQL returns data with null user or errors
    assertThat(getResponse.getStatus()).isEqualTo(200);
    Map<String, Object> body = getResponse.readEntity(Map.class);
    assertThat(body.containsKey("errors")).isTrue();
  }

  @Test
  @Order(6)
  @DisplayName("USER-E2E-06: 创建重复用户失败")
  void shouldFailToCreateDuplicateUser() {
    // Given
    String username = TestDataFactory.uniqueCode("USER");
    Map<String, Object> userData =
        Map.of(
            "username",
            username,
            "email",
            username + "@test.com",
            "password",
            "password123",
            "status",
            "ACTIVE");

    // Create first user
    var firstResponse = userApi.createUser(authToken, String.valueOf(testTenantId), userData);
    assertThat(firstResponse.getStatus()).isEqualTo(201);

    // Try to create duplicate
    var secondResponse = userApi.createUser(authToken, String.valueOf(testTenantId), userData);
    assertThat(secondResponse.getStatus()).isEqualTo(409); // Conflict
  }
}
