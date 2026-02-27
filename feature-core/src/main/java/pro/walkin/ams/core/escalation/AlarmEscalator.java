package pro.walkin.ams.core.escalation;

import com.hazelcast.core.HazelcastInstance;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import net.javacrumbs.shedlock.cdi.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.core.event.AlarmEscalatedEvent;
import pro.walkin.ams.core.metrics.CoreMetrics;
import pro.walkin.ams.core.processor.PriorityCalculator;
import pro.walkin.ams.persistence.entity.running.Alarm;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 告警升级器
 *
 * <p>定时扫描未处理的告警并升级优先级 使用分页查询避免内存溢出 使用批量更新提高性能
 */
@ApplicationScoped
public class AlarmEscalator {

  private static final Logger log = LoggerFactory.getLogger(AlarmEscalator.class);

  private static final int BATCH_SIZE = 1000;
  private static final int MAX_ESCALATION_COUNT = 3;

  private static final String ESCALATION_LOCK = "alarm:escalation:lock";
  private static final long LOCK_TIMEOUT_SECONDS = 300; // 5分钟

  private final HazelcastInstance hazelcastInstance;
  private final Event<AlarmEscalatedEvent> alarmEscalatedEvent;
  private final CoreMetrics metrics;

  @Inject public Alarm.Repo alarmRepo;

  @Inject
  public AlarmEscalator(
      HazelcastInstance hazelcastInstance,
      Event<AlarmEscalatedEvent> alarmEscalatedEvent,
      CoreMetrics metrics) {
    this.hazelcastInstance = hazelcastInstance;
    this.alarmEscalatedEvent = alarmEscalatedEvent;
    this.metrics = metrics;
  }

  /** 定时任务：每5分钟执行一次告警升级 */
  @Scheduled(every = "1m")
  @SchedulerLock(name = "escalatePendingAlarms")
  @Transactional
  public void escalatePendingAlarms() {
    log.info("Starting alarm escalation task");

    try {

      escalateAlarms();

    } catch (Exception e) {
      log.error("Error in escalation task", e);
    }
  }

  /** 升级告警 */
  private void escalateAlarms() {
    long startTime = System.nanoTime();

    try {
      int totalCount = 0;
      int escalatedCount = 0;

      int offset = 0;
      List<Alarm> alarms;

      do {
        alarms = alarmRepo.fetchPendingAlarms(offset, BATCH_SIZE);

        if (alarms.isEmpty()) {
          break;
        }

        for (Alarm alarm : alarms) {
          totalCount++;
          if (shouldEscalate(alarm)) {
            escalateAlarm(alarm);
            escalatedCount++;
          }
        }

        offset += BATCH_SIZE;

        log.debug("Processed {} alarms in batch", alarms.size());

      } while (alarms.size() == BATCH_SIZE);

      long durationMs = (System.nanoTime() - startTime) / 1_000_000;

      log.info(
          "Escalation completed: total={}, escalated={}, duration={} ms",
          totalCount,
          escalatedCount,
          durationMs);

    } catch (Exception e) {
      log.error("Failed to escalate alarms", e);
      metrics.recordError("batch_escalation");
    }
  }

  /**
   * 判断是否应该升级告警
   *
   * @param alarm 告警实体
   * @return 是否应该升级
   */
  private boolean shouldEscalate(Alarm alarm) {
    if (alarm.occurredAt == null) {
      return false;
    }

    long durationMinutes = Duration.between(alarm.occurredAt, LocalDateTime.now()).toMinutes();

    return switch (alarm.severity) {
      case LOW -> durationMinutes >= PriorityCalculator.ESCALATION_TIME_LOW_TO_MEDIUM;
      case MEDIUM -> durationMinutes >= PriorityCalculator.ESCALATION_TIME_MEDIUM_TO_HIGH;
      case HIGH -> durationMinutes >= PriorityCalculator.ESCALATION_TIME_HIGH_TO_CRITICAL;
      default -> false;
    };
  }

  /**
   * 升级单个告警
   *
   * @param alarm 告警实体
   */
  @Transactional(Transactional.TxType.REQUIRES_NEW)
  public void escalateAlarm(Alarm alarm) {
    long startTime = System.nanoTime();

    try {
      Constants.Alarm.Severity previousSeverity = alarm.severity;
      int previousPriority = PriorityCalculator.PRIORITY_LOW;

      Constants.Alarm.Severity newSeverity = calculateNewSeverity(alarm.severity);
      int newPriority = PriorityCalculator.PRIORITY_MEDIUM;

      if (previousSeverity.equals(newSeverity)) {
        log.debug("Severity unchanged, skipping escalation: id={}", alarm.id);
        return;
      }

      long durationSeconds = Duration.between(alarm.occurredAt, LocalDateTime.now()).getSeconds();

      alarm.updateAlarmSeverity(newSeverity);
      metrics.getUpdatedTotal().increment();

      publishEscalationEvent(
          alarm, previousSeverity, newSeverity, previousPriority, newPriority, durationSeconds);

      metrics.getEscalatedTotal().increment();
      log.info(
          "Alarm escalated: id={}, from={}, to={}, duration={}s",
          alarm.id,
          previousSeverity,
          newSeverity,
          durationSeconds);

    } catch (Exception e) {
      log.error("Failed to escalate alarm: id={}", alarm.id, e);
      metrics.recordError("alarm_escalation");
    } finally {
      long durationNanos = System.nanoTime() - startTime;
      metrics.getEscalationLatency().record(durationNanos, TimeUnit.NANOSECONDS);
      metrics.recordTransaction("alarm_escalation", durationNanos);
    }
  }

  /**
   * 计算新的严重程度
   *
   * @param severity 告警当前严重程度
   * @return 新的严重程度
   */
  private Constants.Alarm.Severity calculateNewSeverity(Constants.Alarm.Severity severity) {
    return switch (severity) {
      case LOW -> Constants.Alarm.Severity.MEDIUM;
      case MEDIUM -> Constants.Alarm.Severity.HIGH;
      case HIGH -> Constants.Alarm.Severity.CRITICAL;
      case WARNING -> Constants.Alarm.Severity.HIGH; // WARNING升级到HIGH
      default -> severity; // INFO、UNKNOWN等保持原样
    };
  }

  /**
   * 发布告警升级事件
   *
   * @param alarm 告警实体
   * @param previousSeverity 前一个严重程度
   * @param newSeverity 新的严重程度
   * @param previousPriority 前一个优先级
   * @param newPriority 新的优先级
   * @param durationSeconds 持续时间（秒）
   */
  private void publishEscalationEvent(
      Alarm alarm,
      Constants.Alarm.Severity previousSeverity,
      Constants.Alarm.Severity newSeverity,
      int previousPriority,
      int newPriority,
      long durationSeconds) {
    try {
      AlarmEscalatedEvent event =
          new AlarmEscalatedEvent(
              alarm,
              previousSeverity,
              newSeverity,
              previousPriority,
              newPriority,
              "Auto-escalated due to duration",
              durationSeconds);
      alarmEscalatedEvent.fire(event);
      log.debug("AlarmEscalatedEvent published: id={}", alarm.id);
    } catch (Exception e) {
      log.error("Failed to publish AlarmEscalatedEvent: id={}", alarm.id, e);
    }
  }

  /**
   * 手动触发告警升级
   *
   * @param alarmId 告警ID
   * @param userId 用户ID
   * @param reason 升级原因
   */
  @Transactional(Transactional.TxType.REQUIRES_NEW)
  public void manualEscalate(Long alarmId, String userId, String reason) {
    long startTime = System.nanoTime();

    try {
      Alarm alarm = alarmRepo.findByIdOptional(alarmId).orElse(null);

      if (alarm == null) {
        throw new IllegalArgumentException("Alarm not found: " + alarmId);
      }

      Constants.Alarm.Severity previousSeverity = alarm.severity;
      Constants.Alarm.Severity newSeverity = calculateNewSeverity(previousSeverity);

      alarm.updateAlarmSeverity(newSeverity);
      metrics.getUpdatedTotal().increment();

      long durationSeconds = Duration.between(alarm.occurredAt, Instant.now()).getSeconds();

      publishEscalationEvent(alarm, previousSeverity, newSeverity, 0, 0, durationSeconds);

      metrics.getEscalatedTotal().increment();
      log.info("Manual alarm escalation: id={}, user={}, reason={}", alarmId, userId, reason);
    } finally {
      long durationNanos = System.nanoTime() - startTime;
      metrics.recordTransaction("manual_escalation", durationNanos);
    }
  }
}
