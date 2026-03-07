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
import pro.walkin.ams.boot.client.RoleApiClient;
import pro.walkin.ams.boot.support.GraphQLTestBase;
import pro.walkin.ams.boot.support.TestDataFactory;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("角色管理 E2E 测试")
class RoleControllerE2EIT extends GraphQLTestBase {

  @Inject @RestClient AuthApiClient authApi;

  @Inject @RestClient RoleApiClient roleApi;

  @Inject @RestClient GraphQLClient graphQLClient;

  private String authToken;
  private Long createdRoleId;
  private String createdRoleCode;

  @BeforeAll
  void setUpAuth() {
    var loginResponse = authApi.login(Map.of("username", "admin", "password", "admin123"));
    Map<String, Object> body = loginResponse.readEntity(Map.class);
    authToken = "Bearer " + body.get("accessToken");
  }

  @Test
  @Order(1)
  @DisplayName("ROLE-E2E-01: 创建角色成功")
  void shouldCreateRole() {
    // Given
    String roleCode = TestDataFactory.uniqueCode("ROLE");
    Map<String, Object> roleData =
        Map.of(
            "code",
            roleCode,
            "name",
            "Test Role " + roleCode,
            "description",
            "Test role description");

    // When
    var response = roleApi.createRole(authToken, String.valueOf(testTenantId), roleData);

    // Then
    assertThat(response.getStatus()).isEqualTo(201);

    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body).containsKeys("id", "code", "name");
    assertThat(body.get("code")).isEqualTo(roleCode);

    createdRoleCode = roleCode;
    Object idValue = body.get("id");
    if (idValue instanceof Number) {
      createdRoleId = ((Number) idValue).longValue();
    } else if (idValue instanceof String) {
      createdRoleId = Long.parseLong((String) idValue);
    }
  }

  @Test
  @Order(2)
  @DisplayName("ROLE-E2E-02: 查询角色列表成功")
  void shouldListRoles() {
    // Given
    String query =
        """
            query {
                roles {
                    content {
                        id
                        code
                        name
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
    assertThat(response.getStatus()).isEqualTo(200);

    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body).containsKey("data");

    Map<String, Object> data = (Map<String, Object>) body.get("data");
    Map<String, Object> roles = (Map<String, Object>) data.get("roles");

    assertThat(roles).containsKeys("content", "totalElements", "page", "size");

    List<Map<String, Object>> roleList = (List<Map<String, Object>>) roles.get("content");
    assertThat(roleList).isNotEmpty();
  }

  @Test
  @Order(3)
  @DisplayName("ROLE-E2E-03: 根据ID查询角色成功")
  void shouldGetRoleById() {
    // Given
    assertThat(createdRoleId).isNotNull();

    String query =
        """
            query($id: String!) {
                roles(where: {id: {_eq: $id}}) {
                    content {
                        id
                        code
                        name
                        description
                    }
                    totalElements
                }
            }
            """;

    // When
    var response =
        graphQLClient.executeQuery(
            authToken, createQuery(query, Map.of("id", String.valueOf(createdRoleId))));

    // Then
    assertThat(response.getStatus()).isEqualTo(200);

    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body).containsKey("data");

    Map<String, Object> data = (Map<String, Object>) body.get("data");
    Map<String, Object> roles = (Map<String, Object>) data.get("roles");
    List<Map<String, Object>> roleList = (List<Map<String, Object>>) roles.get("content");

    assertThat(roleList).isNotEmpty();
    Object actualId = roleList.get(0).get("id");
    long actualIdLong =
        actualId instanceof Number
            ? ((Number) actualId).longValue()
            : Long.parseLong(actualId.toString());
    assertThat(actualIdLong).isEqualTo(createdRoleId);
  }

  @Test
  @Order(4)
  @DisplayName("ROLE-E2E-04: 更新角色成功")
  void shouldUpdateRole() {
    // Given
    assertThat(createdRoleId).isNotNull();
    Map<String, Object> updateData =
        Map.of(
            "code", createdRoleCode,
            "name", "Updated Role Name",
            "description", "Updated description");

    // When
    var response =
        roleApi.updateRole(authToken, String.valueOf(testTenantId), createdRoleId, updateData);

    // Then
    assertThat(response.getStatus()).isEqualTo(200);

    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body.get("name")).isEqualTo("Updated Role Name");
  }

  @Test
  @Order(5)
  @DisplayName("ROLE-E2E-05: 删除角色成功")
  void shouldDeleteRole() {
    // Given
    assertThat(createdRoleId).isNotNull();

    // When
    var response = roleApi.deleteRole(authToken, String.valueOf(testTenantId), createdRoleId);

    // Then
    assertThat(response.getStatus()).isEqualTo(204);

    // Verify deletion via GraphQL
    String query =
        """
            query($id: String!) {
                roles(where: {id: {_eq: $id}}) {
                    content {
                        id
                    }
                    totalElements
                }
            }
            """;
    var getResponse =
        graphQLClient.executeQuery(
            authToken, createQuery(query, Map.of("id", String.valueOf(createdRoleId))));

    // When role is deleted, GraphQL returns empty list
    assertThat(getResponse.getStatus()).isEqualTo(200);
    Map<String, Object> body = getResponse.readEntity(Map.class);
    assertThat(body).containsKey("data");
    Map<String, Object> data = (Map<String, Object>) body.get("data");
    Map<String, Object> roles = (Map<String, Object>) data.get("roles");
    List<Map<String, Object>> roleList = (List<Map<String, Object>>) roles.get("content");
    assertThat(roleList).isEmpty();
  }
}
