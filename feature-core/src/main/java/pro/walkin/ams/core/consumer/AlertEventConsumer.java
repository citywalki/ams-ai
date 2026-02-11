package pro.walkin.ams.core.consumer;

import com.hazelcast.collection.IQueue;
import com.hazelcast.core.HazelcastInstance;
import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.common.dto.AlertEvent;
import pro.walkin.ams.core.AlarmProcessing;
import pro.walkin.ams.core.metrics.CoreMetrics;

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 告警事件消费者
 *
 * <p>从 Hazelcast 队列消费告警事件并传递给 AlarmProcessing 处理 使用虚拟线程实现高并发消费 支持集群负载均衡和优雅停机
 */
@ApplicationScoped
public class AlertEventConsumer {

  private static final Logger log = LoggerFactory.getLogger(AlertEventConsumer.class);

  private final HazelcastInstance hz;
  private final AlarmProcessing alarmProcessing;
  private final CoreMetrics metrics;

  private final int consumerThreads;
  private final long pollTimeoutMs;
  private final int maxRetryCount;
  private final long retryDelayMs;

  private final IQueue<AlertEvent> queue;
  private final ExecutorService consumerExecutor;
  private final AtomicBoolean running = new AtomicBoolean(false);
  private final CountDownLatch shutdownLatch = new CountDownLatch(1);

  @Inject
  public AlertEventConsumer(
      HazelcastInstance hz,
      AlarmProcessing alarmProcessing,
      CoreMetrics metrics,
      @ConfigProperty(name = "app.alert.consumer.threads", defaultValue = "4") int consumerThreads,
      @ConfigProperty(name = "app.alert.consumer.poll.timeout.ms", defaultValue = "1000")
          long pollTimeoutMs,
      @ConfigProperty(name = "app.alert.consumer.retry.max", defaultValue = "3") int maxRetryCount,
      @ConfigProperty(name = "app.alert.consumer.retry.delay.ms", defaultValue = "1000")
          long retryDelayMs) {
    this.hz = hz;
    this.alarmProcessing = alarmProcessing;
    this.metrics = metrics;
    this.consumerThreads = consumerThreads;
    this.pollTimeoutMs = pollTimeoutMs;
    this.maxRetryCount = maxRetryCount;
    this.retryDelayMs = retryDelayMs;

    this.queue = hz.getQueue(Constants.Cluster.ALERT_EVENTS_QUEUE);
    this.consumerExecutor = Executors.newVirtualThreadPerTaskExecutor();

    log.info(
        "AlertEventConsumer initialized: threads={}, pollTimeoutMs={}, maxRetryCount={}",
        consumerThreads,
        pollTimeoutMs,
        maxRetryCount);
  }

  /** 应用启动时自动启动消费者 */
  public void onStart(@Observes StartupEvent event) {
    log.info("Starting AlertEventConsumer...");
    running.set(true);

    for (int i = 0; i < consumerThreads; i++) {
      final int threadId = i;
      consumerExecutor.submit(
          () -> {
            log.info("Consumer thread {} started", threadId);
            while (running.get()) {
              try {
                consumeEvent(threadId);
              } catch (InterruptedException e) {
                if (running.get()) {
                  log.error("Consumer thread {} interrupted unexpectedly", threadId, e);
                }
                break;
              } catch (Exception e) {
                log.error("Consumer thread {} encountered error", threadId, e);
                metrics.recordError("consumer_thread");
                try {
                  Thread.sleep(1000);
                } catch (InterruptedException ie) {
                  Thread.currentThread().interrupt();
                  break;
                }
              }
            }
            log.info("Consumer thread {} stopped", threadId);
          });
    }

    log.info("AlertEventConsumer started with {} threads", consumerThreads);
  }

  /** 应用关闭时优雅停机 */
  public void onShutdown(@Observes ShutdownEvent event) {
    log.info("Shutting down AlertEventConsumer...");
    shutdown();
  }

  /** 消费单个事件 */
  private void consumeEvent(int threadId) throws InterruptedException {
    long pollStart = System.nanoTime();

    AlertEvent event = queue.poll(pollTimeoutMs, TimeUnit.MILLISECONDS);

    if (event != null) {
      long receiveTime = System.nanoTime();
      metrics.getConsumerReceivedTotal().increment();

      log.debug("Thread {} received event: id={}", threadId, event.id());

      processWithRetry(event, threadId, 0);

      long processTime = System.nanoTime();
      metrics.getConsumerConsumeLatency().record(processTime - pollStart, TimeUnit.NANOSECONDS);
      log.debug(
          "Thread {} processed event: id={}, latency={}ns",
          threadId,
          event.id(),
          processTime - receiveTime);
    } else {
      long pollTime = System.nanoTime();
      metrics.getConsumerPollLatency().record(pollTime - pollStart, TimeUnit.NANOSECONDS);
    }

    metrics.updateQueueSize(queue.size());
  }

  /** 带重试的处理逻辑 */
  private void processWithRetry(AlertEvent event, int threadId, int retryCount) {
    try {
      alarmProcessing.processEvent(event);
      metrics.getConsumerProcessedTotal().increment();
      log.debug(
          "Thread {} processed event successfully: id={}, retryCount={}",
          threadId,
          event.id(),
          retryCount);
    } catch (Exception e) {
      if (retryCount < maxRetryCount) {
        log.warn(
            "Thread {} failed to process event, retrying: id={}, attempt={}/{}",
            threadId,
            event.id(),
            retryCount + 1,
            maxRetryCount,
            e);
        metrics.getConsumerRetryTotal().increment();

        try {
          Thread.sleep(retryDelayMs);
        } catch (InterruptedException ie) {
          Thread.currentThread().interrupt();
          throw new RuntimeException("Interrupted during retry delay", ie);
        }

        processWithRetry(event, threadId, retryCount + 1);
      } else {
        log.error(
            "Thread {} failed to process event after {} retries: id={}",
            threadId,
            maxRetryCount,
            event.id(),
            e);
        metrics.recordError("consumer_retry_failed");
        throw e;
      }
    }
  }

  /** 优雅停机 */
  @PreDestroy
  public void shutdown() {
    if (running.compareAndSet(true, false)) {
      log.info("Stopping consumer threads...");

      consumerExecutor.shutdown();
      try {
        if (!consumerExecutor.awaitTermination(30, TimeUnit.SECONDS)) {
          log.warn("Consumer executor did not terminate gracefully, forcing shutdown");
          consumerExecutor.shutdownNow();
        }
      } catch (InterruptedException e) {
        log.error("Interrupted while waiting for consumer executor to terminate", e);
        consumerExecutor.shutdownNow();
        Thread.currentThread().interrupt();
      }

      shutdownLatch.countDown();
      log.info("AlertEventConsumer stopped gracefully");
    }
  }

  /** 获取队列当前大小 */
  public int getQueueSize() {
    return queue.size();
  }
}
