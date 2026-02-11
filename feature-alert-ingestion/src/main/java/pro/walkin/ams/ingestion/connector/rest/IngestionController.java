package pro.walkin.ams.ingestion.connector.rest;

import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import org.jboss.resteasy.reactive.RestPath;
import pro.walkin.ams.ingestion.IngestionLogic;

@Path("/api/ingest")
public class IngestionController {

  private final IngestionLogic logic;

  public IngestionController(IngestionLogic logic) {
    this.logic = logic;
  }

  @POST
  @Path(("/{sourceId}"))
  @RunOnVirtualThread
  public String hello(@RestPath("sourceId") String sourceId, String rawPayload) {
    logic.process(sourceId, rawPayload);

    // 3. 立即返回，保持高并发连接能力
    return "ACCEPTED";
  }
}
