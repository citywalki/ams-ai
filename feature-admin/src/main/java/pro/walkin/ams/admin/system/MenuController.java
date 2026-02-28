package pro.walkin.ams.admin.system;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.admin.system.service.MenuService;
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

  @Inject MenuService menuService;

  /** 创建菜单 */
  @POST
  @RequireRole("ADMIN")
  public Response create(MenuDto menuDto) {
    Long tenantId = TenantContext.getCurrentTenantId();
    MenuResponseDto createdMenu = menuService.createMenu(menuDto, tenantId);
    return ResponseBuilder.of(createdMenu);
  }

  /** 更新菜单 */
  @Path("/{id}")
  @PUT
  @RequireRole("ADMIN")
  public Response update(@PathParam("id") Long id, MenuDto menuDto) {
    Long tenantId = TenantContext.getCurrentTenantId();
    MenuResponseDto updatedMenu = menuService.updateMenu(id, menuDto, tenantId);
    return ResponseBuilder.of(updatedMenu);
  }

  /** 删除菜单 */
  @Path("/{id}")
  @DELETE
  @RequireRole("ADMIN")
  public Response delete(@PathParam("id") Long id) {
    Long tenantId = TenantContext.getCurrentTenantId();
    menuService.deleteMenu(id, tenantId);
    return Response.noContent().build();
  }

  /** 获取当前用户的菜单（基于权限过滤） */
  @Path("/user")
  @GET
  public Response getUserMenus(@Context SecurityContext securityContext) {
    Long userId = SecurityUtils.getUserIdFromSecurityContext(securityContext);
    Long tenantId = TenantContext.getCurrentTenantId();
    List<MenuResponseDto> userMenus = menuService.getUserMenus(userId, tenantId);
    return ResponseBuilder.of(userMenus);
  }
}
