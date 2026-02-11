package pro.walkin.ams.common.exception;

/** 当系统无法为指定的 SourceId 找到对应的告警适配器时抛出 */
public class MapperNotFoundException extends RuntimeException {

  public MapperNotFoundException(String sourceId) {
    super("No suitable alert mapper found for source: " + sourceId);
  }
}
