package pro.walkin.ams.admin.system;

import io.quarkus.test.component.QuarkusComponentTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import pro.walkin.ams.admin.system.query.PermissionQuery;

import static org.assertj.core.api.Assertions.*;

@QuarkusComponentTest
class PermissionQueryTest {

  @Inject PermissionQuery permissionQuery;

  @Nested
  @DisplayName("Injection")
  class Injection {

    @Test
    @DisplayName("should be injectable")
    void shouldBeInjectable() {
      assertThat(permissionQuery).isNotNull();
    }
  }

  @Nested
  @DisplayName("findAll without tenant context")
  class FindAll {

    @Test
    @DisplayName("should return empty list when no tenant context")
    void shouldReturnEmptyWhenNoTenantContext() {
      var result = permissionQuery.findAllAsDto(null, null, 0, 10);
      assertThat(result).isEmpty();
    }
  }

  @Nested
  @DisplayName("count without tenant context")
  class Count {

    @Test
    @DisplayName("should return zero when no tenant context")
    void shouldReturnZeroWhenNoTenantContext() {
      long count = permissionQuery.count();
      assertThat(count).isZero();
    }
  }
}
