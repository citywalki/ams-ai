package pro.walkin.ams.admin.system;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.common.dto.DictCategoryDto;
import pro.walkin.ams.common.dto.DictItemDto;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.common.security.annotation.RequireRole;

@Path("/api/system/dict/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DictCategoryController {

  @Inject DictCategoryService categoryService;

  @Inject DictItemService itemService;

  @POST
  @Path("/{id}/items")
  @RequireRole("ADMIN")
  public Response createItem(@PathParam("id") Long categoryId, DictItemDto dto) {
    Long tenantId = TenantContext.getCurrentTenantId();
    DictItemDto payload =
        dto == null
            ? null
            : new DictItemDto(
                categoryId,
                dto.parentId(),
                dto.code(),
                dto.name(),
                dto.value(),
                dto.sort(),
                dto.status(),
                dto.remark());
    return ResponseBuilder.of(itemService.create(payload, tenantId));
  }

  @POST
  @RequireRole("ADMIN")
  public Response create(DictCategoryDto dto) {
    Long tenantId = TenantContext.getCurrentTenantId();
    return ResponseBuilder.of(categoryService.create(dto, tenantId));
  }

  @PUT
  @Path("/{id}")
  @RequireRole("ADMIN")
  public Response update(@PathParam("id") Long id, DictCategoryDto dto) {
    Long tenantId = TenantContext.getCurrentTenantId();
    return ResponseBuilder.of(categoryService.update(id, dto, tenantId));
  }

  @DELETE
  @Path("/{id}")
  @RequireRole("ADMIN")
  public Response delete(@PathParam("id") Long id) {
    Long tenantId = TenantContext.getCurrentTenantId();
    categoryService.delete(id, tenantId);
    return Response.noContent().build();
  }
}
