package pro.walkin.ams.admin.system.api;

import io.iamcyw.tower.messaging.gateway.MessageGateway;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import pro.walkin.ams.admin.system.command.permission.*;
import pro.walkin.ams.admin.system.query.MenuQuery;
import pro.walkin.ams.admin.system.query.PermissionQuery;
import pro.walkin.ams.admin.system.query.RbacQuery;
import pro.walkin.ams.common.dto.PermissionDto;
import pro.walkin.ams.common.dto.PermissionResponseDto;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.common.security.annotation.RequireRole;
import pro.walkin.ams.common.security.util.SecurityUtils;
import pro.walkin.ams.persistence.entity.system.Menu;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Path("/api/system/permissions")
public class PermissionController {

  @Inject PermissionQuery permissionQuery;

  @Inject MenuQuery menuQuery;

  @Inject MessageGateway messageGateway;

  @Inject RbacQuery rbacQuery;

  @GET
  public Response list(
      @QueryParam("sortBy") String sortBy,
      @QueryParam("sortOrder") @DefaultValue("DESC") String sortOrder,
      @QueryParam("page") @DefaultValue("0") int page,
      @QueryParam("size") @DefaultValue("20") int size) {

    var permissions = permissionQuery.findAllAsDto(sortBy, sortOrder, page, size);
    long total = permissionQuery.count();

    return Response.ok(
            Map.of(
                "content", permissions,
                "totalElements", total,
                "page", page,
                "size", size))
        .build();
  }

  @GET
  @Path("/{id}")
  public Response getById(@PathParam("id") Long id) {
    return Response.ok(permissionQuery.findByIdAsDto(id)).build();
  }

  @POST
  @RequireRole("ADMIN")
  public Response create(PermissionDto permissionDto) {
    if (permissionQuery.findByCodeAsDto(permissionDto.getCode()).isPresent()) {
      throw new WebApplicationException("Permission code already exists", Response.Status.CONFLICT);
    }

    messageGateway.send(
        new CreatePermissionCommand(
            permissionDto.getCode(),
            permissionDto.getName(),
            permissionDto.getDescription(),
            permissionDto.getMenuId(),
            permissionDto.getSortOrder() != null ? permissionDto.getSortOrder() : 0,
            permissionDto.getButtonType() != null ? permissionDto.getButtonType() : "DEFAULT"));

    // Query the created permission by code
    PermissionResponseDto savedPermission =
        permissionQuery
            .findByCodeAsDto(permissionDto.getCode())
            .orElseThrow(() -> new RuntimeException("Failed to create permission"));

    return Response.status(Response.Status.CREATED).entity(savedPermission).build();
  }

  @Path("/{id}")
  @PUT
  @RequireRole("ADMIN")
  public Response update(@PathParam("id") Long id, PermissionDto permissionDto) {
    PermissionResponseDto existing = permissionQuery.findByIdAsDto(id);

    if (!existing.getCode().equals(permissionDto.getCode())) {
      if (permissionQuery.findByCodeAsDto(permissionDto.getCode()).isPresent()) {
        throw new WebApplicationException(
            "Permission code already exists", Response.Status.CONFLICT);
      }
    }

    messageGateway.send(
        new UpdatePermissionCommand(
            id,
            permissionDto.getCode(),
            permissionDto.getName(),
            permissionDto.getDescription(),
            permissionDto.getMenuId(),
            permissionDto.getSortOrder() != null ? permissionDto.getSortOrder() : 0,
            permissionDto.getButtonType() != null ? permissionDto.getButtonType() : "DEFAULT"));

    return Response.ok(permissionQuery.findByIdAsDto(id)).build();
  }

  @Path("/{id}")
  @DELETE
  @RequireRole("ADMIN")
  public Response delete(@PathParam("id") Long id) {
    messageGateway.send(new DeletePermissionCommand(id));
    return Response.noContent().build();
  }

  @Path("/user")
  @GET
  public Response getUserPermissions(@Context SecurityContext securityContext) {
    Long userId = SecurityUtils.getUserIdFromSecurityContext(securityContext);
    Long tenantId = TenantContext.getCurrentTenantId();
    Set<String> userPermissions = rbacQuery.getUserPermissions(userId, tenantId);
    return Response.ok(userPermissions).build();
  }

  @Path("/user/menu/{menuCode}")
  @GET
  public Response getUserMenuPermissions(
      @PathParam("menuCode") String menuCode, @Context SecurityContext securityContext) {
    Long userId = SecurityUtils.getUserIdFromSecurityContext(securityContext);
    Long tenantId = TenantContext.getCurrentTenantId();

    Menu menu = menuQuery.findByKey(menuCode);
    if (menu == null) {
      return Response.ok(Collections.emptyList()).build();
    }

    Set<String> userRoles = rbacQuery.getUserRoles(userId, tenantId);
    if (menu.rolesAllowed == null
        || menu.rolesAllowed.isEmpty()
        || menu.rolesAllowed.stream().anyMatch(userRoles::contains)) {
      Set<String> userPermissions = rbacQuery.getUserPermissions(userId, tenantId);
      List<String> menuButtons =
          menu.buttonPermissions.stream()
              .filter(perm -> userPermissions.contains(perm.code))
              .map(perm -> perm.code)
              .collect(Collectors.toList());
      return Response.ok(menuButtons).build();
    }

    return Response.ok(Collections.emptyList()).build();
  }
}
