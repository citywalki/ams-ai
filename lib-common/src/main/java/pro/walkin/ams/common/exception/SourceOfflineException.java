package pro.walkin.ams.common.exception;

/** 当告警源处于离线状态时抛出 */
public class SourceOfflineException extends RuntimeException {

  public SourceOfflineException(String sourceId) {
    super("Alert source is currently offline: " + sourceId);
  }
}
