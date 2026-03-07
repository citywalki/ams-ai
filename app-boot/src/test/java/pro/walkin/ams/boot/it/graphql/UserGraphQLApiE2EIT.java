package pro.walkin.ams.boot.it.graphql;

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
import pro.walkin.ams.boot.client.GraphQLClient;
import pro.walkin.ams.boot.support.GraphQLTestBase;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("用户 GraphQL API E2E 测试")
class UserGraphQLApiE2EIT extends GraphQLTestBase {

  @Inject @RestClient GraphQLClient graphQLClient;

  private String authToken;

  @BeforeAll
  void setUp() {
    authToken = getAuthToken();
  }

  @Test
  @Order(1)
  @DisplayName("GRAPHQL-USER-01: 查询用户列表")
  void shouldQueryUsers() {
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
  @Order(2)
  @DisplayName("GRAPHQL-USER-02: 根据ID查询用户")
  void shouldQueryUserById() {
    // Given - 先获取一个用户ID
    String listQuery =
        """
            query {
                users(page: 0, size: 1) {
                    data {
                        id
                    }
                }
            }
            """;

    var listResponse = graphQLClient.executeQuery(authToken, createQuery(listQuery, null));

    Map<String, Object> listBody = listResponse.readEntity(Map.class);
    Map<String, Object> listData = (Map<String, Object>) listBody.get("data");
    Map<String, Object> users = (Map<String, Object>) listData.get("users");
    List<Map<String, Object>> userList = (List<Map<String, Object>>) users.get("data");

    if (userList.isEmpty()) {
      org.junit.jupiter.api.Assertions.fail("No users found for testing");
    }

    Integer userId = (Integer) userList.get(0).get("id");

    // When
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

    var response = graphQLClient.executeQuery(authToken, createQuery(query, Map.of("id", userId)));

    // Then
    assertThat(response.getStatus()).isEqualTo(200);

    Map<String, Object> body = response.readEntity(Map.class);
    Map<String, Object> data = (Map<String, Object>) body.get("data");
    Map<String, Object> user = (Map<String, Object>) data.get("user");

    assertThat(user.get("id")).isEqualTo(userId);
    assertThat(user).containsKeys("username", "email", "status");
  }
}
