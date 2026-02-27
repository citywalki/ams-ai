package pro.walkin.ams.admin.auth.service;

import io.quarkus.test.component.QuarkusComponentTest;
import io.quarkus.test.component.TestConfigProperty;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;

import java.util.Set;

import static org.assertj.core.api.Assertions.*;

@QuarkusComponentTest
@TestConfigProperty(key = "smallrye.jwt.sign.key.location", value = "privateKey.jwk")
class TokenServiceTest {

  @Inject TokenService tokenService;

  private User testUser;

  @BeforeEach
  void setUp() {
    testUser = new User();
    testUser.id = 1L;
    testUser.username = "testuser";
    testUser.tenant = 100L;

    Role role = new Role();
    role.code = "USER";
    role.tenant = 100L;

    Permission permission = new Permission();
    permission.code = "view:dashboard";
    role.permissions = Set.of(permission);

    testUser.roles = Set.of(role);
  }

  @Nested
  @DisplayName("generateAccessToken")
  class GenerateAccessToken {

    @Test
    @DisplayName("should generate valid JWT token with 3 parts")
    void shouldGenerateValidToken() {
      String token = tokenService.generateAccessToken(testUser);

      assertThat(token).isNotNull();
      assertThat(token).isNotEmpty();
      assertThat(token.split("\\.")).hasSize(3);
    }
  }

  @Nested
  @DisplayName("generateRefreshToken")
  class GenerateRefreshToken {

    @Test
    @DisplayName("should generate valid refresh token with 3 parts")
    void shouldGenerateValidRefreshToken() {
      String refreshToken = tokenService.generateRefreshToken(testUser);

      assertThat(refreshToken).isNotNull();
      assertThat(refreshToken).isNotEmpty();
      assertThat(refreshToken.split("\\.")).hasSize(3);
    }
  }

  @Nested
  @DisplayName("Injection")
  class Injection {

    @Test
    @DisplayName("should be injectable")
    void shouldBeInjectable() {
      assertThat(tokenService).isNotNull();
    }
  }
}
