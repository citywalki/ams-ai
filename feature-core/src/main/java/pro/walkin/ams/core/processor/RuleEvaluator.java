package pro.walkin.ams.core.processor;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.topic.Message;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.common.event.AlarmRuleChangeEvent;
import pro.walkin.ams.persistence.entity.modeling.AlarmRule;
import pro.walkin.ams.persistence.entity.modeling.AlarmRule_;
import pro.walkin.ams.persistence.entity.running.Alarm;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 规则评估器
 *
 * <p>评估告警规则并返回匹配结果 使用内存缓存 + Hazelcast 事件监听提高性能
 */
@ApplicationScoped
public class RuleEvaluator {

  private static final Logger log = LoggerFactory.getLogger(RuleEvaluator.class);

  private static final String RULE_CACHE_PREFIX = "rules:";

  private final HazelcastInstance hazelcastInstance;

  // Volatile for visibility across threads
  private volatile Map<Long, List<AlarmRule>> cache = new ConcurrentHashMap<>();

  @Inject
  public RuleEvaluator(HazelcastInstance hazelcastInstance) {
    this.hazelcastInstance = hazelcastInstance;
  }

  @PostConstruct
  public void init() {
    // 1. Full load on startup
    refreshAll();

    // 2. Subscribe to change notifications (passive update core)
    hazelcastInstance
        .getReliableTopic("rule-updates")
        .addMessageListener(
            message -> {
              try {
                Message<AlarmRuleChangeEvent> msg =
                    (Message<AlarmRuleChangeEvent>) (Message<?>) message;
                AlarmRuleChangeEvent event = msg.getMessageObject();
                if (event.tenantId() == null) {
                  log.info("Received alarm rule change event: refreshing all");
                  refreshAll();
                } else {
                  log.info(
                      "Received alarm rule change event: refreshing tenantId={}", event.tenantId());
                  refreshOne(event.tenantId());
                }
              } catch (Exception e) {
                log.error("Failed to handle alarm rule change event", e);
              }
            });

    log.info("RuleEvaluator initialized with {} tenants", cache.size());
  }

  /**
   * Full refresh: build new ConcurrentHashMap and replace atomically. Volatile write ensures all
   * threads see new reference immediately.
   */
  private void refreshAll() {
    try {
      Map<Long, List<AlarmRule>> newRules = new ConcurrentHashMap<>();

      // Load rules for all tenants
      // Since this is called on startup and rarely, we can load all rules at once
      // In production with many tenants, consider pagination or lazy loading
      List<AlarmRule> allRules = AlarmRule_.managedBlocking().listAll();

      for (AlarmRule rule : allRules) {
        if (Boolean.TRUE.equals(rule.enabled) && rule.tenant != null) {
          Long tenantId = rule.tenant;
          newRules.computeIfAbsent(tenantId, k -> new java.util.ArrayList<>()).add(rule);
        }
      }

      for (Map.Entry<Long, List<AlarmRule>> entry : newRules.entrySet()) {
        List<AlarmRule> rules = entry.getValue();
        rules.sort(
            (a, b) -> {
              Integer prioA = a.priority != null ? a.priority : Integer.MIN_VALUE;
              Integer prioB = b.priority != null ? b.priority : Integer.MIN_VALUE;
              return prioB.compareTo(prioA);
            });
      }

      // Atomic replacement with volatile write
      cache = new ConcurrentHashMap<>(newRules);

      log.info(
          "Refreshed all alarm rules: {} tenants, {} total rules",
          newRules.size(),
          allRules.size());
    } catch (Exception e) {
      log.error("Failed to refresh all alarm rules", e);
    }
  }

  /** Incremental refresh for single tenant. */
  private void refreshOne(Long tenantId) {
    try {
      List<AlarmRule> rules = AlarmRule_.repo().findByTenantAndEnabled(tenantId, true);

      if (rules.isEmpty()) {
        cache.remove(tenantId);
        log.info("Removed alarm rules for tenantId={}", tenantId);
      } else {
        cache.put(tenantId, rules);
        log.info("Refreshed alarm rules for tenantId={}: {} rules", tenantId, rules.size());
      }
    } catch (Exception e) {
      log.error("Failed to refresh alarm rules for tenantId={}", tenantId, e);
    }
  }

  /**
   * 评估告警规则
   *
   * @param alarm 告警实体
   * @return 匹配的规则列表
   */
  public List<AlarmRule> evaluate(Alarm alarm) {
    long startTime = System.nanoTime();

    try {
      List<AlarmRule> rules = getActiveRules(alarm.tenant);

      List<AlarmRule> matchedRules =
          rules.stream().filter(rule -> evaluateRule(rule, alarm)).toList();

      log.debug(
          "Rule evaluation completed: alarmId={}, matchedCount={}", alarm.id, matchedRules.size());

      return matchedRules;
    } finally {
      long durationMs = (System.nanoTime() - startTime) / 1_000_000;
      log.debug("Rule evaluation took {} ms", durationMs);
    }
  }

  /**
   * 获取启用的规则（带缓存）
   *
   * @param tenantId 租户ID
   * @return 启用的规则列表
   */
  private List<AlarmRule> getActiveRules(Long tenantId) {
    // Fast path: check in-memory cache first
    List<AlarmRule> cachedRules = cache.get(tenantId);
    if (cachedRules != null) {
      log.debug("Rules cache hit: tenantId={}", tenantId);
      return cachedRules;
    }

    log.debug("Rules cache miss: tenantId={}", tenantId);

    // Load from database
    List<AlarmRule> rules =
        AlarmRule_.repo().findByTenantAndEnabledOrderByPriorityDesc(tenantId, true);

    if (rules.isEmpty()) {
      return List.of();
    }

    cache.put(tenantId, rules);
    log.debug("Rules loaded and cached: tenantId={}, count={}", tenantId, rules.size());

    return rules;
  }

  /**
   * 评估单个规则
   *
   * @param rule 告警规则
   * @param alarm 告警实体
   * @return 是否匹配
   */
  private boolean evaluateRule(AlarmRule rule, Alarm alarm) {
    try {
      Map<String, Object> conditions = rule.conditions;
      if (conditions == null || conditions.isEmpty()) {
        return true;
      }

      Instant now = Instant.now();

      // 检查生效时间
      if (rule.effectiveFrom != null && now.isBefore(rule.effectiveFrom)) {
        return false;
      }

      if (rule.effectiveUntil != null && now.isAfter(rule.effectiveUntil)) {
        return false;
      }

      // 评估条件
      return evaluateConditions(conditions, alarm);
    } catch (Exception e) {
      log.error("Failed to evaluate rule: ruleId={}, alarmId={}", rule.id, alarm.id, e);
      return false;
    }
  }

  /**
   * 评估规则条件
   *
   * @param conditions 条件映射
   * @param alarm 告警实体
   * @return 是否匹配
   */
  private boolean evaluateConditions(Map<String, Object> conditions, Alarm alarm) {
    for (Map.Entry<String, Object> entry : conditions.entrySet()) {
      String field = entry.getKey();
      Object expectedValue = entry.getValue();

      if (!evaluateCondition(field, expectedValue, alarm)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 评估单个条件
   *
   * @param field 字段名
   * @param expectedValue 期望值
   * @param alarm 告警实体
   * @return 是否匹配
   */
  private boolean evaluateCondition(String field, Object expectedValue, Alarm alarm) {
    return switch (field) {
      case "severity" -> {
        Constants.Alarm.Severity severity = alarm.severity;
        if (expectedValue instanceof List<?> list) {
          yield list.contains(severity);
        }
        yield severity.equals(expectedValue);
      }
      case "source" -> {
        String source = alarm.source;
        if (expectedValue instanceof List<?> list) {
          yield list.contains(source);
        }
        yield source.equals(expectedValue);
      }
      case "title" -> {
        if (expectedValue instanceof String pattern) {
          yield alarm.title != null && alarm.title.contains(pattern);
        }
        yield false;
      }
      case "description" -> {
        if (expectedValue instanceof String pattern) {
          yield alarm.description != null && alarm.description.contains(pattern);
        }
        yield false;
      }
      default -> false;
    };
  }

  /**
   * 清除规则缓存
   *
   * @param tenantId 租户ID
   */
  public void clearCache(Long tenantId) {
    // Clear in-memory cache
    cache.remove(tenantId);

    // Clear Hazelcast cache for backward compatibility
    String cacheKey = RULE_CACHE_PREFIX + tenantId;
    com.hazelcast.map.IMap<String, List<AlarmRule>> hazelcastCache =
        hazelcastInstance.getMap("rules");
    hazelcastCache.remove(cacheKey);

    log.info("Rules cache cleared: tenantId={}", tenantId);
  }

  /** 清除所有规则缓存 */
  public void clearAllCache() {
    // Clear in-memory cache
    cache.clear();

    // Clear Hazelcast cache for backward compatibility
    com.hazelcast.map.IMap<String, List<AlarmRule>> hazelcastCache =
        hazelcastInstance.getMap("rules");
    hazelcastCache.clear();

    log.info("All rules cache cleared");
  }
}
