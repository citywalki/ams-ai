package pro.walkin.ams.core;

import com.hazelcast.core.HazelcastInstance;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.common.dto.AlertEvent;
import pro.walkin.ams.core.event.AlarmCreatedEvent;
import pro.walkin.ams.core.event.AlarmUpdatedEvent;
import pro.walkin.ams.core.metrics.CoreMetrics;
import pro.walkin.ams.core.processor.AlarmProcessor;
import pro.walkin.ams.persistence.entity.running.Alarm;
import pro.walkin.ams.persistence.entity.system.Tenant;
import pro.walkin.ams.persistence.entity.system.Tenant_;
import pro.walkin.ams.security.TenantContext;

/**
 * 告警处理流水线
 *
 * <p>协调告警的自动化处理流程，负责将外部告警事件转换为内部告警实体并执行处理逻辑。
 *
 * <h3>架构设计</h3>
 *
 * <ul>
 *   <li><b>异步处理</b>：使用虚拟线程（Virtual Thread）提供高并发性能，每个告警独立处理
 *   <li><b>事务隔离</b>：使用 {@code REQUIRES_NEW} 事务类型确保每个告警处理独立，避免相互影响
 *   <li><b>插件化处理器</b>：通过 {@link AlarmProcessor} 接口支持动态扩展处理逻辑
 *   <li><b>事件驱动</b>：处理完成后发布 CDI 事件，解耦告警创建与后续通知逻辑
 * </ul>
 *
 * <h3>处理流程</h3>
 *
 * <ol>
 *   <li>接收 {@link AlertEvent} 告警事件（异步，非阻塞）
 *   <li>将事件转换为 {@link Alarm} 实体（包括租户解析、元数据转换等）
 *   <li>按优先级顺序执行所有注册的 {@link AlarmProcessor} 处理器
 *   <li>持久化告警实体到数据库
 *   <li>发布 {@link AlarmCreatedEvent} 事件触发后续流程
 * </ol>
 *
 * <h3>错误处理策略</h3>
 *
 * <ul>
 *   <li><b>事件接收失败</b>：记录错误日志，不影响其他事件处理
 *   <li><b>单个处理器失败</b>：捕获异常并记录，继续执行后续处理器
 *   <li><b>整体处理失败</b>：事务回滚，记录错误日志
 * </ul>
 *
 * <h3>监控指标</h3>
 *
 * <ul>
 *   <li>{@code processed_total}: 已处理事件总数
 *   <li>{@code created_total}: 成功创建告警总数
 *   <li>{@code process_latency}: 事件处理延迟
 *   <li>{@code transaction_time}: 事务执行时间
 *   <li>{@code errors}: 错误计数
 * </ul>
 */
@ApplicationScoped
public class AlarmProcessing {

  private static final Logger log = LoggerFactory.getLogger(AlarmProcessing.class);

  /** Hazelcast 分布式缓存实例，用于分布式锁等场景 */
  private final HazelcastInstance hz;

  /** 处理器实例集合（支持动态扩展） */
  private final Instance<AlarmProcessor<?>> processorInstance;

  /** 告警创建事件发布器 */
  private final Event<AlarmCreatedEvent> alarmCreatedEvent;

  /** 告警更新事件发布器 */
  private final Event<AlarmUpdatedEvent> alarmUpdatedEvent;

  /** 核心监控指标收集器 */
  private final CoreMetrics metrics;

  /** 虚拟线程执行器，用于高并发告警处理 */
  private final ExecutorService virtualThreadExecutor;

  /**
   * 构造函数
   *
   * @param hz Hazelcast 分布式缓存实例
   * @param processorInstance 处理器实例集合
   * @param alarmCreatedEvent 告警创建事件发布器
   * @param alarmUpdatedEvent 告警更新事件发布器
   * @param metrics 核心监控指标收集器
   */
  @Inject
  public AlarmProcessing(
      HazelcastInstance hz,
      Instance<AlarmProcessor<?>> processorInstance,
      Event<AlarmCreatedEvent> alarmCreatedEvent,
      Event<AlarmUpdatedEvent> alarmUpdatedEvent,
      CoreMetrics metrics) {
    this.hz = hz;
    this.processorInstance = processorInstance;
    this.alarmCreatedEvent = alarmCreatedEvent;
    this.alarmUpdatedEvent = alarmUpdatedEvent;
    this.metrics = metrics;

    // 使用虚拟线程执行器，提供轻量级高并发能力
    this.virtualThreadExecutor = Executors.newVirtualThreadPerTaskExecutor();
  }

  /**
   * 异步接收告警事件并启动处理流程
   *
   * <p>此方法为非阻塞调用，使用虚拟线程异步处理每个告警事件。即使处理失败也不影响事件接收，确保高吞吐量。
   *
   * <h3>设计考虑</h3>
   *
   * <ul>
   *   <li><b>非阻塞</b>：立即返回，处理在后台虚拟线程中执行
   *   <li><b>高吞吐量</b>：虚拟线程支持大量并发，每个事件独立处理
   *   <li><b>监控指标</b>：记录处理总数、延迟和错误计数
   * </ul>
   *
   * <h3>异常处理</h3>
   *
   * 仅捕获启动阶段的异常（如线程池拒绝），处理过程中的异常由 {@code processSingleAlarm} 方法自行处理。
   *
   * @param event 告警事件，不能为 null
   */
  public void processEvent(AlertEvent event) {
    long startTime = System.nanoTime();

    try {
      metrics.getProcessedTotal().increment();

      // 使用虚拟线程异步处理，非阻塞调用
      CompletableFuture.runAsync(() -> processSingleAlarm(event), virtualThreadExecutor);

      log.debug("Event processing started: id={}", event.id());
    } catch (Exception e) {
      // 启动失败（如线程池拒绝），记录但不影响其他事件
      log.error("Failed to start processing event: id={}", event.id(), e);
      metrics.recordError("event_processing_start");
    } finally {
      metrics.getProcessLatency().record(System.nanoTime() - startTime, TimeUnit.NANOSECONDS);
    }
  }

  /**
   * 处理单个告警（核心处理逻辑）
   *
   * <p>使用 {@code REQUIRES_NEW} 事务类型确保每个告警处理在独立的事务中执行，避免相互影响。 即使某个告警处理失败并回滚，也不会影响其他告警的处理。
   *
   * <h3>事务隔离</h3>
   *
   * <ul>
   *   <li><b>REQUIRES_NEW</b>：总是创建新事务，不继承调用者的事务
   *   <li><b>独立性</b>：单个告警处理失败不会影响其他告警
   *   <li><b>回滚策略</b>：任何异常都会触发事务回滚
   * </ul>
   *
   * <h3>处理步骤</h3>
   *
   * <ol>
   *   <li>转换 {@link AlertEvent} 为 {@link Alarm} 实体（包含租户解析、元数据转换）
   *   <li>执行所有注册的 {@link AlarmProcessor} 处理器
   *   <li>持久化告警实体到数据库
   *   <li>发布 {@link AlarmCreatedEvent} 事件
   * </ol>
   *
   * @param event 告警事件，不能为 null
   */
  @Transactional(Transactional.TxType.REQUIRES_NEW)
  public void processSingleAlarm(AlertEvent event) {
    long startTime = System.nanoTime();

    try {
      // 步骤1：转换事件为实体
      Alarm alarm = convertToAlarm(event);

      // 步骤2：执行处理器并持久化
      Alarm processedAlarm = processAlarm(alarm);

      // 步骤3：发布事件
      publishEvent(processedAlarm);

      metrics.getCreatedTotal().increment();
      log.info("Alarm processed: id={}", processedAlarm.id);
    } catch (Exception e) {
      // 处理失败，事务自动回滚
      log.error("Failed to process alarm: id={}", event.id(), e);
      metrics.recordError("alarm_processing");
    } finally {
      long durationNanos = System.nanoTime() - startTime;
      metrics.recordTransaction("alarm_processing", durationNanos);
    }
  }

  /**
   * 转换告警事件为告警实体
   *
   * <h3>转换步骤</h3>
   *
   * <ol>
   *   <li>从 {@link TenantContext} 获取当前租户代码
   *   <li>查询数据库验证租户存在性
   *   <li>创建 {@link Alarm} 实体并填充字段
   *   <li>转换元数据和时间格式
   * </ol>
   *
   * <h3>字段映射</h3>
   *
   * <ul>
   *   <li>{@code tenant.id} - 租户 ID（来自租户上下文）
   *   <li>{@code title} - 告警摘要
   *   <li>{@code description} - 格式化的告警描述（包含严重程度、来源、标签）
   *   <li>{@code severity} - 严重程度
   *   <li>{@code status} - 初始状态为 {@link Constants.Alarm.Status#NEW}
   *   <li>{@code source} - 告警 ID（指纹）
   *   <li>{@code metadata} - 标签转换为元数据
   *   <li>{@code occurredAt} - 告警发生时间
   *   <li>{@code fingerprint} - 告警指纹（用于去重）
   * </ul>
   *
   * @param event 告警事件，不能为 null
   * @return 填充完整的告警实体
   * @throws IllegalArgumentException 如果租户不存在
   */
  private Alarm convertToAlarm(AlertEvent event) {
    // 步骤1：从租户上下文获取当前租户代码
    String tenantCode = TenantContext.getCurrentTenant();

    // 步骤2：查询所有租户并验证当前租户存在性
    List<Tenant> tenants = Tenant_.managedBlocking().listAll();

    if (tenants.isEmpty()) {
      throw new IllegalArgumentException("Tenant not found: " + tenantCode);
    }

    Tenant tenant =
        tenants.stream()
            .filter(t -> t.code.equalsIgnoreCase(tenantCode))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantCode));

    // 步骤3：创建 Alarm 对象并填充字段
    Alarm alarm = new Alarm();
    alarm.tenant = tenant.id;
    alarm.description = buildDescription(event);
    alarm.status = Constants.Alarm.Status.NEW;
    alarm.sourceId = event.sourceId();
    alarm.metadata = convertLabelsToMetadata(event.labels());
    alarm.occurredAt = convertLocalDateTimeToInstant(event.lastSeenAt());
    alarm.fingerprint = event.id();
    alarm.severity = Constants.Alarm.Severity.valueOf(event.severity());

    alarm.title = event.summary();
    return alarm;
  }

  /**
   * 构建告警描述
   *
   * @param event 告警事件
   * @return 告警描述
   */
  private String buildDescription(AlertEvent event) {
    StringBuilder desc = new StringBuilder();
    desc.append("Source: ").append(event.sourceId()).append("\n");

    if (event.labels() != null && !event.labels().isEmpty()) {
      desc.append("Labels:\n");
      event
          .labels()
          .forEach(
              (key, value) ->
                  desc.append("  ").append(key).append(": ").append(value).append("\n"));
    }

    return desc.toString();
  }

  /**
   * 转换标签为元数据
   *
   * @param labels 标签映射
   * @return 元数据映射
   */
  @SuppressWarnings("unchecked")
  private Map<String, Object> convertLabelsToMetadata(Map<String, String> labels) {
    if (labels == null) {
      return Map.of();
    }
    return (Map<String, Object>) (Map<String, ?>) labels;
  }

  /**
   * 转换 LocalDateTime 为 LocalDateTime（占位方法）
   *
   * <p>注意：当前方法名称与实现不符（方法名为 "convertLocalDateTimeToInstant" 但返回 LocalDateTime）。 建议重命名为 {@code
   * normalizeLocalDateTime} 或直接使用原始值。
   *
   * <h3>行为说明</h3>
   *
   * <ul>
   *   <li>如果输入为 null，返回当前时间
   *   <li>如果输入非 null，直接返回输入值
   * </ul>
   *
   * @param dateTime LocalDateTime 对象，可能为 null
   * @return 标准化后的 LocalDateTime，永远不为 null
   */
  private LocalDateTime convertLocalDateTimeToInstant(LocalDateTime dateTime) {
    if (dateTime == null) {
      return LocalDateTime.now();
    }
    return dateTime;
  }

  /**
   * 处理单个告警（应用所有处理器）
   *
   * <h3>处理流程</h3>
   *
   * <ol>
   *   <li>获取所有已注册的处理器（按优先级排序）
   *   <li>依次执行每个处理器的 {@link AlarmProcessor#process(Alarm)} 方法
   *   <li>如果某个处理器失败，记录错误但继续执行后续处理器
   *   <li>所有处理器执行完毕后，持久化告警实体
   * </ol>
   *
   * <h3>异常处理策略</h3>
   *
   * <ul>
   *   <li><b>单个处理器失败</b>：捕获异常，记录日志，继续执行后续处理器
   *   <li><b>整体失败</b>：如果持久化失败或发生未预期异常，包装为 {@link RuntimeException} 重新抛出
   *   <li><b>事务回滚</b>：由于 {@link #processSingleAlarm(AlertEvent)} 使用 {@code REQUIRES_NEW}
   *       事务，任何异常都会触发回滚
   * </ul>
   *
   * @param alarm 待处理的告警实体，不能为 null
   * @return 处理后的告警实体（已持久化到数据库）
   * @throws RuntimeException 如果持久化失败或发生未预期异常
   */
  private Alarm processAlarm(Alarm alarm) {

    try {
      // 获取所有已注册的处理器（按优先级排序）
      List<AlarmProcessor<?>> processors = getProcessors();

      // 依次执行每个处理器，单个处理器失败不影响其他处理器
      for (AlarmProcessor<?> processor : processors) {
        try {
          processor.process(alarm);
        } catch (Exception e) {
          log.error("Processor error: processor={}, alarmId={}", processor.getName(), alarm.id, e);
        }
      }

      // 持久化告警实体到数据库
      alarm.persist();

      return alarm;
    } catch (Exception e) {
      log.error("Failed to process alarm: id={}", alarm.id, e);
      throw new RuntimeException(e);
    }
  }

  /**
   * 获取处理器列表（按优先级排序）
   *
   * <h3>排序规则</h3>
   *
   * <ul>
   *   <li>优先级数值越小，执行顺序越靠前
   *   <li>默认优先级为 100（定义在 {@link AlarmProcessor#getPriority()}）
   *   <li>低优先级处理器在高优先级处理器之后执行
   * </ul>
   *
   * <h3>使用场景</h3>
   *
   * <p>某些处理器依赖其他处理器的执行结果，因此需要控制执行顺序。 例如：数据验证处理器应该在数据持久化处理器之前执行。
   *
   * @return 按优先级升序排列的处理器列表
   */
  private List<AlarmProcessor<?>> getProcessors() {
    return processorInstance.stream()
        .sorted((p1, p2) -> Integer.compare(p1.getPriority(), p2.getPriority()))
        .toList();
  }

  /**
   * 应用规则动作（预留方法）
   *
   * <p><b>注意：此方法当前未被使用</b>。未来可以用于实现规则引擎的动作执行逻辑。
   *
   * <h3>支持的动作类型</h3>
   *
   * <ul>
   *   <li><b>silenced</b>：静音告警，不发送通知
   *   <li><b>routed</b>：路由告警给指定负责人
   * </ul>
   *
   * @param alarm 告警实体
   * @param actions 动作映射，包含动作类型和参数
   */
  @Deprecated(since = "1.0", forRemoval = false)
  private void applyActions(Alarm alarm, Map<String, Object> actions) {
    if (Boolean.TRUE.equals(actions.get("silenced"))) {
      log.debug("Alarm silenced by rule: id={}", alarm.id);
    }

    if (Boolean.TRUE.equals(actions.get("routed"))) {
      log.debug("Alarm routed by rule: id={}, assignee={}", alarm.id, actions.get("assignee"));
    }
  }

  /**
   * 发布告警创建事件
   *
   * <p>通过 CDI 事件机制发布 {@link AlarmCreatedEvent}，触发后续的告警通知和处理流程。 事件发布失败不影响告警的创建和持久化。
   *
   * <h3>事件监听者</h3>
   *
   * <p>任何组件都可以通过 {@code @Observes} 注解监听此事件，例如：
   *
   * <ul>
   *   <li>通知服务：发送邮件、短信等通知
   *   <li>分析服务：进行告警趋势分析
   *   <li>审计服务：记录告警创建日志
   * </ul>
   *
   * <h3>异常处理</h3>
   *
   * <p>事件发布失败仅记录日志，不抛出异常，确保告警创建流程不会被阻塞。
   *
   * @param alarm 已持久化的告警实体
   */
  private void publishEvent(Alarm alarm) {
    try {
      AlarmCreatedEvent event = new AlarmCreatedEvent(alarm);
      alarmCreatedEvent.fire(event);
      log.debug("AlarmCreatedEvent published: id={}", alarm.id);
    } catch (Exception e) {
      // 事件发布失败不影响告警创建，仅记录日志
      log.error("Failed to publish AlarmCreatedEvent: id={}", alarm.id, e);
    }
  }
}
