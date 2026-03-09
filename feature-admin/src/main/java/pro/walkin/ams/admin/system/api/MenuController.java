package pro.walkin.ams.admin.system.api;

import io.iamcyw.tower.messaging.gateway.MessageGateway;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.admin.system.command.menu.*;
import pro.walkin.ams.admin.system.query.MenuQuery;
import pro.walkin.ams.common.dto.MenuDto;
import pro.walkin.ams.common.dto.MenuResponseDto;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.common.security.annotation.RequireRole;
import pro.walkin.ams.common.security.util.SecurityUtils;

import java.util.List;

/** 菜单管理控制器 提供菜单的增删改查和用户菜单权限过滤功能 */
@Path("/api/system/menus")
@Produces(MediaType.APPLICATION_JSON)
public class MenuController {

  @Inject MenuQuery menuQuery;

  @Inject MessageGateway messageGateway;

  @GET
  public Response list(
      @QueryParam("page") @DefaultValue("0") int page,
      @QueryParam("size") @DefaultValue("20") int size) {
    Long tenantId = TenantContext.getCurrentTenantId();
    var menus = menuQuery.findAllAsDto(tenantId, page, size);
    long total = menuQuery.countByTenant(tenantId);
    return Response.ok(
            java.util.Map.of(
                "content", menus,
                "totalElements", total,
                "page", page,
                "size", size))
        .build();
  }

  @GET
  @Path("/{id}")
  public Response getById(@PathParam("id") Long id) {
    return Response.ok(menuQuery.findByIdAsDto(id)).build();
  }

  @POST
  @RequireRole("ADMIN")
  public Response create(MenuDto menuDto) {
    Long tenantId = TenantContext.getCurrentTenantId();
    messageGateway.send(
        new CreateMenuCommand(
            menuDto.key(),
            menuDto.label(),
            menuDto.route(),
            menuDto.icon(),
            menuDto.parentId(),
            menuDto.sortOrder(),
            "ACTIVE",
            tenantId));
    // Query the created menu by key and tenant
    return ResponseBuilder.of(
        menuQuery.findByIdAsDto(
            menuQuery
                .findByKeyAndTenant(menuDto.key(), tenantId)
                .map(m -> m.id)
                .orElseThrow(() -> new RuntimeException("Failed to create menu"))));
  }

  @Path("/{id}")
  @PUT
  @RequireRole("ADMIN")
  public Response update(@PathParam("id") Long id, MenuDto menuDto) {
    messageGateway.send(
        new UpdateMenuCommand(
            id,
            menuDto.key(),
            menuDto.label(),
            menuDto.route(),
            menuDto.icon(),
            menuDto.parentId(),
            menuDto.sortOrder(),
            "ACTIVE"));
    return ResponseBuilder.of(menuQuery.findByIdAsDto(id));
  }

  @Path("/{id}")
  @DELETE
  @RequireRole("ADMIN")
  public Response delete(@PathParam("id") Long id) {
    Long tenantId = TenantContext.getCurrentTenantId();
    messageGateway.send(new DeleteMenuCommand(id, tenantId));
    return Response.noContent().build();
  }

  @Path("/user")
  @GET
  public Response getUserMenus(@Context SecurityContext securityContext) {
    Long userId = SecurityUtils.getUserIdFromSecurityContext(securityContext);
    Long tenantId = TenantContext.getCurrentTenantId();
    List<MenuResponseDto> userMenus = menuQuery.getUserMenus(userId, tenantId);
    return ResponseBuilder.of(userMenus);
  }
}
