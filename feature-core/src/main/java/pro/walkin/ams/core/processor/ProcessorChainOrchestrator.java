package pro.walkin.ams.core.processor;

import com.hazelcast.core.HazelcastInstance;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.event.ProcessorConfigChangeEvent;
import pro.walkin.ams.persistence.entity.modeling.ProcessorConfig;
import pro.walkin.ams.persistence.entity.modeling.ProcessorConfig_;
import pro.walkin.ams.persistence.entity.running.Alarm;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 处理器链编排器
 *
 * <p>根据数据库配置动态构建告警处理责任链
 */
@ApplicationScoped
public class ProcessorChainOrchestrator {

  private static final Logger log = LoggerFactory.getLogger(ProcessorChainOrchestrator.class);

  private static final String TOPIC_NAME = "processor-config-updates";

  private final HazelcastInstance hazelcastInstance;

  private final Map<String, AlarmProcessor<?>> processorRegistry = new ConcurrentHashMap<>();

  private volatile Map<Long, List<AlarmProcessor<?>>> chainCache = new ConcurrentHashMap<>();

  @Inject
  public ProcessorChainOrchestrator(
      HazelcastInstance hazelcastInstance, Instance<AlarmProcessor<?>> alarmProcessors) {
    this.hazelcastInstance = hazelcastInstance;
    for (AlarmProcessor<?> alarmProcessor : alarmProcessors) {
      String name = alarmProcessor.getName();
      processorRegistry.put(name, alarmProcessor);
      log.debug("Registered processor: {}", name);
    }
  }

  @PostConstruct
  public void init() {
    refreshAllChains();

    hazelcastInstance
        .<ProcessorConfigChangeEvent>getReliableTopic(TOPIC_NAME)
        .addMessageListener(
            msg -> {
              try {
                ProcessorConfigChangeEvent event = msg.getMessageObject();

                if (event.tenantId() == null) {
                  log.info("Received processor config change event: refreshing all chains");
                  refreshAllChains();
                } else {
                  log.info(
                      "Received processor config change event: refreshing tenantId={}",
                      event.tenantId());
                  refreshChainForTenant(event.tenantId());
                }
              } catch (Exception e) {
                log.error("Failed to handle processor config change event", e);
              }
            });

    log.info("ProcessorChainOrchestrator initialized with {} tenant chains", chainCache.size());
  }

  /**
   * 执行告警处理链
   *
   * @param alarm 告警实体
   */
  public void execute(Alarm alarm) {
    Long tenantId = alarm.tenant;

    if (tenantId == null) {
      log.warn("Alarm has no tenant: alarmId={}", alarm.id);
      return;
    }

    List<AlarmProcessor<?>> chain = chainCache.get(tenantId);

    if (chain == null || chain.isEmpty()) {
      log.warn("No processor chain configured for tenantId={}", tenantId);
      return;
    }

    for (AlarmProcessor<?> processor : chain) {
      try {
        log.debug("Executing processor: {} for alarm: {}", processor.getName(), alarm.id);
        processor.process(alarm);
      } catch (Exception e) {
        log.error("Processor failed: {} for alarm: {}", processor.getName(), alarm.id, e);
      }
    }
  }

  /** 刷新所有租户的处理链 */
  private void refreshAllChains() {
    try {
      Map<Long, List<AlarmProcessor<?>>> newChains = new ConcurrentHashMap<>();

      List<ProcessorConfig> allConfigs = ProcessorConfig_.managedBlocking().listAll();

      Map<Long, List<ProcessorConfig>> configsByTenant =
          allConfigs.stream()
              .filter(config -> Boolean.TRUE.equals(config.enabled) && config.tenant != null)
              .collect(Collectors.groupingBy(config -> config.tenant));

      for (Map.Entry<Long, List<ProcessorConfig>> entry : configsByTenant.entrySet()) {
        Long tenantId = entry.getKey();
        List<ProcessorConfig> configs = entry.getValue();

        List<AlarmProcessor<?>> chain = buildChain(configs);
        newChains.put(tenantId, chain);

        log.debug("Built processor chain for tenantId={}: {} processors", tenantId, chain.size());
      }

      chainCache = new ConcurrentHashMap<>(newChains);

      log.info("Refreshed all processor chains: {} tenants", newChains.size());
    } catch (Exception e) {
      log.error("Failed to refresh all processor chains", e);
    }
  }

  /**
   * 刷新指定租户的处理链
   *
   * @param tenantId 租户ID
   */
  private void refreshChainForTenant(Long tenantId) {
    try {
      List<ProcessorConfig> configs =
          ProcessorConfig_.repo().findByTenantOrderByExecutionOrderAsc(tenantId);

      if (configs.isEmpty()) {
        chainCache.remove(tenantId);
        log.info("Removed processor chain for tenantId={}", tenantId);
      } else {
        List<AlarmProcessor<?>> chain = buildChain(configs);
        chainCache.put(tenantId, chain);
        log.info(
            "Refreshed processor chain for tenantId={}: {} processors", tenantId, chain.size());
      }
    } catch (Exception e) {
      log.error("Failed to refresh processor chain for tenantId={}", tenantId, e);
    }
  }

  /**
   * 构建处理链
   *
   * @param configs 处理器配置列表
   * @return 处理器链
   */
  private List<AlarmProcessor<?>> buildChain(List<ProcessorConfig> configs) {
    List<AlarmProcessor<?>> chain = new ArrayList<>();

    for (ProcessorConfig config : configs) {
      AlarmProcessor<?> processor = processorRegistry.get(config.processorName);

      if (processor == null) {
        log.warn("Processor not found in registry: {}", config.processorName);
        continue;
      }

      chain.add(processor);
    }

    return chain;
  }

  /**
   * 手动触发配置刷新（用于测试或管理操作）
   *
   * @param tenantId 租户ID，如果为 null 则刷新所有租户
   */
  public void triggerRefresh(Long tenantId) {
    if (tenantId == null) {
      refreshAllChains();
    } else {
      refreshChainForTenant(tenantId);
    }
  }

  /**
   * 获取当前注册的所有处理器名称
   *
   * @return 处理器名称列表
   */
  public List<String> getRegisteredProcessors() {
    return new ArrayList<>(processorRegistry.keySet());
  }

  /**
   * 获取指定租户的处理链
   *
   * @param tenantId 租户ID
   * @return 处理器链
   */
  public List<AlarmProcessor<?>> getChainForTenant(Long tenantId) {
    return chainCache.getOrDefault(tenantId, List.of());
  }
}
