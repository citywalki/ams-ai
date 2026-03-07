package pro.walkin.ams.boot.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.Map;

@RegisterRestClient(configKey = "auth-api")
@Path("/api/auth")
public interface AuthApiClient {

  @POST
  @Path("/login")
  @Consumes("application/json")
  @Produces("application/json")
  Response login(Map<String, String> credentials);

  @POST
  @Path("/logout")
  Response logout(@HeaderParam("Authorization") String token);

  @POST
  @Path("/refresh")
  @Consumes("application/json")
  @Produces("application/json")
  Response refreshToken(Map<String, String> request);

  @GET
  @Path("/me")
  @Produces("application/json")
  Response getCurrentUser(@HeaderParam("Authorization") String token);
}
