package pro.walkin.ams.admin.system;

import io.quarkus.test.component.QuarkusComponentTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@QuarkusComponentTest
class PermissionServiceTest {

    @Inject
    PermissionService permissionService;

    @Nested
    @DisplayName("Injection")
    class Injection {
        
        @Test
        @DisplayName("should be injectable")
        void shouldBeInjectable() {
            assertThat(permissionService).isNotNull();
        }
    }
    
    @Nested
    @DisplayName("findAll without tenant context")
    class FindAll {
        
        @Test
        @DisplayName("should return empty list when no tenant context")
        void shouldReturnEmptyWhenNoTenantContext() {
            var result = permissionService.findAll(0, 10);
            assertThat(result).isEmpty();
        }
    }
    
    @Nested
    @DisplayName("count without tenant context")
    class Count {
        
        @Test
        @DisplayName("should return zero when no tenant context")
        void shouldReturnZeroWhenNoTenantContext() {
            long count = permissionService.count();
            assertThat(count).isZero();
        }
    }
}
