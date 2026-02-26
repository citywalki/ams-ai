package pro.walkin.ams.admin.system;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import java.util.List;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.common.dto.MenuDto;
import pro.walkin.ams.common.dto.MenuResponseDto;
import pro.walkin.ams.security.TenantContext;
import pro.walkin.ams.security.annotation.RequireRole;
import pro.walkin.ams.security.service.MenuService;
import pro.walkin.ams.security.util.SecurityUtils;

/**
 * 菜单管理控制器
 * 提供菜单的增删改查和用户菜单权限过滤功能
 */
@Path("/api/system/menus")
@Produces(MediaType.APPLICATION_JSON)
public class MenuController {

    @Inject
    MenuService menuService;

  // 注意: 不需要显式注入JWTCallerPrincipal，而是通过SecurityContext获取

  /** 获取所有菜单（分页） */
  @GET
  @RequireRole("ADMIN")
  public Response findAll(
      @QueryParam("page") @DefaultValue("0") int page,
      @QueryParam("size") @DefaultValue("20") int size,
      @QueryParam("parentId") Long parentId,
      @QueryParam("root") @DefaultValue("false") boolean root) {

        Long tenantId = TenantContext.getCurrentTenantId();

        List<MenuResponseDto> menus;
        if (root) {
          // 获取顶级菜单（parentId IS NULL）
          menus = menuService.getMenusByParentId(null, tenantId);
        } else if (parentId != null) {
          menus = menuService.getMenusByParentId(parentId, tenantId);
        } else {
          menus = menuService.getAllMenus(tenantId);
        }

        long totalCount = menus.size();
        long totalPages = Math.max(1, (totalCount + size - 1) / size);

        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, menus.size());
        List<MenuResponseDto> pagedMenus = menus.subList(startIndex, endIndex);

        return ResponseBuilder.page(pagedMenus, totalCount, totalPages, page, size);
    }

  /** 获取所有文件夹 */
  @Path("/folders")
  @GET
  @RequireRole("ADMIN")
  public Response getFolders() {
        Long tenantId = TenantContext.getCurrentTenantId();
        List<MenuResponseDto> folders = menuService.getFolders(tenantId);
        return ResponseBuilder.of(folders);
    }

  /** 获取完整菜单树（用于角色菜单关联） */
  @Path("/tree")
  @GET
  @RequireRole("ADMIN")
  public Response getMenuTree() {
        Long tenantId = TenantContext.getCurrentTenantId();
        List<MenuResponseDto> menuTree = menuService.getMenuTree(tenantId);
        return ResponseBuilder.of(menuTree);
    }

  /** 获取单个菜单 */
  @Path("/{id}")
  @GET
  @RequireRole("ADMIN")
  public Response findOne(@PathParam("id") Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return ResponseBuilder.of(menuService.getMenuById(id, tenantId));
    }

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

    /**
     * 获取当前用户的菜单（基于权限过滤）
     */
    @Path("/user")
    @GET
    public Response getUserMenus(@Context SecurityContext securityContext) {
    // 从安全上下文获取用户ID
    Long userId = SecurityUtils.getUserIdFromSecurityContext(securityContext);

        // 获取租户ID
        Long tenantId = TenantContext.getCurrentTenantId();
        
        // 获取用户有权限的菜单
        List<MenuResponseDto> userMenus = menuService.getUserMenus(userId, tenantId);
        
        return ResponseBuilder.of(userMenus);
    }


}