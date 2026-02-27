package pro.walkin.ams.admin.system.service;

import io.quarkus.test.component.QuarkusComponentTest;
import io.quarkus.test.component.TestConfigProperty;
import jakarta.inject.Inject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@QuarkusComponentTest
@TestConfigProperty(key = "smallrye.jwt.sign.key.location", value = "privateKey.jwk")
class RbacServiceTest {

  @Inject RbacService rbacService;

  @Nested
  @DisplayName("Injection")
  class Injection {

    @Test
    @DisplayName("should be injectable")
    void shouldBeInjectable() {
      assertThat(rbacService).isNotNull();
    }
  }

  @Nested
  @DisplayName("hasPermission without tenant context")
  class HasPermissionWithoutTenant {

    @Test
    @DisplayName("should return false when no tenant context")
    void shouldReturnFalseWhenNoTenantContext() {
      boolean result = rbacService.hasPermission(1L, "view:dashboard");
      assertThat(result).isFalse();
    }
  }

  @Nested
  @DisplayName("hasRole without tenant context")
  class HasRoleWithoutTenant {

    @Test
    @DisplayName("should return false when no tenant context")
    void shouldReturnFalseWhenNoTenantContext() {
      boolean result = rbacService.hasRole(1L, "USER");
      assertThat(result).isFalse();
    }
  }
}
