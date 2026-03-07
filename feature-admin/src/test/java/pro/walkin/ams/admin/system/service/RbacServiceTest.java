package pro.walkin.ams.admin.system.service;

import io.quarkus.test.component.QuarkusComponentTest;
import io.quarkus.test.component.TestConfigProperty;
import jakarta.inject.Inject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/** RBAC 服务测试类 */
@QuarkusComponentTest
@TestConfigProperty(key = "smallrye.jwt.sign.key.location", value = "privateKey.jwk")
@DisplayName("RbacService 测试")
class RbacServiceTest {

  @Inject RbacService rbacService;

  @Nested
  @DisplayName("服务注入")
  class Injection {

    @Test
    @DisplayName("服务应可注入")
    void shouldBeInjectable() {
      assertThat(rbacService).isNotNull();
    }
  }

  @Nested
  @DisplayName("无租户上下文时的权限检查")
  class HasPermissionWithoutTenant {

    @Test
    @DisplayName("应返回 false")
    void shouldReturnFalseWhenNoTenantContext() {
      boolean result = rbacService.hasPermission(1L, "view:dashboard");
      assertThat(result).isFalse();
    }
  }

  @Nested
  @DisplayName("无租户上下文时的角色检查")
  class HasRoleWithoutTenant {

    @Test
    @DisplayName("应返回 false")
    void shouldReturnFalseWhenNoTenantContext() {
      boolean result = rbacService.hasRole(1L, "USER");
      assertThat(result).isFalse();
    }
  }
}
