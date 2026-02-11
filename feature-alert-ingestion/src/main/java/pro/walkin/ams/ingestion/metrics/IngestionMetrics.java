package pro.walkin.ams.ingestion.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.enterprise.context.ApplicationScoped;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.Constants;

import java.util.concurrent.atomic.AtomicLong;

/**
 * Ingestion 模块监控指标
 *
 * <p>提供完整的性能监控和可观测性支持
 */
@ApplicationScoped
public class IngestionMetrics {

  private static final Logger log = LoggerFactory.getLogger(IngestionMetrics.class);

  private final MeterRegistry meterRegistry;

  // ========== 性能指标 ==========

  /** 处理延迟：从接收到完成的总耗时 */
  private final Timer processLatency;

  /** Mapper 查找延迟 */
  private final Timer mapperLookupLatency;

  /** 标签归一化延迟 */
  private final Timer normalizationLatency;

  /** 指纹计算延迟 */
  private final Timer fingerprintLatency;

  /** Hazelcast 写入延迟 */
  private final Timer hazelcastWriteLatency;

  // ========== 吞吐量指标 ==========

  /** 接收的总告警数 */
  private final Counter receivedTotal;

  /** 成功处理的告警数 */
  private final Counter processedTotal;

  /** 失败的告警数 */
  private final Counter errorTotal;

  /** 本地去重拦截数 */
  private final Counter dedupHits;

  /** 通过去重的新告警数 */
  private final Counter deduplicationPassedTotal;

  /** 被去重过滤的告警数 */
  private final Counter deduplicationFilteredTotal;

  /** Mapper 未找到错误 */
  private final Counter mapperNotFoundTotal;

  // ========== 聚合指标 ==========

  /** 窗口触发总数（满量触发） */
  private final Counter windowFullTriggers;

  /** 窗口触发总数（时间触发） */
  private final Counter windowTimeTriggers;

  /** Flush 操作总数 */
  private final Counter flushTotal;

  // ========== 队列深度指标 ==========

  private final AtomicLong bufferDepthValue = new AtomicLong(0);

  /** Buffer 队列深度 */
  private final Gauge bufferDepth;

  // ========== 缓存指标 ==========

  /** 指纹缓存命中率 */
  private final AtomicLong fingerprintCacheHits = new AtomicLong(0);

  private final AtomicLong fingerprintCacheMisses = new AtomicLong(0);
  private final Gauge fingerprintCacheHitRate;

  public IngestionMetrics(MeterRegistry meterRegistry) {
    this.meterRegistry = meterRegistry;

    // Initialize performance timers
    this.processLatency =
        Timer.builder("ams.ingestion.process.latency")
            .description("Total processing latency from reception to completion")
            .register(meterRegistry);

    this.mapperLookupLatency =
        Timer.builder("ams.ingestion.mapper.lookup.latency")
            .description("Mapper lookup latency")
            .register(meterRegistry);

    this.normalizationLatency =
        Timer.builder("ams.ingestion.normalization.latency")
            .description("Label normalization latency")
            .register(meterRegistry);

    this.fingerprintLatency =
        Timer.builder("ams.ingestion.fingerprint.latency")
            .description("Fingerprint calculation latency")
            .register(meterRegistry);

    this.hazelcastWriteLatency =
        Timer.builder("ams.ingestion.hazelcast.write.latency")
            .description("Hazelcast write operation latency")
            .register(meterRegistry);

    // Initialize throughput counters
    this.receivedTotal =
        Counter.builder("ams.ingestion.received.total")
            .description("Total number of alerts received")
            .register(meterRegistry);

    this.processedTotal =
        Counter.builder("ams.ingestion.processed.total")
            .description("Total number of alerts processed successfully")
            .register(meterRegistry);

    this.errorTotal =
        Counter.builder("ams.ingestion.error.total")
            .description("Total number of failed alerts")
            .register(meterRegistry);

    this.dedupHits =
        Counter.builder("ams.ingestion.dedup.hits")
            .description("Number of alerts filtered by local deduplication")
            .register(meterRegistry);

    this.deduplicationPassedTotal =
        Counter.builder("ams.ingestion.deduplication.passed.total")
            .description("Number of new alerts passed through deduplication")
            .register(meterRegistry);

    this.deduplicationFilteredTotal =
        Counter.builder("ams.ingestion.deduplication.filtered.total")
            .description("Number of alerts filtered by deduplication")
            .register(meterRegistry);

    this.mapperNotFoundTotal =
        Counter.builder("ams.ingestion.mapper.not_found.total")
            .description("Number of times mapper not found for source")
            .register(meterRegistry);

    // Initialize aggregation counters
    this.windowFullTriggers =
        Counter.builder("ams.ingestion.window.full_triggers")
            .description("Number of windows triggered by reaching max batch size")
            .register(meterRegistry);

    this.windowTimeTriggers =
        Counter.builder("ams.ingestion.window.time_triggers")
            .description("Number of windows triggered by time expiry")
            .register(meterRegistry);

    this.flushTotal =
        Counter.builder("ams.ingestion.flush.total")
            .description("Total number of flush operations")
            .register(meterRegistry);

    // Initialize queue depth gauge
    this.bufferDepth =
        Gauge.builder("ams.ingestion.buffer.depth", bufferDepthValue, AtomicLong::doubleValue)
            .description("Current buffer depth")
            .register(meterRegistry);

    // Initialize cache hit rate gauge
    this.fingerprintCacheHitRate =
        Gauge.builder(
                "ams.ingestion.fingerprint.cache.hit_rate",
                this,
                metrics -> {
                  long hits = metrics.fingerprintCacheHits.get();
                  long misses = metrics.fingerprintCacheMisses.get();
                  long total = hits + misses;
                  return total == 0L ? 0.0 : (double) hits / total;
                })
            .description("Fingerprint cache hit rate")
            .register(meterRegistry);

    log.info("IngestionMetrics initialized");
  }

  // ========== Getters for metrics ==========

  public Timer getProcessLatency() {
    return processLatency;
  }

  public Timer getMapperLookupLatency() {
    return mapperLookupLatency;
  }

  public Timer getNormalizationLatency() {
    return normalizationLatency;
  }

  public Timer getFingerprintLatency() {
    return fingerprintLatency;
  }

  public Timer getHazelcastWriteLatency() {
    return hazelcastWriteLatency;
  }

  public Counter getReceivedTotal() {
    return receivedTotal;
  }

  public Counter getProcessedTotal() {
    return processedTotal;
  }

  public Counter getErrorTotal() {
    return errorTotal;
  }

  public Counter getDedupHits() {
    return dedupHits;
  }

  public Counter getDeduplicationPassedTotal() {
    return deduplicationPassedTotal;
  }

  public Counter getDeduplicationFilteredTotal() {
    return deduplicationFilteredTotal;
  }

  public Counter getMapperNotFoundTotal() {
    return mapperNotFoundTotal;
  }

  public Counter getWindowFullTriggers() {
    return windowFullTriggers;
  }

  public Counter getWindowTimeTriggers() {
    return windowTimeTriggers;
  }

  public Counter getFlushTotal() {
    return flushTotal;
  }

  public Gauge getBufferDepth() {
    return bufferDepth;
  }

  public Gauge getFingerprintCacheHitRate() {
    return fingerprintCacheHitRate;
  }

  // ========== Buffer depth operations ==========

  public void setBufferDepth(long depth) {
    bufferDepthValue.set(depth);
  }

  // ========== Cache operations ==========

  public void recordFingerprintCacheHit() {
    fingerprintCacheHits.incrementAndGet();
  }

  public void recordFingerprintCacheMiss() {
    fingerprintCacheMisses.incrementAndGet();
  }

  // ========== Business metrics ==========

  /** 各 Source 的吞吐量（通过 tag 区分） */
  public void recordSourceThroughput(String sourceId, long count) {
    Counter.builder("ams.ingestion.source.throughput")
        .description("Throughput per source")
        .tag("source_id", sourceId)
        .register(meterRegistry)
        .increment((double) count);
  }

  /** 各 Source 的吞吐量（通过 tag 区分） Overload with default count = 1 */
  public void recordSourceThroughput(String sourceId) {
    recordSourceThroughput(sourceId, 1);
  }

  /** 各 Severity 的分布 */
  public void recordSeverityDistribution(Constants.Alarm.Severity severity) {
    Counter.builder("ams.ingestion.severity.distribution")
        .description("Alert severity distribution")
        .tag("severity", severity.name())
        .register(meterRegistry)
        .increment();
  }

  /** 聚合窗口的平均大小 */
  public void recordWindowSize(int size) {
    meterRegistry.summary("ams.ingestion.window.size").record((double) size);
  }
}
