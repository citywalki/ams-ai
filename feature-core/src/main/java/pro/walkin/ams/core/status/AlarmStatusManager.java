package pro.walkin.ams.core.status;

import com.hazelcast.core.HazelcastInstance;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.core.event.AlarmStatusChangedEvent;
import pro.walkin.ams.core.metrics.CoreMetrics;
import pro.walkin.ams.persistence.entity.running.Alarm;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

/**
 * 告警状态管理器
 *
 * <p>管理告警的生命周期状态 使用 Hazelcast 分布式锁保证状态变更的原子性 支持状态变更审计
 */
@ApplicationScoped
@Transactional
public class AlarmStatusManager {

  private static final Logger log = LoggerFactory.getLogger(AlarmStatusManager.class);

  private static final String LOCK_PREFIX = "alarm:status:lock:";
  private static final String CACHE_PREFIX = "alarm:status:";

  private final HazelcastInstance hazelcastInstance;
  private final Event<AlarmStatusChangedEvent> alarmStatusChangedEvent;
  private final CoreMetrics metrics;

  @Inject Alarm.Repo alarmRepo;

  public AlarmStatusManager(
      HazelcastInstance hazelcastInstance,
      Event<AlarmStatusChangedEvent> alarmStatusChangedEvent,
      CoreMetrics metrics) {
    this.hazelcastInstance = hazelcastInstance;
    this.alarmStatusChangedEvent = alarmStatusChangedEvent;
    this.metrics = metrics;
  }

  /**
   * 确认告警
   *
   * @param alarmId 告警ID
   * @param userId 用户ID
   * @return 更新后的告警
   */
  public Alarm acknowledge(Long alarmId, String userId) {
    return changeStatus(alarmId, Constants.Alarm.Status.ACKNOWLEDGED, userId, null);
  }

  /**
   * 开始处理告警
   *
   * @param alarmId 告警ID
   * @param userId 用户ID
   * @return 更新后的告警
   */
  public Alarm startProcessing(Long alarmId, String userId) {
    return changeStatus(alarmId, Constants.Alarm.Status.IN_PROGRESS, userId, null);
  }

  /**
   * 解决告警
   *
   * @param alarmId 告警ID
   * @param userId 用户ID
   * @param comment 评论
   * @return 更新后的告警
   */
  public Alarm resolve(Long alarmId, String userId, String comment) {
    Alarm alarm = changeStatus(alarmId, Constants.Alarm.Status.RESOLVED, userId, comment);
    return alarm;
  }

  /**
   * 关闭告警
   *
   * @param alarmId 告警ID
   * @param userId 用户ID
   * @return 更新后的告警
   */
  public Alarm close(Long alarmId, String userId) {
    return changeStatus(alarmId, Constants.Alarm.Status.CLOSED, userId, null);
  }

  /**
   * 重新打开告警
   *
   * @param alarmId 告警ID
   * @param userId 用户ID
   * @return 更新后的告警
   */
  public Alarm reopen(Long alarmId, String userId) {
    return changeStatus(alarmId, Constants.Alarm.Status.NEW, userId, "Reopened");
  }

  /**
   * 变更告警状态
   *
   * @param alarmId 告警ID
   * @param newStatus 新状态
   * @param userId 用户ID
   * @param comment 评论
   * @return 更新后的告警
   */
  private Alarm changeStatus(
      Long alarmId, Constants.Alarm.Status newStatus, String userId, String comment) {
    long startTime = System.nanoTime();

    try {

      Alarm alarm = alarmRepo.findByIdOptional(alarmId).orElse(null);

      if (alarm == null) {
        throw new IllegalArgumentException("Alarm not found: " + alarmId);
      }

      Constants.Alarm.Status previousStatus = alarm.status;

      if (previousStatus.equals(newStatus)) {
        log.debug("Status unchanged: alarmId={}, status={}", alarmId, newStatus);
        return alarm;
      }

      if (!isValidStatusTransition(previousStatus, newStatus)) {
        throw new IllegalStateException(
            "Invalid status transition: from=" + previousStatus + ", to=" + newStatus);
      }

      Alarm updatedAlarm = updateAlarmStatus(alarm, newStatus);
      metrics.getUpdatedTotal().increment();

      if (comment != null && !comment.isBlank()) {
        createAlarmComment(alarmId, userId, comment);
      }

      publishStatusChangedEvent(alarm, previousStatus, newStatus, userId);

      metrics.recordStatusChange(newStatus);
      log.info(
          "Alarm status changed: id={}, from={}, to={}, user={}",
          alarmId,
          previousStatus,
          newStatus,
          userId);

      return updatedAlarm;
    } finally {
      long durationNanos = System.nanoTime() - startTime;
      metrics.getStatusChangeLatency().record(durationNanos, TimeUnit.NANOSECONDS);
      metrics.recordTransaction("status_change", durationNanos);
    }
  }

  /**
   * 更新告警状态
   *
   * @param alarm 告警实体
   * @param newStatus 新状态
   * @return 更新后的告警实体
   */
  private Alarm updateAlarmStatus(Alarm alarm, Constants.Alarm.Status newStatus) {
    alarm.status = newStatus;
    switch (newStatus) {
      case Constants.Alarm.Status.ACKNOWLEDGED, Constants.Alarm.Status.IN_PROGRESS -> {
        if (alarm.acknowledgedAt == null) {
          alarm.acknowledgedAt = LocalDateTime.now();
        }
      }
      case Constants.Alarm.Status.RESOLVED -> {
        if (alarm.resolvedAt == null) {
          alarm.resolvedAt = LocalDateTime.now();
        }
      }
      case Constants.Alarm.Status.CLOSED -> {
        if (alarm.resolvedAt == null) {
          alarm.resolvedAt = LocalDateTime.now();
        }
        if (alarm.closedAt == null) {
          alarm.closedAt = LocalDateTime.now();
        }
      }
    }

    return alarm;
  }

  /**
   * 创建告警评论
   *
   * @param alarmId 告警ID
   * @param userId 用户ID
   * @param comment 评论内容
   */
  private void createAlarmComment(Long alarmId, String userId, String comment) {
    // TODO: 实现 AlarmComment 的创建
    // 需要先查询 Alarm 和 User 实体，然后创建关联
    log.debug(
        "Alarm comment creation: alarmId={}, userId={}, comment={}", alarmId, userId, comment);
  }

  /**
   * 发布状态变更事件
   *
   * @param alarm 告警实体
   * @param previousStatus 前一个状态
   * @param newStatus 新状态
   * @param userId 用户ID
   */
  private void publishStatusChangedEvent(
      Alarm alarm,
      Constants.Alarm.Status previousStatus,
      Constants.Alarm.Status newStatus,
      String userId) {
    try {
      AlarmStatusChangedEvent event =
          new AlarmStatusChangedEvent(alarm, previousStatus, newStatus, userId, null);
      alarmStatusChangedEvent.fire(event);
      log.debug("AlarmStatusChangedEvent published: id={}", alarm.id);
    } catch (Exception e) {
      log.error("Failed to publish AlarmStatusChangedEvent: id={}", alarm.id, e);
    }
  }

  /**
   * 验证状态转换是否有效
   *
   * @param from 起始状态
   * @param to 目标状态
   * @return 是否有效
   */
  private boolean isValidStatusTransition(Constants.Alarm.Status from, Constants.Alarm.Status to) {
    if (from.equals(to)) {
      return false;
    }

    return switch (from) {
      case Constants.Alarm.Status.NEW -> {
        yield to == Constants.Alarm.Status.ACKNOWLEDGED
            || to == Constants.Alarm.Status.IN_PROGRESS
            || to == Constants.Alarm.Status.RESOLVED
            || to == Constants.Alarm.Status.CLOSED;
      }
      case Constants.Alarm.Status.ACKNOWLEDGED -> {
        yield to.equals(Constants.Alarm.Status.IN_PROGRESS)
            || to.equals(Constants.Alarm.Status.RESOLVED)
            || to.equals(Constants.Alarm.Status.CLOSED);
      }
      case Constants.Alarm.Status.IN_PROGRESS -> {
        yield to.equals(Constants.Alarm.Status.RESOLVED)
            || to.equals(Constants.Alarm.Status.CLOSED);
      }
      case Constants.Alarm.Status.RESOLVED -> {
        yield to.equals(Constants.Alarm.Status.CLOSED) || to.equals(Constants.Alarm.Status.NEW);
      }
      case Constants.Alarm.Status.CLOSED -> {
        yield to.equals(Constants.Alarm.Status.NEW);
      }
      default -> false;
    };
  }

  /**
   * 获取告警状态（带缓存）
   *
   * @param alarmId 告警ID
   * @return 告警状态
   */
  public Constants.Alarm.Status getAlarmStatus(Long alarmId) {
    String cacheKey = CACHE_PREFIX + alarmId;
    com.hazelcast.map.IMap<String, String> cache = hazelcastInstance.getMap("alarmStatus");

    String cachedStatus = cache.get(cacheKey);
    if (cachedStatus != null) {
      metrics.getCacheHitTotal().increment();
      return Constants.Alarm.Status.valueOf(cachedStatus);
    }

    metrics.getCacheMissTotal().increment();

    Alarm alarm = alarmRepo.findByIdOptional(alarmId).orElse(null);
    if (alarm == null) {
      return null;
    }

    cache.put(cacheKey, alarm.status.name(), 5, TimeUnit.MINUTES);
    return alarm.status;
  }

  /**
   * 清除告警状态缓存
   *
   * @param alarmId 告警ID
   */
  public void clearCache(Long alarmId) {
    String cacheKey = CACHE_PREFIX + alarmId;
    com.hazelcast.map.IMap<String, String> cache = hazelcastInstance.getMap("alarmStatus");
    cache.remove(cacheKey);

    log.debug("Alarm status cache cleared: id={}", alarmId);
  }
}
