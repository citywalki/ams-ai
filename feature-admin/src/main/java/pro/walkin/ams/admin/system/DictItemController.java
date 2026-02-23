package pro.walkin.ams.admin.system;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.common.dto.DictItemDto;
import pro.walkin.ams.common.dto.DictItemResponse;
import pro.walkin.ams.security.TenantContext;
import pro.walkin.ams.security.annotation.RequireRole;

@Path("/api/system/dict")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DictItemController {

    @Inject
    DictItemService itemService;

    @GET
    @Path("/categories/{categoryId}/items")
    @RequireRole("ADMIN")
    public Response findByCategory(@PathParam("categoryId") Long categoryId) {
        Long tenantId = TenantContext.getCurrentTenantId();
        List<DictItemResponse> items = itemService.getByCategoryId(categoryId, tenantId);
        return ResponseBuilder.of(items);
    }

    @GET
    @Path("/categories/{categoryId}/items/tree")
    @RequireRole("ADMIN")
    public Response findTreeByCategory(@PathParam("categoryId") Long categoryId) {
        Long tenantId = TenantContext.getCurrentTenantId();
        List<DictItemResponse> items = itemService.getTreeByCategoryId(categoryId, tenantId);
        return ResponseBuilder.of(items);
    }

    @GET
    @Path("/items/{id}")
    @RequireRole("ADMIN")
    public Response findById(@PathParam("id") Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return ResponseBuilder.of(itemService.getById(id, tenantId));
    }

    @POST
    @Path("/categories/{categoryId}/items")
    @RequireRole("ADMIN")
    public Response create(@PathParam("categoryId") Long categoryId, DictItemDto dto) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return ResponseBuilder.of(itemService.create(dto, tenantId));
    }

    @PUT
    @Path("/items/{id}")
    @RequireRole("ADMIN")
    public Response update(@PathParam("id") Long id, DictItemDto dto) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return ResponseBuilder.of(itemService.update(id, dto, tenantId));
    }

    @DELETE
    @Path("/items/{id}")
    @RequireRole("ADMIN")
    public Response delete(@PathParam("id") Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        itemService.delete(id, tenantId);
        return Response.noContent().build();
    }
}
