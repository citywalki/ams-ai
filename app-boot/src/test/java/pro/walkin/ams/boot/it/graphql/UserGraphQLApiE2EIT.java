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
    assertThat(response.getStatus()).isEqualTo(200);

    Map<String, Object> body = response.readEntity(Map.class);
    assertThat(body).containsKey("data");

    Map<String, Object> data = (Map<String, Object>) body.get("data");
    Map<String, Object> users = (Map<String, Object>) data.get("users");

    assertThat(users).containsKeys("content", "totalElements", "page", "size");

    List<Map<String, Object>> userList = (List<Map<String, Object>>) users.get("content");
    assertThat(userList).isNotEmpty();
  }

  @Test
  @Order(2)
  @DisplayName("GRAPHQL-USER-02: 分页查询用户")
  void shouldQueryUsersWithPagination() {
    // Given
    String query =
        """
            query {
                users(page: 0, size: 5) {
                    content {
                        id
                        username
                        email
                    }
                    totalElements
                    totalPages
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

    assertThat(users).containsKeys("content", "totalElements", "totalPages", "page", "size");
    assertThat(users.get("page")).isEqualTo(0);
    assertThat(users.get("size")).isEqualTo(5);

    List<Map<String, Object>> userList = (List<Map<String, Object>>) users.get("content");
    assertThat(userList.size()).isLessThanOrEqualTo(5);
  }
}
