package pro.walkin.ams.ingestion.connector.rest;

import pro.walkin.ams.ingestion.SourceStatusService;
import pro.walkin.ams.ingestion.connector.IngestionConnector;

public class HttpRestConnector implements IngestionConnector {

  private final String sourceId;
  private final SourceStatusService statusService;

  public HttpRestConnector(String sourceId, SourceStatusService statusService) {
    this.sourceId = sourceId;
    this.statusService = statusService;
  }

  @Override
  public String getSourceId() {
    return sourceId;
  }

  @Override
  public String getProtocol() {
    return "HTTP";
  }

  @Override
  public void start() {
    statusService.updateStatus(sourceId, true);
  }

  @Override
  public void stop() {
    statusService.updateStatus(sourceId, false);
  }

  @Override
  public boolean isRunning() {
    return statusService.isOnline(sourceId);
  }
}
