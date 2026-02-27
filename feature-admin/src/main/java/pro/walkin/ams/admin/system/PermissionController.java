package pro.walkin.ams.admin.system;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.common.dto.*;
import pro.walkin.ams.persistence.entity.system.Menu;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Permission.Repo;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.common.security.annotation.RequireRole;
import pro.walkin.ams.security.service.MenuService;
import pro.walkin.ams.security.service.RbacService;
import pro.walkin.ams.security.util.SecurityUtils;

@Path("/api/system/permissions")
public class PermissionController {

    @Inject
    PermissionService permissionService;

  @Inject RbacService rbacService;

  @Inject MenuService menuService;

  @Inject Repo permissionRepo;

  @GET
  @RequireRole("ADMIN")
  public Response findAll(
      @QueryParam("page") @DefaultValue("0") int page,
      @QueryParam("size") @DefaultValue("20") int size,
      @QueryParam("sortBy") @DefaultValue("createdAt") String sortBy,
      @QueryParam("sortOrder") @DefaultValue("DESC") String sortOrder) {

        List<Permission> permissions = permissionService.findAll(page, size, sortBy, sortOrder);
        List<PermissionResponseDto> permissionDtos = permissions.stream()
            .map(this::convertToResponseDto)
            .collect(Collectors.toList());
        long totalCount = permissionService.count();
        long totalPages = (long) Math.ceil((double) totalCount / size);

        return ResponseBuilder.page(permissionDtos, totalCount, totalPages, page, size);
    }

  @Path("/{id}")
  @GET
  @RequireRole("ADMIN")
  public Response findOne(@PathParam("id") Long id) {
        return ResponseBuilder.of(permissionService.findById(id).map(this::convertToResponseDto));
    }

  @POST
  @RequireRole("ADMIN")
  public Response create(PermissionDto permissionDto) {
        if (permissionService.findByCode(permissionDto.getCode()).isPresent()) {
            throw new WebApplicationException("Permission code already exists", Response.Status.CONFLICT);
        }

        Permission permission = new Permission();
        permission.code = permissionDto.getCode();
        permission.name = permissionDto.getName();
        permission.description = permissionDto.getDescription();
    permission.sortOrder = permissionDto.getSortOrder() != null ? permissionDto.getSortOrder() : 0;
    permission.buttonType =
        permissionDto.getButtonType() != null ? permissionDto.getButtonType() : "DEFAULT";
        permission.tenant = TenantContext.getCurrentTenantId();

    if (permissionDto.getMenuId() != null) {
      Menu menu = menuService.findById(permissionDto.getMenuId());
      if (menu != null) {
        permission.menu = menu;
      }
    }

        Permission savedPermission = permissionService.createPermission(permission);

        return Response.status(Response.Status.CREATED).entity(convertToResponseDto(savedPermission)).build();
    }

  @Path("/{id}")
  @PUT
  @RequireRole("ADMIN")
  public Response update(@PathParam("id") Long id, PermissionDto permissionDto) {
        Permission permission = permissionService.findById(id).orElse(null);
        if (permission == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        if (!permission.code.equals(permissionDto.getCode())) {
            if (permissionService.findByCode(permissionDto.getCode()).isPresent()) {
                throw new WebApplicationException("Permission code already exists", Response.Status.CONFLICT);
            }
        }

        permission.code = permissionDto.getCode();
        permission.name = permissionDto.getName();
        permission.description = permissionDto.getDescription();
    permission.sortOrder = permissionDto.getSortOrder() != null ? permissionDto.getSortOrder() : 0;
    permission.buttonType =
        permissionDto.getButtonType() != null ? permissionDto.getButtonType() : "DEFAULT";

    if (permissionDto.getMenuId() != null) {
      Menu menu = menuService.findById(permissionDto.getMenuId());
      if (menu != null) {
        permission.menu = menu;
      }
    } else {
      permission.menu = null;
    }

        Permission updatedPermission = permissionService.updatePermission(id, permission);
        return Response.ok(convertToResponseDto(updatedPermission)).build();
    }

  @Path("/{id}")
  @DELETE
  @RequireRole("ADMIN")
  public Response delete(@PathParam("id") Long id) {
        permissionService.deletePermission(id);
        return Response.noContent().build();
    }

  @Path("/user")
  @GET
  public Response getUserPermissions(@Context SecurityContext securityContext) {
    Long userId = SecurityUtils.getUserIdFromSecurityContext(securityContext);
    Long tenantId = TenantContext.getCurrentTenantId();
    Set<String> userPermissions = rbacService.getUserPermissions(userId, tenantId);
    return Response.ok(userPermissions).build();
  }

  @Path("/menu/{menuId}")
  @GET
  @RequireRole("ADMIN")
  public Response getMenuPermissions(@PathParam("menuId") Long menuId) {
    List<Permission> permissions = permissionRepo.listByMenuId(menuId);
    List<PermissionResponseDto> permissionDtos =
        permissions.stream().map(this::convertToResponseDto).collect(Collectors.toList());
    return Response.ok(permissionDtos).build();
  }

  @Path("/user/menu/{menuCode}")
  @GET
  public Response getUserMenuPermissions(
      @PathParam("menuCode") String menuCode, @Context SecurityContext securityContext) {
    Long userId = SecurityUtils.getUserIdFromSecurityContext(securityContext);
    Long tenantId = TenantContext.getCurrentTenantId();

    Menu menu = menuService.findByKey(menuCode);
    if (menu == null) {
      return Response.ok(Collections.emptyList()).build();
    }

    Set<String> userRoles = rbacService.getUserRoles(userId, tenantId);
    if (menu.rolesAllowed == null
        || menu.rolesAllowed.isEmpty()
        || menu.rolesAllowed.stream().anyMatch(userRoles::contains)) {
      Set<String> userPermissions = rbacService.getUserPermissions(userId, tenantId);
      List<String> menuButtons =
          menu.buttonPermissions.stream()
              .filter(perm -> userPermissions.contains(perm.code))
              .map(perm -> perm.code)
              .collect(Collectors.toList());
      return Response.ok(menuButtons).build();
    }

    return Response.ok(Collections.emptyList()).build();
  }

    private PermissionResponseDto convertToResponseDto(Permission permission) {
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
