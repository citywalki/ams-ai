package pro.walkin.ams.ingestion.publisher;

import com.hazelcast.collection.IQueue;
import com.hazelcast.core.HazelcastInstance;
import jakarta.enterprise.context.ApplicationScoped;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.dto.AlertEvent;
import pro.walkin.ams.ingestion.config.AlertIngestionConfig;

import java.util.concurrent.TimeUnit;

@ApplicationScoped
public class AlertEventPublisher {

  private static final Logger LOG = LoggerFactory.getLogger(AlertEventPublisher.class);
  private static final String QUEUE_NAME = "alert-events";

  private final IQueue<AlertEvent> queue;
  private final AlertIngestionConfig config;

  public AlertEventPublisher(HazelcastInstance hazelcastInstance, AlertIngestionConfig config) {
    this.queue = hazelcastInstance.getQueue(QUEUE_NAME);
    this.config = config;
  }

  /** 发布告警事件到队列 使用带超时的 offer 方法，避免无限阻塞 */
  public void publish(AlertEvent event) {
    try {
      boolean success = queue.offer(event, config.queueOfferTimeoutMs(), TimeUnit.MILLISECONDS);
      if (!success) {
        LOG.error("Queue is full, failed to publish alert event: fingerprint={}", event.id());
        throw new RuntimeException("Alert queue is full, cannot publish event: " + event.id());
      }
      LOG.debug("Published alert event with fingerprint: {}", event.id());
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      LOG.error("Interrupted while publishing alert event: fingerprint={}", event.id(), e);
      throw new RuntimeException("Interrupted while publishing alert event", e);
    } catch (Exception e) {
      LOG.error("Failed to publish alert event with fingerprint: {}", event.id(), e);
      throw new RuntimeException("Failed to publish alert event", e);
    }
  }
}
