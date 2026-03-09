package pro.walkin.ams.admin.system.api;

import io.iamcyw.tower.messaging.gateway.MessageGateway;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.admin.system.command.dict.item.*;
import pro.walkin.ams.admin.system.query.DictItemQuery;
import pro.walkin.ams.common.dto.DictItemDto;
import pro.walkin.ams.common.dto.DictItemResponse;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.common.security.annotation.RequireRole;

import java.util.List;

@Path("/api/system/dict")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DictItemController {

  @Inject DictItemQuery itemQuery;

  @Inject MessageGateway messageGateway;

  @GET
  @Path("/categories/{categoryId}/items")
  public Response listByCategory(@PathParam("categoryId") Long categoryId) {
    Long tenantId = TenantContext.getCurrentTenantId();
    List<DictItemResponse> items = itemQuery.findByCategoryIdAsDto(categoryId, tenantId);
    return Response.ok(items).build();
  }

  @GET
  @Path("/categories/{categoryId}/items/tree")
  public Response getTreeByCategory(@PathParam("categoryId") Long categoryId) {
    Long tenantId = TenantContext.getCurrentTenantId();
    List<DictItemResponse> items = itemQuery.findTreeByCategoryIdAsDto(categoryId, tenantId);
    return Response.ok(items).build();
  }

  @GET
  @Path("/items/{id}")
  public Response getById(@PathParam("id") Long id) {
    Long tenantId = TenantContext.getCurrentTenantId();
    return Response.ok(itemQuery.findByIdAsDto(id, tenantId)).build();
  }

  @PUT
  @Path("/items/{id}")
  @RequireRole("ADMIN")
  public Response update(@PathParam("id") Long id, DictItemDto dto) {
    Long tenantId = TenantContext.getCurrentTenantId();
    messageGateway.send(
        new UpdateDictItemCommand(
            id,
            dto.parentId(),
            dto.code(),
            dto.name(),
            dto.value(),
            dto.sort(),
            String.valueOf(dto.status()),
            dto.remark()));
    return ResponseBuilder.of(itemQuery.findByIdAsDto(id, tenantId));
  }

  @DELETE
  @Path("/items/{id}")
  @RequireRole("ADMIN")
  public Response delete(@PathParam("id") Long id) {
    Long tenantId = TenantContext.getCurrentTenantId();
    messageGateway.send(new DeleteDictItemCommand(id, tenantId));
    return Response.noContent().build();
  }
}
