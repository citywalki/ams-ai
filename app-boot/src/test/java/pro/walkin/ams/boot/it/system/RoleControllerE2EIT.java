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
import pro.walkin.ams.boot.client.RoleApiClient;
import pro.walkin.ams.boot.support.E2ETestBase;
import pro.walkin.ams.boot.support.TestDataFactory;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("角色管理 E2E 测试")
class RoleControllerE2EIT extends E2ETestBase {

  @Inject @RestClient AuthApiClient authApi;

  @Inject @RestClient RoleApiClient roleApi;

  private String authToken;
  private Long createdRoleId;

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

    createdRoleId = ((Number) body.get("id")).longValue();
  }

  @Test
  @Order(2)
  @DisplayName("ROLE-E2E-02: 查询角色列表成功")
  void shouldListRoles() {
    // When
    var response = roleApi.listRoles(authToken, String.valueOf(testTenantId));

    // Then
    assertThat(response.getStatus()).isEqualTo(200);

    Map<String, Object> body = response.readEntity(Map.class);
    List<Map<String, Object>> roles = (List<Map<String, Object>>) body.get("data");
    assertThat(roles).isNotEmpty();
  }

  @Test
  @Order(3)
  @DisplayName("ROLE-E2E-03: 根据ID查询角色成功")
  void shouldGetRoleById() {
    // Given
    assertThat(createdRoleId).isNotNull();

    // When
    var response = roleApi.getRole(authToken, String.valueOf(testTenantId), createdRoleId);

    // Then
    assertThat(response.getStatus()).isEqualTo(200);

    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body.get("id")).isEqualTo(createdRoleId.intValue());
  }

  @Test
  @Order(4)
  @DisplayName("ROLE-E2E-04: 更新角色成功")
  void shouldUpdateRole() {
    // Given
    assertThat(createdRoleId).isNotNull();
    Map<String, Object> updateData =
        Map.of(
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

    // Verify deletion
    var getResponse = roleApi.getRole(authToken, String.valueOf(testTenantId), createdRoleId);
    assertThat(getResponse.getStatus()).isEqualTo(404);
  }
}
