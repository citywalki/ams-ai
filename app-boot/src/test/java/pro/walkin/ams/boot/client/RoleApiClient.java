package pro.walkin.ams.boot.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.Map;

@RegisterRestClient(configKey = "role-api")
@Path("/api/system/roles")
public interface RoleApiClient {

  @GET
  @Produces("application/json")
  Response listRoles(
      @HeaderParam("Authorization") String token, @HeaderParam("X-Tenant-Id") String tenantId);

  @POST
  @Consumes("application/json")
  @Produces("application/json")
  Response createRole(
      @HeaderParam("Authorization") String token,
      @HeaderParam("X-Tenant-Id") String tenantId,
      Map<String, Object> roleData);

  @GET
  @Path("/{id}")
  @Produces("application/json")
  Response getRole(
      @HeaderParam("Authorization") String token,
      @HeaderParam("X-Tenant-Id") String tenantId,
      @PathParam("id") Long id);

  @PUT
  @Path("/{id}")
  @Consumes("application/json")
  @Produces("application/json")
  Response updateRole(
      @HeaderParam("Authorization") String token,
      @HeaderParam("X-Tenant-Id") String tenantId,
      @PathParam("id") Long id,
      Map<String, Object> roleData);

  @DELETE
  @Path("/{id}")
  Response deleteRole(
      @HeaderParam("Authorization") String token,
      @HeaderParam("X-Tenant-Id") String tenantId,
      @PathParam("id") Long id);

  @POST
  @Path("/{id}/permissions")
  @Consumes("application/json")
  Response addPermissionToRole(
      @HeaderParam("Authorization") String token,
      @HeaderParam("X-Tenant-Id") String tenantId,
      @PathParam("id") Long roleId,
      Map<String, Object> permissionData);
}
