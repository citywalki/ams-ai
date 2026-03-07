package pro.walkin.ams.boot.client;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.Map;

@RegisterRestClient(configKey = "graphql-api")
@Path("/graphql")
public interface GraphQLClient {

  @POST
  @Consumes("application/json")
  @Produces("application/json")
  Response executeQuery(String token, Map<String, Object> query);
}
