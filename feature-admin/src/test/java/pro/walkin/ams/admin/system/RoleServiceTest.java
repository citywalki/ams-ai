package pro.walkin.ams.admin.system;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.quarkus.test.component.QuarkusComponentTest;
import io.quarkus.test.InjectMock;
import jakarta.inject.Inject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import pro.walkin.ams.common.exception.BusinessException;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;
import pro.walkin.ams.common.security.TenantContext;

@QuarkusComponentTest
class RoleServiceTest {

    @Inject
    RoleService roleService;

    @InjectMock
    Role.Repo roleRepo;

    @InjectMock
    Permission.Repo permissionRepo;

    @InjectMock
    User.Repo userRepo;

    @BeforeEach
    void setUp() {
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Nested
    @DisplayName("Injection")
    class Injection {
        
        @Test
        @DisplayName("should be injectable")
        void shouldBeInjectable() {
            assertThat(roleService).isNotNull();
        }
    }
    
    @Nested
    @DisplayName("findAll without tenant context")
    class FindAll {
        
        @Test
        @DisplayName("should return empty list when no tenant context")
        void shouldReturnEmptyWhenNoTenantContext() {
            var result = roleService.findAll(0, 10);
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("createRole")
    class CreateRole {

        @Test
        @DisplayName("should create role successfully when code is unique in tenant")
        void shouldCreateRoleSuccessfullyWhenCodeIsUniqueInTenant() {
            TenantContext.setCurrentTenantId(100L);
            Role role = new Role();
            role.code = "OPERATOR";
            role.tenant = 100L;

            when(roleRepo.findByCode("OPERATOR")).thenReturn(java.util.Optional.empty());

            Role result = roleService.createRole(role);

            assertThat(result).isSameAs(role);
        }

        @Test
        @DisplayName("should fail when duplicate code exists in same tenant")
        void shouldFailWhenDuplicateCodeExistsInSameTenant() {
            TenantContext.setCurrentTenantId(100L);
            Role role = new Role();
            role.code = "OPERATOR";
            role.tenant = 100L;

            Role existing = new Role();
            existing.code = "OPERATOR";
            existing.tenant = 100L;

            when(roleRepo.findByCode("OPERATOR")).thenReturn(java.util.Optional.of(existing));

            assertThatThrownBy(() -> roleService.createRole(role))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Role code already exists");
        }
    }

    @Nested
    @DisplayName("count without tenant context")
    class Count {
        
        @Test
        @DisplayName("should return zero when no tenant context")
        void shouldReturnZeroWhenNoTenantContext() {
            long count = roleService.count();
            assertThat(count).isZero();
        }
    }

    @Nested
    @DisplayName("deleteRole")
    class DeleteRole {

        @Test
        @DisplayName("should fail when role is assigned to users")
        void shouldFailWhenRoleIsAssignedToUsers() {
            long roleId = 99L;
            when(userRepo.count("roles.id", roleId)).thenReturn(1L);

            assertThatThrownBy(() -> roleService.deleteRole(roleId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cannot be deleted");
        }

        @Test
        @DisplayName("should delete role when no users are assigned")
        void shouldDeleteRoleWhenNoUsersAreAssigned() {
            long roleId = 100L;
            when(userRepo.count("roles.id", roleId)).thenReturn(0L);

            roleService.deleteRole(roleId);

            verify(roleRepo).deleteById(roleId);
        }
    }
}
