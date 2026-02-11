package pro.walkin.ams.cluster.event;

import com.hazelcast.core.HazelcastInstance;
import io.quarkus.cache.CacheManager;
import io.quarkus.runtime.Startup;
import io.quarkus.runtime.util.StringUtil;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pro.walkin.ams.common.cache.CacheInvalidationBroadcaster;
import pro.walkin.ams.common.event.CacheInvalidationEvent;

@Startup
@ApplicationScoped
public class CacheInvalidationListener implements CacheInvalidationBroadcaster {

  @Inject CacheManager cacheManager;

  @Inject HazelcastInstance hazelcast;

  private final String listenTopic = "cache-invalidate";

  @PostConstruct
  void init() {
    hazelcast
        .<CacheInvalidationEvent>getTopic(listenTopic)
        .addMessageListener(
            message -> {
              CacheInvalidationEvent cacheInvalidationEvent = message.getMessageObject();
              if (!StringUtil.isNullOrEmpty(cacheInvalidationEvent.cacheMessage())) {
                cacheManager
                    .getCache(cacheInvalidationEvent.cacheMessage())
                    .ifPresent(
                        cache -> {
                          if (StringUtil.isNullOrEmpty(cacheInvalidationEvent.cacheKey())) {
                            cache.invalidateAll();
                          } else {
                            cache.invalidate(cacheInvalidationEvent.cacheKey());
                          }
                        });
              }
            });
  }

  @Override
  public void broadcast(String cacheName, String cacheKey) {
    hazelcast.getTopic(listenTopic).publish(new CacheInvalidationEvent(cacheName, cacheKey));
  }
}
