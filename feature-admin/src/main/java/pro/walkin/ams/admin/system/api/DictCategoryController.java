package pro.walkin.ams.admin.system.api;

import io.iamcyw.tower.messaging.gateway.MessageGateway;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.admin.system.command.dict.category.*;
import pro.walkin.ams.admin.system.command.dict.item.CreateDictItemCommand;
import pro.walkin.ams.admin.system.query.DictCategoryQuery;
import pro.walkin.ams.admin.system.query.DictItemQuery;
import pro.walkin.ams.common.dto.DictCategoryDto;
import pro.walkin.ams.common.dto.DictCategoryResponse;
import pro.walkin.ams.common.dto.DictItemDto;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.common.security.annotation.RequireRole;

import java.util.List;

@Path("/api/system/dict/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DictCategoryController {

  @Inject DictCategoryQuery categoryQuery;

  @Inject MessageGateway messageGateway;

  @Inject DictItemQuery itemQuery;

  @GET
  public Response list() {
    Long tenantId = TenantContext.getCurrentTenantId();
    List<DictCategoryResponse> categories = categoryQuery.findAllAsDto(tenantId);
    return Response.ok(categories).build();
  }

  @GET
  @Path("/{id}")
  public Response getById(@PathParam("id") Long id) {
    Long tenantId = TenantContext.getCurrentTenantId();
    return Response.ok(categoryQuery.findByIdAsDto(id, tenantId)).build();
  }

  @POST
  @Path("/{id}/items")
  @RequireRole("ADMIN")
  public Response createItem(@PathParam("id") Long categoryId, DictItemDto dto) {
    Long tenantId = TenantContext.getCurrentTenantId();
    messageGateway.send(
        new CreateDictItemCommand(
            categoryId,
            dto.parentId(),
            dto.code(),
            dto.name(),
            dto.value(),
            dto.sort(),
            String.valueOf(dto.status()),
            dto.remark(),
            tenantId));
    // Query the created item by code
    return ResponseBuilder.of(
        itemQuery.findByCategoryIdAsDto(categoryId, tenantId).stream()
            .filter(item -> item.code().equals(dto.code()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Failed to create dict item")));
  }

  @POST
  @RequireRole("ADMIN")
  public Response create(DictCategoryDto dto) {
    Long tenantId = TenantContext.getCurrentTenantId();
    messageGateway.send(
        new CreateDictCategoryCommand(
            dto.code(),
            dto.name(),
            dto.description(),
            dto.sort(),
            String.valueOf(dto.status()),
            tenantId));
    // Query the created category by code
    return ResponseBuilder.of(
        categoryQuery.findByIdAsDto(
            categoryQuery.listByTenant(tenantId).stream()
                .filter(c -> c.code.equals(dto.code()))
                .findFirst()
                .map(c -> c.id)
                .orElseThrow(() -> new RuntimeException("Failed to create category")),
            tenantId));
  }

  @PUT
  @Path("/{id}")
  @RequireRole("ADMIN")
  public Response update(@PathParam("id") Long id, DictCategoryDto dto) {
    Long tenantId = TenantContext.getCurrentTenantId();
    messageGateway.send(
        new UpdateDictCategoryCommand(
            id,
            dto.code(),
            dto.name(),
            dto.description(),
            dto.sort(),
            String.valueOf(dto.status())));
    return ResponseBuilder.of(categoryQuery.findByIdAsDto(id, tenantId));
  }

  @DELETE
  @Path("/{id}")
  @RequireRole("ADMIN")
  public Response delete(@PathParam("id") Long id) {
    Long tenantId = TenantContext.getCurrentTenantId();
    messageGateway.send(new DeleteDictCategoryCommand(id, tenantId));
    return Response.noContent().build();
  }
}
