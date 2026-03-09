package pro.walkin.ams.admin.system.api;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.admin.system.query.DictCategoryQuery;
import pro.walkin.ams.admin.system.query.DictItemQuery;
import pro.walkin.ams.common.dto.DictCategoryResponse;
import pro.walkin.ams.common.dto.DictItemResponse;
import pro.walkin.ams.common.security.TenantContext;

import java.util.List;

@Path("/api/dict")
@Produces(MediaType.APPLICATION_JSON)
public class DictPublicController {

  @Inject DictItemQuery itemQuery;

  @Inject DictCategoryQuery categoryQuery;

  @GET
  @Path("/{categoryCode}")
  public Response getByCategoryCode(@PathParam("categoryCode") String categoryCode) {
    Long tenantId = TenantContext.getCurrentTenantId();
    DictCategoryResponse category = findCategoryByCode(categoryCode, tenantId);
    if (category == null) {
      return Response.status(Response.Status.NOT_FOUND).build();
    }
    List<DictItemResponse> items = itemQuery.findByCategoryIdAsDto(category.id(), tenantId);
    return ResponseBuilder.of(items);
  }

  @GET
  @Path("/{categoryCode}/tree")
  public Response getTreeByCategoryCode(@PathParam("categoryCode") String categoryCode) {
    Long tenantId = TenantContext.getCurrentTenantId();
    DictCategoryResponse category = findCategoryByCode(categoryCode, tenantId);
    if (category == null) {
      return Response.status(Response.Status.NOT_FOUND).build();
    }
    List<DictItemResponse> items = itemQuery.findTreeByCategoryIdAsDto(category.id(), tenantId);
    return ResponseBuilder.of(items);
  }

  @GET
  @Path("/{categoryCode}/{itemCode}")
  public Response getItemValue(
      @PathParam("categoryCode") String categoryCode, @PathParam("itemCode") String itemCode) {
    Long tenantId = TenantContext.getCurrentTenantId();
    DictCategoryResponse category = findCategoryByCode(categoryCode, tenantId);
    if (category == null) {
      return Response.status(Response.Status.NOT_FOUND).build();
    }
    List<DictItemResponse> items = itemQuery.findByCategoryIdAsDto(category.id(), tenantId);
    DictItemResponse item =
        items.stream().filter(i -> i.code().equals(itemCode)).findFirst().orElse(null);
    if (item == null) {
      return Response.status(Response.Status.NOT_FOUND).build();
    }
    return ResponseBuilder.of(item.value());
  }

  private DictCategoryResponse findCategoryByCode(String code, Long tenantId) {
    return categoryQuery.findAllAsDto(tenantId).stream()
        .filter(c -> c.code().equals(code))
        .findFirst()
        .orElse(null);
  }
}
