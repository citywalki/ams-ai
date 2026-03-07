package pro.walkin.ams.boot.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.Map;

@RegisterRestClient(configKey = "user-api")
@Path("/api/system/users")
public interface UserApiClient {

  @GET
  @Produces("application/json")
  Response listUsers(
      @HeaderParam("Authorization") String token, @HeaderParam("X-Tenant-Id") String tenantId);

  @POST
  @Consumes("application/json")
  @Produces("application/json")
  Response createUser(
      @HeaderParam("Authorization") String token,
      @HeaderParam("X-Tenant-Id") String tenantId,
      Map<String, Object> userData);

  @GET
  @Path("/{id}")
  @Produces("application/json")
  Response getUser(
      @HeaderParam("Authorization") String token,
      @HeaderParam("X-Tenant-Id") String tenantId,
      @PathParam("id") Long id);

  @PUT
  @Path("/{id}")
  @Consumes("application/json")
  @Produces("application/json")
  Response updateUser(
      @HeaderParam("Authorization") String token,
      @HeaderParam("X-Tenant-Id") String tenantId,
      @PathParam("id") Long id,
      Map<String, Object> userData);

  @DELETE
  @Path("/{id}")
  Response deleteUser(
      @HeaderParam("Authorization") String token,
      @HeaderParam("X-Tenant-Id") String tenantId,
      @PathParam("id") Long id);
}
