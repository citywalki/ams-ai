package pro.walkin.ams.common.cache;

public interface CacheInvalidationBroadcaster {
  void broadcast(String cacheName, String cacheKey);
}
