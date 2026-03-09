package pro.walkin.ams.admin.system.api;

import io.iamcyw.tower.messaging.gateway.MessageGateway;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import pro.walkin.ams.admin.system.command.role.*;
import pro.walkin.ams.admin.system.query.RbacQuery;
import pro.walkin.ams.admin.system.query.RoleQuery;
import pro.walkin.ams.common.dto.AssignUserToRoleDto;
import pro.walkin.ams.common.dto.RoleDto;
import pro.walkin.ams.common.dto.RoleResponseDto;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.common.security.annotation.RequireRole;
import pro.walkin.ams.common.security.util.SecurityUtils;
import pro.walkin.ams.persistence.entity.system.Role;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Path("/api/system/roles")
public class RoleController {

  @Inject RoleQuery roleQuery;

  @Inject MessageGateway messageGateway;

  @Inject RbacQuery rbacQuery;

  @GET
  public Response list(
      @QueryParam("keyword") String keyword,
      @QueryParam("sortBy") String sortBy,
      @QueryParam("sortOrder") @DefaultValue("DESC") String sortOrder,
      @QueryParam("page") @DefaultValue("0") int page,
      @QueryParam("size") @DefaultValue("20") int size) {

    var roles = roleQuery.findAllAsDto(keyword, sortBy, sortOrder, page, size);
    long total = roleQuery.count(keyword);

    return Response.ok(
            Map.of(
                "content", roles,
                "totalElements", total,
                "page", page,
                "size", size))
        .build();
  }

  @GET
  @Path("/{id}")
  public Response getById(@PathParam("id") Long id) {
    return Response.ok(roleQuery.findByIdAsDto(id)).build();
  }

  @POST
  @RequireRole("ADMIN")
  public Response create(RoleDto roleDto) {
    if (roleQuery.findByCodeAsDto(roleDto.getCode()).isPresent()) {
      throw new WebApplicationException("Role code already exists", Response.Status.CONFLICT);
    }

    messageGateway.send(
        new CreateRoleCommand(
            roleDto.getCode(),
            roleDto.getName(),
            roleDto.getDescription(),
            TenantContext.getCurrentTenantId()));

    // Query the created role by code
    Role savedRole =
        roleQuery
            .findByCode(roleDto.getCode())
            .orElseThrow(() -> new RuntimeException("Failed to create role"));

    if (roleDto.getPermissionIds() != null && !roleDto.getPermissionIds().isEmpty()) {
      messageGateway.send(
          new AssignRolePermissionsCommand(savedRole.id, roleDto.getPermissionIds()));
    }

    return Response.status(Response.Status.CREATED)
        .entity(roleQuery.findByIdAsDto(savedRole.id))
        .build();
  }

  @Path("/{id}")
  @PUT
  @RequireRole("ADMIN")
  public Response update(@PathParam("id") Long id, RoleDto roleDto) {
    RoleResponseDto existingRole = roleQuery.findByIdAsDto(id);

    if (!existingRole.getCode().equals(roleDto.getCode())) {
      if (roleQuery.findByCodeAsDto(roleDto.getCode()).isPresent()) {
        throw new WebApplicationException("Role code already exists", Response.Status.CONFLICT);
      }
    }

    messageGateway.send(
        new UpdateRoleCommand(id, roleDto.getCode(), roleDto.getName(), roleDto.getDescription()));

    messageGateway.send(new AssignRolePermissionsCommand(id, roleDto.getPermissionIds()));

    return Response.ok(roleQuery.findByIdAsDto(id)).build();
  }

  @Path("/{id}")
  @DELETE
  @RequireRole("ADMIN")
  public Response delete(@PathParam("id") Long id) {
    messageGateway.send(new DeleteRoleCommand(id));
    return Response.noContent().build();
  }

  @Path("/{id}/permissions")
  @PUT
  @RequireRole("ADMIN")
  public Response assignPermissions(@PathParam("id") Long roleId, Map<String, List<Long>> request) {
    messageGateway.send(new AssignRolePermissionsCommand(roleId, request.get("permissionIds")));
    return Response.ok().build();
  }

  @Path("/{roleId}/permissions/{permissionId}")
  @DELETE
  @RequireRole("ADMIN")
  public Response removePermissionFromRole(
      @PathParam("roleId") Long roleId, @PathParam("permissionId") Long permissionId) {
    // 获取当前权限列表并移除指定权限
    Role role = roleQuery.findById(roleId).orElse(null);
    if (role == null) {
      return Response.status(Response.Status.NOT_FOUND).build();
    }

    List<Long> remainingPermissions =
        role.permissions.stream()
            .filter(p -> !p.id.equals(permissionId))
            .map(p -> p.id)
            .collect(Collectors.toList());

    messageGateway.send(new AssignRolePermissionsCommand(roleId, remainingPermissions));
    return Response.noContent().build();
  }

  @Path("/user")
  @GET
  public Response getUserRoles(@Context SecurityContext securityContext) {
    Long userId = SecurityUtils.getUserIdFromSecurityContext(securityContext);
    Long tenantId = TenantContext.getCurrentTenantId();
    Set<String> userRoles = rbacQuery.getUserRoles(userId, tenantId);
    return Response.ok(userRoles).build();
  }

  @Path("/{id}/menus")
  @PUT
  @RequireRole("ADMIN")
  public Response updateRoleMenus(@PathParam("id") Long id, Map<String, List<Long>> request) {
    List<Long> menuIds = request.get("menuIds");
    messageGateway.send(
        new UpdateRoleMenusCommand(id, menuIds, TenantContext.getCurrentTenantId()));
    return Response.ok().build();
  }

  @Path("/{roleId}/users")
  @POST
  @RequireRole("ADMIN")
  public Response assignUserToRole(@PathParam("roleId") Long roleId, AssignUserToRoleDto dto) {
    messageGateway.send(new AssignUserToRoleCommand(roleId, dto.getUserId()));
    return Response.ok().build();
  }

  @Path("/{roleId}/users/{userId}")
  @DELETE
  @RequireRole("ADMIN")
  public Response removeUserFromRole(
      @PathParam("roleId") Long roleId, @PathParam("userId") Long userId) {
    messageGateway.send(new RemoveUserFromRoleCommand(roleId, userId));
    return Response.noContent().build();
  }
}
