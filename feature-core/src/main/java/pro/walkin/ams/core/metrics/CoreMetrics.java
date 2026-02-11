package pro.walkin.ams.core.metrics;

import io.micrometer.core.instrument.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pro.walkin.ams.common.Constants;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/** 核心模块监控指标 */
@ApplicationScoped
public class CoreMetrics {

  private final MeterRegistry registry;

  private final Counter processedTotal;
  private final Counter createdTotal;
  private final Counter updatedTotal;
  private final Counter statusChangedTotal;
  private final Counter escalatedTotal;
  private final Counter errorTotal;

  private final Counter ruleHitTotal;
  private final Counter ruleMissTotal;

  private final Timer processLatency;
  private final Timer ruleEvaluationLatency;
  private final Timer statusChangeLatency;
  private final Timer escalationLatency;

  private final Counter transactionsTotal;
  private final Counter transactionRollbacksTotal;
  private final Timer transactionLatency;

  private final Counter cacheHitTotal;
  private final Counter cacheMissTotal;

  private final Counter consumerReceivedTotal;
  private final Counter consumerProcessedTotal;
  private final Counter consumerRetryTotal;
  private final Timer consumerConsumeLatency;
  private final Timer consumerPollLatency;
  private final Gauge consumerQueueSize;

  private final AtomicInteger queueSizeHolder = new AtomicInteger(0);

  @Inject
  public CoreMetrics(MeterRegistry registry) {
    this.registry = registry;

    this.processedTotal =
        Counter.builder("core.alarm.processed.total")
            .description("Total number of alarms processed")
            .register(registry);

    this.createdTotal =
        Counter.builder("core.alarm.created.total")
            .description("Total number of alarms created")
            .register(registry);

    this.updatedTotal =
        Counter.builder("core.alarm.updated.total")
            .description("Total number of alarms updated")
            .register(registry);

    this.statusChangedTotal =
        Counter.builder("core.alarm.status.changed.total")
            .description("Total number of alarm status changes")
            .tag("type", "all")
            .register(registry);

    this.escalatedTotal =
        Counter.builder("core.alarm.escalated.total")
            .description("Total number of alarms escalated")
            .register(registry);

    this.errorTotal =
        Counter.builder("core.alarm.error.total")
            .description("Total number of processing errors")
            .tag("type", "all")
            .register(registry);

    this.ruleHitTotal =
        Counter.builder("core.rule.hit.total")
            .description("Total number of rule hits")
            .register(registry);

    this.ruleMissTotal =
        Counter.builder("core.rule.miss.total")
            .description("Total number of rule misses")
            .register(registry);

    this.processLatency =
        Timer.builder("core.alarm.process.latency")
            .description("Alarm processing latency")
            .publishPercentileHistogram()
            .register(registry);

    this.ruleEvaluationLatency =
        Timer.builder("core.rule.evaluation.latency")
            .description("Rule evaluation latency")
            .publishPercentileHistogram()
            .register(registry);

    this.statusChangeLatency =
        Timer.builder("core.alarm.status.change.latency")
            .description("Alarm status change latency")
            .publishPercentileHistogram()
            .register(registry);

    this.escalationLatency =
        Timer.builder("core.alarm.escalation.latency")
            .description("Alarm escalation latency")
            .publishPercentileHistogram()
            .register(registry);

    this.transactionsTotal =
        Counter.builder("core.transaction.total")
            .description("Total number of transactions")
            .tag("type", "all")
            .register(registry);

    this.transactionRollbacksTotal =
        Counter.builder("core.transaction.rollback.total")
            .description("Total number of transaction rollbacks")
            .register(registry);

    this.transactionLatency =
        Timer.builder("core.transaction.latency")
            .description("Transaction latency")
            .publishPercentileHistogram()
            .register(registry);

    this.cacheHitTotal =
        Counter.builder("core.cache.hit.total")
            .description("Total number of cache hits")
            .register(registry);

    this.cacheMissTotal =
        Counter.builder("core.cache.miss.total")
            .description("Total number of cache misses")
            .register(registry);

    this.consumerReceivedTotal =
        Counter.builder("core.consumer.received.total")
            .description("Total number of events received from queue")
            .register(registry);

    this.consumerProcessedTotal =
        Counter.builder("core.consumer.processed.total")
            .description("Total number of events processed successfully")
            .register(registry);

    this.consumerRetryTotal =
        Counter.builder("core.consumer.retry.total")
            .description("Total number of retry attempts")
            .register(registry);

    this.consumerConsumeLatency =
        Timer.builder("core.consumer.consume.latency")
            .description("Event consumption latency (from poll to process complete)")
            .publishPercentileHistogram()
            .register(registry);

    this.consumerPollLatency =
        Timer.builder("core.consumer.poll.latency")
            .description("Poll latency when queue is empty")
            .publishPercentileHistogram()
            .register(registry);

    this.consumerQueueSize =
        Gauge.builder("core.consumer.queue.size", queueSizeHolder, AtomicInteger::get)
            .description("Current queue size")
            .register(registry);
  }

  public Counter getProcessedTotal() {
    return processedTotal;
  }

  public Counter getCreatedTotal() {
    return createdTotal;
  }

  public Counter getUpdatedTotal() {
    return updatedTotal;
  }

  public Counter getStatusChangedTotal() {
    return statusChangedTotal;
  }

  public Counter getEscalatedTotal() {
    return escalatedTotal;
  }

  public Counter getErrorTotal() {
    return errorTotal;
  }

  public Counter getRuleHitTotal() {
    return ruleHitTotal;
  }

  public Counter getRuleMissTotal() {
    return ruleMissTotal;
  }

  public Timer getProcessLatency() {
    return processLatency;
  }

  public Timer getRuleEvaluationLatency() {
    return ruleEvaluationLatency;
  }

  public Timer getStatusChangeLatency() {
    return statusChangeLatency;
  }

  public Timer getEscalationLatency() {
    return escalationLatency;
  }

  public Counter getTransactionsTotal() {
    return transactionsTotal;
  }

  public Counter getTransactionRollbacksTotal() {
    return transactionRollbacksTotal;
  }

  public Timer getTransactionLatency() {
    return transactionLatency;
  }

  public Counter getCacheHitTotal() {
    return cacheHitTotal;
  }

  public Counter getCacheMissTotal() {
    return cacheMissTotal;
  }

  public Counter getConsumerReceivedTotal() {
    return consumerReceivedTotal;
  }

  public Counter getConsumerProcessedTotal() {
    return consumerProcessedTotal;
  }

  public Counter getConsumerRetryTotal() {
    return consumerRetryTotal;
  }

  public Timer getConsumerConsumeLatency() {
    return consumerConsumeLatency;
  }

  public Timer getConsumerPollLatency() {
    return consumerPollLatency;
  }

  public void updateQueueSize(int size) {
    queueSizeHolder.set(size);
  }

  public void recordStatusChange(Constants.Alarm.Status statusType) {
    Counter.builder("core.alarm.status.changed.total")
        .description("Total number of alarm status changes")
        .tag("type", statusType.name())
        .register(registry)
        .increment();
  }

  public void recordError(String errorType) {
    Counter.builder("core.alarm.error.total")
        .description("Total number of processing errors")
        .tag("type", errorType)
        .register(registry)
        .increment();
  }

  public void recordTransaction(String transactionType, long durationNanos) {
    Timer.builder("core.transaction.latency")
        .description("Transaction latency")
        .tag("type", transactionType)
        .publishPercentileHistogram()
        .register(registry)
        .record(durationNanos, TimeUnit.NANOSECONDS);

    Counter.builder("core.transaction.total")
        .description("Total number of transactions")
        .tag("type", transactionType)
        .register(registry)
        .increment();
  }
}
