package pro.walkin.ams.admin.system;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import pro.walkin.ams.security.service.MenuService;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.common.dto.*;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.common.security.annotation.RequireRole;
import pro.walkin.ams.security.service.RbacService;
import pro.walkin.ams.common.security.util.SecurityUtils;

@Path("/api/system/roles")
public class RoleController {

    @Inject
    RoleService roleService;

    @Inject
    MenuService menuService;

  @Inject RbacService rbacService;

  @GET
  @RequireRole("ADMIN")
  public Response findAll(
      @QueryParam("page") @DefaultValue("0") int page,
      @QueryParam("size") @DefaultValue("20") int size,
      @QueryParam("keyword") String keyword,
      @QueryParam("sortBy") @DefaultValue("createdAt") String sortBy,
      @QueryParam("sortOrder") @DefaultValue("DESC") String sortOrder) {

        List<Role> roles = roleService.findAll(page, size, keyword, sortBy, sortOrder);
        List<RoleResponseDto> roleDtos = roles.stream().map(this::convertToResponseDto).collect(Collectors.toList());
        long totalCount = roleService.count(keyword);
        long totalPages = (long) Math.ceil((double) totalCount / size);

        return ResponseBuilder.page(roleDtos, totalCount, totalPages, page, size);
    }

  @Path("/{id}")
  @GET
  @RequireRole("ADMIN")
  public Response findOne(@PathParam("id") Long id) {
        return ResponseBuilder.of(roleService.findById(id).map(this::convertToResponseDto));
    }

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
  @GET
  @RequireRole("ADMIN")
  public Response getRolePermissions(@PathParam("id") Long id) {
        List<Permission> permissions = roleService.getRolePermissions(id);
        List<PermissionResponseDto> permissionDtos = permissions.stream()
            .map(this::convertToPermissionResponseDto)
            .collect(Collectors.toList());
        
        return Response.ok(permissionDtos).build();
    }

  @Path("/{id}/permissions")
  @POST
  @RequireRole("ADMIN")
  public Response addPermissionToRole(@PathParam("id") Long roleId, PermissionDto permissionDto) {
        boolean success = roleService.addPermissionToRole(roleId, Long.valueOf(permissionDto.getCode()));
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

  /** 获取角色关联的菜单ID列表 */
  @Path("/{id}/menus")
  @GET
  @RequireRole("ADMIN")
  public Response getRoleMenus(@PathParam("id") Long id) {
    List<Long> menuIds = roleService.getRoleMenus(id);
    return Response.ok(Map.of("menuIds", menuIds)).build();
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

    private RoleResponseDto convertToResponseDto(Role role) {
        RoleResponseDto dto = new RoleResponseDto();
        dto.setId(role.id);
        dto.setCode(role.code);
        dto.setName(role.name);
        dto.setDescription(role.description);
        dto.setCreatedAt(role.createdAt);
        dto.setUpdatedAt(role.updatedAt);
        
        if (role.permissions != null) {
            List<PermissionResponseDto> permissionDtos = role.permissions.stream()
                .map(this::convertToPermissionResponseDto)
                .collect(Collectors.toList());
            dto.setPermissions(permissionDtos);
            dto.setPermissionIds(role.permissions.stream().map(permission -> permission.id).collect(Collectors.toList()));
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
