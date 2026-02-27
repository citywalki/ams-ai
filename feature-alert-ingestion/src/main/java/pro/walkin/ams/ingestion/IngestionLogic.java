package pro.walkin.ams.ingestion;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.dto.AlertEvent;
import pro.walkin.ams.common.dto.ingestion.DeduplicationResult;
import pro.walkin.ams.common.exception.MapperNotFoundException;
import pro.walkin.ams.common.exception.SourceOfflineException;
import pro.walkin.ams.ingestion.config.AlertIngestionConfig;
import pro.walkin.ams.ingestion.deduplication.AlertDeduplicationStore;
import pro.walkin.ams.ingestion.metrics.IngestionMetrics;
import pro.walkin.ams.ingestion.processor.AlertFingerprinter;
import pro.walkin.ams.ingestion.processor.LabelNormalizer;
import pro.walkin.ams.ingestion.publisher.AlertEventPublisher;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

@ApplicationScoped
public class IngestionLogic {

  private static final Logger log = LoggerFactory.getLogger(IngestionLogic.class);

  private final IngestionMetrics metrics;
  private final AlertDeduplicationStore deduplicationStore;
  private final AlertEventPublisher eventPublisher;
  private final LabelNormalizer normalizer;
  private final AlertIngestionConfig config;
  private final SourceStatusService sourceStatusService;

  private final Map<String, AlertMapper> mapperRegistry = new HashMap<>();

  private final ExecutorService virtualThreadExecutor;

  public IngestionLogic(
      Instance<AlertMapper> alertMappers,
      IngestionMetrics metrics,
      AlertDeduplicationStore deduplicationStore,
      AlertEventPublisher eventPublisher,
      LabelNormalizer normalizer,
      AlertIngestionConfig config,
      SourceStatusService sourceStatusService) {
    this.metrics = metrics;
    this.deduplicationStore = deduplicationStore;
    this.eventPublisher = eventPublisher;
    this.normalizer = normalizer;
    this.config = config;
    this.sourceStatusService = sourceStatusService;

    for (AlertMapper alertMapper : alertMappers) {
      mapperRegistry.put(alertMapper.source(), alertMapper);
    }

    this.virtualThreadExecutor = Executors.newVirtualThreadPerTaskExecutor();
  }

  /**
   * 处理来自特定源的原始告警负载
   *
   * <p>这是告警接入的主要入口方法，负责处理来自指定源ID的原始JSON负载。 该方法采用多阶段处理流程，包括源验证、负载解析、并行事件处理等步骤， 以确保高效和可靠的告警处理。 处理流程：
   *
   * <ol>
   *   <li>验证告警源状态（检查该源是否允许接收告警）
   *   <li>根据源ID查找对应的告警映射器
   *   <li>使用映射器解析原始负载为告警事件列表
   *   <li>并行处理每个告警事件（归一化、指纹计算、去重）
   * </ol>
   *
   * @param sourceId 告警源的唯一标识符，用于路由到适当的处理逻辑
   * @param rawPayload 来自告警源的原始JSON负载字符串
   * @throws SourceOfflineException 当指定的告警源处于离线状态时抛出
   * @throws MapperNotFoundException 当无法为给定源找到合适的映射器时抛出
   * @since 2026.01.28
   */
  public void process(String sourceId, String rawPayload) {
    long startTime = System.nanoTime();

    metrics.getReceivedTotal().increment();
    metrics.recordSourceThroughput(sourceId);

    // 1. 验证告警源状态
    validateSource(sourceId);

    // 2. 查找并验证mapper
    AlertMapper mapper = findMapper(sourceId);

    // 3. 解析原始负载为事件列表
    List<AlertEvent> events = parseEvents(mapper, rawPayload);

    // 4. 并行处理事件（保留虚拟线程优化）
    processEventsParallel(sourceId, events, startTime);
  }

  /**
   * 验证指定告警源的当前状态
   *
   * <p>该方法检查告警源是否处于在线状态，只有在线的源才能处理告警。 如果源处于离线状态，则抛出{@link SourceOfflineException}异常， 阻止后续处理流程继续执行。
   *
   * @param sourceId 需要验证的告警源唯一标识符
   * @throws SourceOfflineException 当告警源处于离线状态时抛出，阻止进一步处理
   * @since 2026.01.28
   */
  private void validateSource(String sourceId) {
    boolean isOnline = sourceStatusService.isOnline(sourceId);

    if (!isOnline) {
      log.error("Alert source is offline: {}", sourceId);
      throw new SourceOfflineException(sourceId);
    }

    log.debug("Source validation passed: {}", sourceId);
  }

  /**
   * 根据源ID查找并验证对应的告警映射器
   *
   * <p>该方法在预加载的映射器注册表中查找与指定源ID匹配的映射器。 如果找不到相应的映射器，则记录错误并增加监控指标， 最终抛出{@link
   * MapperNotFoundException}异常。
   *
   * @param sourceId 需要查找映射器的源唯一标识符
   * @return 对应于指定源ID的告警映射器实例
   * @throws MapperNotFoundException 当没有为给定源ID找到合适的映射器时抛出
   * @since 2026.01.28
   */
  private AlertMapper findMapper(String sourceId) {
    long mapperLookupStart = System.nanoTime();
    AlertMapper mapper = mapperRegistry.get(sourceId);
    if (mapper == null) {
      log.error("Mapper not found for source: {}", sourceId);
      metrics.getMapperNotFoundTotal().increment();
      throw new MapperNotFoundException(sourceId);
    }
    metrics
        .getMapperLookupLatency()
        .record(System.nanoTime() - mapperLookupStart, TimeUnit.NANOSECONDS);
    return mapper;
  }

  /**
   * 使用指定的映射器解析原始负载为告警事件列表
   *
   * <p>该方法调用告警映射器的map方法，将原始的JSON负载字符串转换为标准化的告警事件对象列表。 映射过程由具体的映射器实现决定，通常涉及JSON解析和数据转换。
   *
   * @param mapper 用于解析负载的告警映射器实例
   * @param rawPayload 来自告警源的原始JSON负载字符串
   * @return 解析后的告警事件列表，如果负载中没有事件则返回空列表
   * @since 2026.01.28
   */
  private List<AlertEvent> parseEvents(AlertMapper mapper, String rawPayload) {
    List<AlertEvent> events = mapper.map(rawPayload);
    log.debug("Parsed {} events from source", events.size());
    return events;
  }

  /**
   * 使用虚拟线程并行处理事件列表
   *
   * <p>该方法利用Java的虚拟线程技术，对传入的事件列表中的每个事件进行并行处理。 每个事件都在独立的虚拟线程中执行，通过{@link
   * #processAndAggregateEvent(String, AlertEvent)}方法 完成归一化、指纹计算和去重等处理步骤。此方法确保所有事件处理完成后才继续，
   * 同时记录总体处理延迟。
   *
   * @param sourceId 事件所属的源ID，用于上下文追踪
   * @param events 需要并行处理的告警事件列表
   * @param startTime 整个处理流程的起始时间，用于计算总体延迟
   * @since 2026.01.28
   */
  private void processEventsParallel(String sourceId, List<AlertEvent> events, long startTime) {
    List<CompletableFuture<Void>> futures =
        events.stream()
            .map(
                event ->
                    CompletableFuture.runAsync(
                        () -> {
                          try {
                            processAndAggregateEvent(sourceId, event);
                            metrics.getProcessedTotal().increment();
                          } catch (Exception e) {
                            log.error(
                                "Failed to process event: sourceId={}, eventId={}",
                                sourceId,
                                event.id(),
                                e);
                            metrics.getErrorTotal().increment();
                          }
                        },
                        virtualThreadExecutor))
            .toList();

    // 等待所有事件处理完成
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

    // 记录总延迟
    metrics.getProcessLatency().record(System.nanoTime() - startTime, TimeUnit.NANOSECONDS);
  }

  /**
   * 处理单个告警事件的完整生命周期
   *
   * <p>该方法执行单个告警事件的完整处理流程，包括标签归一化、指纹计算和去重/发布决策。 处理步骤按顺序执行：
   *
   * <ol>
   *   <li>使用标签归一化器对事件的标签进行标准化处理
   *   <li>基于归一化后的标签计算告警指纹
   *   <li>创建带有新指纹和归一化标签的新事件对象
   *   <li>记录严重程度分布统计
   *   <li>将处理后的事件传递给去重和发布流程
   * </ol>
   *
   * @param sourceId 事件所属的源ID，用于上下文和归一化规则
   * @param event 待处理的原始告警事件对象
   * @since 2026.01.28
   */
  private void processAndAggregateEvent(String sourceId, AlertEvent event) {
    // 1. 标签归一化
    long normStart = System.nanoTime();
    Map<String, String> cleanLabels = normalizer.normalize(event.labels(), sourceId);
    metrics.getNormalizationLatency().record(System.nanoTime() - normStart, TimeUnit.NANOSECONDS);

    // 2. 指纹计算
    long fpStart = System.nanoTime();
    String fingerprint = AlertFingerprinter.calculate(cleanLabels);
    metrics.getFingerprintLatency().record(System.nanoTime() - fpStart, TimeUnit.NANOSECONDS);

    // 创建新的事件副本（使用指纹作为 ID，归一化后的标签）
    AlertEvent finalEvent =
        new AlertEvent(
            fingerprint,
            sourceId,
            event.summary(),
            cleanLabels,
            event.occurrenceCount(),
            event.firstSeenAt(),
            event.lastSeenAt(),
            event.status(),
            event.severity());

    // 4. 去重判断 + 投递
    deduplicateAndPublish(finalEvent);
  }

  /**
   * 执行告警事件的去重检查并将结果发布
   *
   * <p>该方法通过去重存储检查事件是否为新事件或已存在事件。 去重逻辑基于配置的时间窗口和最大计数阈值进行判断。 方法以异步方式执行去重检查，并在完成后调用 {@link
   * #handleDeduplicationResult(DeduplicationResult, AlertEvent)}处理结果。
   *
   * @param event 需要去重检查的告警事件对象
   * @since 2026.01.28
   */
  private void deduplicateAndPublish(AlertEvent event) {
    try {
      CompletionStage<DeduplicationResult> resultFuture =
          deduplicationStore.checkAndRecord(
              event, config.deduplicationTimeWindowMs(), config.deduplicationMaxCount());

      resultFuture
          .thenAccept(result -> handleDeduplicationResult(result, event))
          .exceptionally(
              ex -> {
                log.error("Failed to deduplicate event: fingerprint={}", event.id(), ex);
                metrics.getErrorTotal().increment();
                return null;
              });
    } catch (Exception e) {
      log.error("Failed to submit deduplication: fingerprint={}", event.id(), e);
      metrics.getErrorTotal().increment();
    }
  }

  /**
   * 处理去重检查的结果并相应地发布或过滤告警事件
   *
   * <p>该方法根据去重结果决定如何处理事件：如果是新告警， 则发布到下游系统；如果是重复告警，则记录统计信息并忽略。 这种处理方式确保了告警系统只处理和传播唯一的告警事件，
   * 避免了告警风暴和重复通知。
   *
   * @param result 告警去重检查的结果对象，包含是否为新告警和当前计数信息
   * @param event 基于去重结果需要相应处理的告警事件对象
   * @since 2026.01.28
   */
  private void handleDeduplicationResult(DeduplicationResult result, AlertEvent event) {
    if (result.isNewAlert()) {
      eventPublisher.publish(event);
      metrics.getDeduplicationPassedTotal().increment();
      log.debug("New alert published: fingerprint={}", event.id());
    } else {
      metrics.getDeduplicationFilteredTotal().increment();
      log.debug(
          "Duplicate alert filtered: fingerprint={}, count={}", event.id(), result.currentCount());
    }
  }
}
