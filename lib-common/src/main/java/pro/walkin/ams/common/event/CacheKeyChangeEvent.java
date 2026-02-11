package pro.walkin.ams.common.event;

public record CacheKeyChangeEvent<K>(
    K cacheKey,
    /* 时间戳 */
    long timestamp) {
  public CacheKeyChangeEvent {
    if (timestamp == 0) {
      timestamp = System.currentTimeMillis();
    }
  }
}
