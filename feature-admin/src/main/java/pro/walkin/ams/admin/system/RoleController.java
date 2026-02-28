package pro.walkin.ams.admin.system;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import pro.walkin.ams.admin.system.service.MenuService;
import pro.walkin.ams.admin.system.service.RbacService;
import pro.walkin.ams.common.dto.*;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.common.security.annotation.RequireRole;
import pro.walkin.ams.common.security.util.SecurityUtils;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Role;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Path("/api/system/roles")
public class RoleController {

  @Inject RoleService roleService;

  @Inject MenuService menuService;

  @Inject RbacService rbacService;

  @POST
  @RequireRole("ADMIN")
  public Response create(RoleDto roleDto) {
    if (roleService.findByCode(roleDto.getCode()).isPresent()) {
      throw new WebApplicationException("Role code already exists", Response.Status.CONFLICT);
    }

    Role role = new Role();
    role.code = roleDto.getCode();
    role.name = roleDto.getName();
    role.description = roleDto.getDescription();
    role.tenant = TenantContext.getCurrentTenantId();

    Role savedRole = roleService.createRole(role);

    if (roleDto.getPermissionIds() != null && !roleDto.getPermissionIds().isEmpty()) {
      for (Long permissionId : roleDto.getPermissionIds()) {
        roleService.addPermissionToRole(savedRole.id, permissionId);
      }
    }

    return Response.status(Response.Status.CREATED).entity(convertToResponseDto(savedRole)).build();
  }

  @Path("/{id}")
  @PUT
  @RequireRole("ADMIN")
  @Transactional
  public Response update(@PathParam("id") Long id, RoleDto roleDto) {
    Role role = roleService.findById(id).orElse(null);
    if (role == null) {
      return Response.status(Response.Status.NOT_FOUND).build();
    }

    if (!role.code.equals(roleDto.getCode())) {
      if (roleService.findByCode(roleDto.getCode()).isPresent()) {
        throw new WebApplicationException("Role code already exists", Response.Status.CONFLICT);
      }
    }

    role.code = roleDto.getCode();
    role.name = roleDto.getName();
    role.description = roleDto.getDescription();

    Role updatedRole = roleService.updateRole(id, role);
    roleService.assignPermissions(id, roleDto.getPermissionIds());
    return Response.ok(convertToResponseDto(updatedRole)).build();
  }

  @Path("/{id}")
  @DELETE
  @RequireRole("ADMIN")
  public Response delete(@PathParam("id") Long id) {
    roleService.deleteRole(id);
    return Response.noContent().build();
  }

  @Path("/{id}/permissions")
  @POST
  @RequireRole("ADMIN")
  public Response addPermissionToRole(@PathParam("id") Long roleId, PermissionDto permissionDto) {
    boolean success =
        roleService.addPermissionToRole(roleId, Long.valueOf(permissionDto.getCode()));
    if (success) {
      return Response.ok().build();
    }
    return Response.status(Response.Status.NOT_FOUND).build();
  }

  @Path("/{roleId}/permissions/{permissionId}")
  @DELETE
  @RequireRole("ADMIN")
  public Response removePermissionFromRole(
      @PathParam("roleId") Long roleId, @PathParam("permissionId") Long permissionId) {
    boolean removed = roleService.removePermissionFromRole(roleId, permissionId);
    if (removed) {
      return Response.noContent().build();
    }
    return Response.status(Response.Status.NOT_FOUND).build();
  }

  /** 获取当前用户的角色列表 */
  @Path("/user")
  @GET
  public Response getUserRoles(@Context SecurityContext securityContext) {
    Long userId = SecurityUtils.getUserIdFromSecurityContext(securityContext);
    Long tenantId = TenantContext.getCurrentTenantId();
    Set<String> userRoles = rbacService.getUserRoles(userId, tenantId);
    return Response.ok(userRoles).build();
  }

  /** 更新角色的菜单访问权限 */
  @Path("/{id}/menus")
  @PUT
  @RequireRole("ADMIN")
  public Response updateRoleMenus(@PathParam("id") Long id, Map<String, List<Long>> request) {
    List<Long> menuIds = request.get("menuIds");
    roleService.updateRoleMenus(id, menuIds);

    // 失效菜单缓存
    menuService.invalidateAllMenuCaches();

    return Response.ok().build();
  }

  /** 分配用户到角色 */
  @Path("/{roleId}/users")
  @POST
  @RequireRole("ADMIN")
  public Response assignUserToRole(@PathParam("roleId") Long roleId, AssignUserToRoleDto dto) {
    boolean success = roleService.assignUserToRole(roleId, dto.getUserId());
    if (success) {
      return Response.ok().build();
    }
    return Response.status(Response.Status.NOT_FOUND).build();
  }

  /** 从角色中移除用户 */
  @Path("/{roleId}/users/{userId}")
  @DELETE
  @RequireRole("ADMIN")
  public Response removeUserFromRole(
      @PathParam("roleId") Long roleId, @PathParam("userId") Long userId) {
    boolean removed = roleService.removeUserFromRole(roleId, userId);
    if (removed) {
      return Response.noContent().build();
    }
    return Response.status(Response.Status.NOT_FOUND).build();
  }

  private RoleResponseDto convertToResponseDto(Role role) {
    RoleResponseDto dto = new RoleResponseDto();
    dto.setId(role.id);
    dto.setCode(role.code);
    dto.setName(role.name);
    dto.setDescription(role.description);
    dto.setCreatedAt(role.createdAt);
    dto.setUpdatedAt(role.updatedAt);

    if (role.permissions != null) {
      List<PermissionResponseDto> permissionDtos =
          role.permissions.stream()
              .map(this::convertToPermissionResponseDto)
              .collect(Collectors.toList());
      dto.setPermissions(permissionDtos);
      dto.setPermissionIds(
          role.permissions.stream().map(permission -> permission.id).collect(Collectors.toList()));
    }

    return dto;
  }

  private PermissionResponseDto convertToPermissionResponseDto(Permission permission) {
    PermissionResponseDto dto = new PermissionResponseDto();
    dto.setId(permission.id);
    dto.setCode(permission.code);
    dto.setName(permission.name);
    dto.setDescription(permission.description);
    dto.setSortOrder(permission.sortOrder);
    dto.setButtonType(permission.buttonType);
    if (permission.menu != null) {
      dto.setMenuId(permission.menu.id);
      dto.setMenuName(permission.menu.label);
    }
    dto.setCreatedAt(permission.createdAt);
    dto.setUpdatedAt(permission.updatedAt);

    return dto;
  }
}
