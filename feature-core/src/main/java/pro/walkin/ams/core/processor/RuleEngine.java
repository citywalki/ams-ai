package pro.walkin.ams.core.processor;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.core.metrics.CoreMetrics;
import pro.walkin.ams.persistence.entity.modeling.AlarmRule;
import pro.walkin.ams.persistence.entity.running.Alarm;

/**
 * 规则引擎
 *
 * <p>评估告警规则并执行相应的动作 支持的规则类型： - 静默规则（SILENCE）：静默告警，不发送通知 - 路由规则（ROUTING）：将告警路由到指定处理人/组
 */
@ApplicationScoped
public class RuleEngine implements AlarmProcessor<Map<String, Object>> {

  private static final Logger log = LoggerFactory.getLogger(RuleEngine.class);

  private final RuleEvaluator ruleEvaluator;
  private final CoreMetrics metrics;

  @Inject
  public RuleEngine(RuleEvaluator ruleEvaluator, CoreMetrics metrics) {
    this.ruleEvaluator = ruleEvaluator;
    this.metrics = metrics;
  }

  @Override
  public void process(Alarm alarm) {
    long startTime = System.nanoTime();

    try {
      List<AlarmRule> matchedRules = ruleEvaluator.evaluate(alarm);

      if (matchedRules.isEmpty()) {
        metrics.getRuleMissTotal().increment();
        log.debug("No rules matched for alarm: id={}", alarm.id);
      }

      metrics.getRuleHitTotal().increment();

      Map<String, Object> result = new HashMap<>();
      boolean silenced = false;
      boolean routed = false;

      for (AlarmRule rule : matchedRules) {
        Map<String, Object> actions = executeRule(rule, alarm);

        if (actions != null) {
          if (Boolean.TRUE.equals(actions.get("silenced"))) {
            silenced = true;
          }
          if (Boolean.TRUE.equals(actions.get("routed"))) {
            routed = true;
          }
          result.putAll(actions);
        }
      }

      result.put("silenced", silenced);
      result.put("routed", routed);
      result.put("matchedRuleCount", matchedRules.size());

      log.debug(
          "Rule engine processed alarm: id={}, silenced={}, routed={}", alarm.id, silenced, routed);

    } catch (Exception e) {
      metrics.recordError("rule_evaluation");
      log.error("Rule engine error: alarmId={}", alarm.id, e);
    } finally {
      metrics
          .getRuleEvaluationLatency()
          .record(System.nanoTime() - startTime, java.util.concurrent.TimeUnit.NANOSECONDS);
    }
  }

  /**
   * 执行规则动作
   *
   * @param rule 告警规则
   * @param alarm 告警实体
   * @return 执行结果
   */
  private Map<String, Object> executeRule(AlarmRule rule, Alarm alarm) {
    if (rule.actions == null || rule.actions.isEmpty()) {
      return Map.of();
    }

    return switch (rule.ruleType) {
      case Constants.AlarmRule.RULE_TYPE_SILENCE -> executeSilenceRule(rule, alarm);
      case Constants.AlarmRule.RULE_TYPE_ROUTING -> executeRoutingRule(rule, alarm);
      default -> {
        log.warn("Unknown rule type: type={}, ruleId={}", rule.ruleType, rule.id);
        yield Map.of();
      }
    };
  }

  /**
   * 执行静默规则
   *
   * @param rule 告警规则
   * @param alarm 告警实体
   * @return 执行结果
   */
  private Map<String, Object> executeSilenceRule(AlarmRule rule, Alarm alarm) {
    Map<String, Object> result = new HashMap<>();

    if (rule.actions.containsKey("duration")) {
      long duration = parseDuration(rule.actions.get("duration"));
      result.put("silenced", true);
      result.put("silenceDuration", duration);
      result.put("silenceReason", rule.name);
    } else {
      result.put("silenced", true);
      result.put("silenceReason", rule.name);
    }

    log.debug("Silence rule applied: ruleId={}, alarmId={}", rule.id, alarm.id);

    return result;
  }

  /**
   * 执行路由规则
   *
   * @param rule 告警规则
   * @param alarm 告警实体
   * @return 执行结果
   */
  private Map<String, Object> executeRoutingRule(AlarmRule rule, Alarm alarm) {
    Map<String, Object> result = new HashMap<>();

    if (rule.actions.containsKey("assignee")) {
      result.put("routed", true);
      result.put("assignee", rule.actions.get("assignee"));
    }

    if (rule.actions.containsKey("team")) {
      result.put("routed", true);
      result.put("team", rule.actions.get("team"));
    }

    if (rule.actions.containsKey("escalationLevel")) {
      result.put("escalationLevel", rule.actions.get("escalationLevel"));
    }

    log.debug("Routing rule applied: ruleId={}, alarmId={}", rule.id, alarm.id);

    return result;
  }

  /**
   * 解析持续时间
   *
   * @param durationValue 持续时间值
   * @return 持续时间（秒）
   */
  private long parseDuration(Object durationValue) {
    if (durationValue instanceof Number) {
      return ((Number) durationValue).longValue();
    }

    if (durationValue instanceof String) {
      String durationStr = (String) durationValue;
      if (durationStr.endsWith("m")) {
        return Long.parseLong(durationStr.replace("m", "")) * 60;
      } else if (durationStr.endsWith("h")) {
        return Long.parseLong(durationStr.replace("h", "")) * 3600;
      } else {
        return Long.parseLong(durationStr);
      }
    }

    return 0;
  }

  @Override
  public String getName() {
    return "RuleEngine";
  }

  @Override
  public int getPriority() {
    return 20; // 在优先级计算之后执行
  }
}
