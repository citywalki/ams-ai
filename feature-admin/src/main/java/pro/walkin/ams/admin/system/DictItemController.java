package pro.walkin.ams.admin.system;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.common.dto.DictItemDto;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.common.security.annotation.RequireRole;

@Path("/api/system/dict")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DictItemController {

  @Inject DictItemService itemService;

  @GET
  @Path("/items/{id}")
  @RequireRole("ADMIN")
  public Response findById(@PathParam("id") Long id) {
    Long tenantId = TenantContext.getCurrentTenantId();
    return ResponseBuilder.of(itemService.getById(id, tenantId));
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
