package pro.walkin.ams.admin.system;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.common.dto.DictCategoryDto;
import pro.walkin.ams.common.dto.DictCategoryResponse;
import pro.walkin.ams.security.TenantContext;
import pro.walkin.ams.security.annotation.RequireRole;

@Path("/api/system/dict/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DictCategoryController {

    @Inject
    DictCategoryService categoryService;

    @GET
    @RequireRole("ADMIN")
    public Response findAll() {
        Long tenantId = TenantContext.getCurrentTenantId();
        List<DictCategoryResponse> categories = categoryService.getAllCategories(tenantId);
        return ResponseBuilder.of(categories);
    }

    @GET
    @Path("/{id}")
    @RequireRole("ADMIN")
    public Response findById(@PathParam("id") Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return ResponseBuilder.of(categoryService.getById(id, tenantId));
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
