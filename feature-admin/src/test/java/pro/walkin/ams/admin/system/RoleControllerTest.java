package pro.walkin.ams.admin.system;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.quarkus.test.InjectMock;
import io.quarkus.test.component.QuarkusComponentTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import pro.walkin.ams.common.dto.RoleDto;
import pro.walkin.ams.common.exception.BusinessException;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.admin.system.service.RbacService;

@QuarkusComponentTest
class RoleControllerTest {

  @Inject
  RoleController roleController;

  @InjectMock
  RoleService roleService;

  @InjectMock
  RbacService rbacService;

  @Nested
  @DisplayName("findAll")
  class FindAll {

    @Test
    @DisplayName("should support keyword and pagination")
    void shouldSupportKeywordAndPagination() {
      Role role = new Role();
      role.id = 1L;
      role.code = "ADMIN";
      role.name = "Administrator";
      role.tenant = 1L;

      when(roleService.findAll(0, 20, "adm", "createdAt", "DESC")).thenReturn(List.of(role));
      when(roleService.count("adm")).thenReturn(1L);

      Response response = roleController.findAll(0, 20, "adm", "createdAt", "DESC");

      assertThat(response.getStatus()).isEqualTo(Response.Status.OK.getStatusCode());
      assertThat(response.getHeaderString("X-Total-Count")).isEqualTo("1");
    }
  }

  @Nested
  @DisplayName("update")
  class Update {

    @Test
    @DisplayName("should save permissionIds on update")
    void shouldSavePermissionIdsOnUpdate() {
      Role existing = new Role();
      existing.id = 9L;
      existing.code = "OPERATOR";
      existing.name = "Operator";
      existing.tenant = 1L;

      RoleDto request = new RoleDto();
      request.setCode("OPERATOR");
      request.setName("Operator");
      request.setDescription("updated");
      request.setPermissionIds(List.of(11L, 22L));

      when(roleService.findById(9L)).thenReturn(java.util.Optional.of(existing));
      when(roleService.updateRole(9L, existing)).thenReturn(existing);

      Response response = roleController.update(9L, request);

      assertThat(response.getStatus()).isEqualTo(Response.Status.OK.getStatusCode());
      verify(roleService).assignPermissions(9L, List.of(11L, 22L));
    }
  }

  @Nested
  @DisplayName("delete")
  class Delete {

    @Test
    @DisplayName("should propagate business error when role is referenced")
    void shouldPropagateBusinessErrorWhenRoleIsReferenced() {
      when(roleService.findById(5L)).thenReturn(java.util.Optional.of(new Role()));
      doThrow(new BusinessException("Role is assigned to users and cannot be deleted"))
          .when(roleService)
          .deleteRole(5L);

      assertThatThrownBy(() -> roleController.delete(5L))
          .isInstanceOf(BusinessException.class)
          .hasMessageContaining("cannot be deleted");
    }
  }
}
