package pro.walkin.ams.admin.auth.service;

import io.quarkus.test.component.QuarkusComponentTest;
import io.quarkus.test.component.TestConfigProperty;
import jakarta.inject.Inject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@QuarkusComponentTest
@TestConfigProperty(key = "smallrye.jwt.sign.key.location", value = "privateKey.jwk")
class AuthenticationServiceTest {

  @Inject AuthenticationService authService;

  @Nested
  @DisplayName("Injection")
  class Injection {

    @Test
    @DisplayName("should be injectable")
    void shouldBeInjectable() {
      assertThat(authService).isNotNull();
    }
  }
}
