package pro.walkin.ams.cluster.cache;

import com.hazelcast.core.HazelcastInstance;
import jakarta.annotation.PostConstruct;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.event.CacheKeyChangeEvent;

public abstract class ClusterCacher<K, V> {

  private final Logger log = LoggerFactory.getLogger(getClass());

  private HazelcastInstance hz;

  @Inject
  public void setHz(HazelcastInstance hz) {
    this.hz = hz;
  }

  @PostConstruct
  public abstract String listenerId();

  @PostConstruct
  public void init() {
    refreshAll();

    hz.<CacheKeyChangeEvent<K>>getReliableTopic(listenerId())
        .addMessageListener(
            msg -> {
              try {
                CacheKeyChangeEvent<K> event = msg.getMessageObject();
                if (event.cacheKey() == null) {
                  log.info("Received label mapping change event: refreshing all");
                  refreshAll();
                } else {
                  log.info(
                      "Received label mapping change event: refreshing sourceId={}",
                      event.cacheKey());
                  refreshOne(event.cacheKey());
                }
              } catch (Exception e) {
                log.error("Failed to handle label mapping change event", e);
              }
            });
  }

  public abstract V get(K key);

  protected abstract void refreshAll();

  protected abstract void refreshOne(K key);
}
