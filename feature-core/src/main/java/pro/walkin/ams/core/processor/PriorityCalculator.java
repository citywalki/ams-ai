package pro.walkin.ams.core.processor;

import jakarta.enterprise.context.ApplicationScoped;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.persistence.entity.running.Alarm;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * 告警优先级计算器
 *
 * <p>基于以下因素计算告警优先级： 1. 严重程度（Severity） 2. 告警持续时间 3. 历史重复次数 4. 规则配置
 */
@ApplicationScoped
public class PriorityCalculator implements AlarmProcessor<Integer> {

  private static final Logger log = LoggerFactory.getLogger(PriorityCalculator.class);

  /** 优先级常量（数值越大优先级越高） */
  public static final int PRIORITY_CRITICAL = 100;

  public static final int PRIORITY_HIGH = 80;
  public static final int PRIORITY_MEDIUM = 60;
  public static final int PRIORITY_LOW = 40;
  public static final int PRIORITY_INFO = 20;

  /** 升级时间阈值（分钟） */
  public static final long ESCALATION_TIME_LOW_TO_MEDIUM = 30;

  public static final long ESCALATION_TIME_MEDIUM_TO_HIGH = 60;
  public static final long ESCALATION_TIME_HIGH_TO_CRITICAL = 120;

  @Override
  public void process(Alarm alarm) {
    long startTime = System.nanoTime();

    try {
      int basePriority = calculateBasePriority(alarm);
      int timeBonus = calculateTimeBonus(alarm);
      int finalPriority = basePriority + timeBonus;

      log.debug(
          "Priority calculated for alarm {}: base={}, timeBonus={}, final={}",
          alarm.id,
          basePriority,
          timeBonus,
          finalPriority);

      int priority = Math.min(finalPriority, PRIORITY_CRITICAL);
      updateAlarmPriority(alarm, priority);
    } finally {
      log.debug("Priority calculation took {} ms", (System.nanoTime() - startTime) / 1_000_000);
    }
  }

  /**
   * 更新告警优先级
   *
   * @param alarm 告警实体
   * @param priority 优先级
   * @return 更新后的告警实体
   */
  private Alarm updateAlarmPriority(Alarm alarm, int priority) {
    Constants.Alarm.Severity newSeverity = PriorityCalculator.getSeverityByPriority(priority);

    // 创建更新后的告警对象，由 Repository 保存
    if (alarm.severity != newSeverity) {
      alarm.severity = newSeverity;
    }

    return alarm;
  }

  /**
   * 计算基础优先级（基于严重程度）
   *
   * @param alarm 告警实体
   * @return 基础优先级
   */
  private int calculateBasePriority(Alarm alarm) {
    return switch (alarm.severity) {
      case Constants.Alarm.Severity.CRITICAL -> PRIORITY_CRITICAL;
      case Constants.Alarm.Severity.HIGH -> PRIORITY_HIGH;
      case Constants.Alarm.Severity.MEDIUM -> PRIORITY_MEDIUM;
      case Constants.Alarm.Severity.LOW -> PRIORITY_LOW;
      case Constants.Alarm.Severity.INFO -> PRIORITY_INFO;
      case Constants.Alarm.Severity.WARNING -> PRIORITY_MEDIUM; // WARNING对应中等优先级
      case Constants.Alarm.Severity.UNKNOWN -> PRIORITY_LOW; // UNKNOWN对应低优先级
      default -> PRIORITY_LOW;
    };
  }

  /**
   * 计算时间奖励（基于持续时间）
   *
   * @param alarm 告警实体
   * @return 时间奖励值
   */
  private int calculateTimeBonus(Alarm alarm) {
    if (alarm.occurredAt == null) {
      return 0;
    }

    long durationMinutes = Duration.between(alarm.occurredAt, LocalDateTime.now()).toMinutes();

    return switch (alarm.severity) {
      case Constants.Alarm.Severity.LOW -> {
        if (durationMinutes >= ESCALATION_TIME_LOW_TO_MEDIUM) {
          yield 20; // 升级到 MEDIUM
        }
        yield 0;
      }
      case Constants.Alarm.Severity.MEDIUM -> {
        if (durationMinutes >= ESCALATION_TIME_MEDIUM_TO_HIGH) {
          yield 20; // 升级到 HIGH
        }
        yield 0;
      }
      case Constants.Alarm.Severity.HIGH -> {
        if (durationMinutes >= ESCALATION_TIME_HIGH_TO_CRITICAL) {
          yield 20; // 升级到 CRITICAL
        }
        yield 0;
      }
      default -> 0;
    };
  }

  /**
   * 根据优先级值获取严重程度
   *
   * @param priority 优先级值
   * @return 严重程度
   */
  public static Constants.Alarm.Severity getSeverityByPriority(int priority) {
    if (priority >= PRIORITY_CRITICAL) {
      return Constants.Alarm.Severity.CRITICAL;
    } else if (priority >= PRIORITY_HIGH) {
      return Constants.Alarm.Severity.HIGH;
    } else if (priority >= PRIORITY_MEDIUM) {
      return Constants.Alarm.Severity.MEDIUM;
    } else if (priority >= PRIORITY_LOW) {
      return Constants.Alarm.Severity.LOW;
    } else {
      return Constants.Alarm.Severity.LOW;
    }
  }

  @Override
  public String getName() {
    return "PriorityCalculator";
  }

  @Override
  public int getPriority() {
    return 10; // 最高优先级，最先执行
  }
}
