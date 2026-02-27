package pro.walkin.ams.ingestion;

import com.hazelcast.core.EntryEvent;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import com.hazelcast.map.listener.EntryAddedListener;
import com.hazelcast.map.listener.EntryUpdatedListener;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.persistence.entity.modeling.AlertSource_;

import java.util.concurrent.ConcurrentHashMap;

/**
 * 来源状态服务：管理告警源的在线/离线状态
 *
 * <p>职责： 1. 维护告警源的本地缓存（极速读取） 2. 同步集群分布式状态（多节点一致） 3. 监听状态变更并自动更新本地缓存
 */
@ApplicationScoped
public class SourceStatusService {
  private static final Logger log = LoggerFactory.getLogger(SourceStatusService.class);

  private final HazelcastInstance hz;

  /** 本地缓存：提供极速读取。 即使 Hazelcast 抖动，本地依然有一份状态副本。 */
  private final ConcurrentHashMap<String, Boolean> localStatusCache = new ConcurrentHashMap<>();

  /** 集群分布式 Map：所有节点共享的状态真相。 */
  private IMap<String, Boolean> clusterStatusMap;

  public SourceStatusService(HazelcastInstance hz) {
    this.hz = hz;
  }

  @PostConstruct
  public void init() {
    // 1. 初始化分布式 Map 并挂载监听器
    clusterStatusMap = hz.getMap("ams-source-runtime-status");

    // 监听集群中的变更，同步到本地内存
    clusterStatusMap.addEntryListener(new SourceStatusListener(localStatusCache), true);

    // 2. 引导启动 (Bootstrap)
    // 只有当集群 Map 为空时（例如整个集群首次冷启动），才从数据库加载
    if (clusterStatusMap.isEmpty()) {
      log.info("Initial boot: loading source status from database...");

      AlertSource_.managedBlocking()
          .findAll()
          .list()
          .forEach(
              source -> {
                clusterStatusMap.put(source.name, source.isEnabled);
              });
    }

    // 3. 预填充本地缓存
    localStatusCache.putAll(clusterStatusMap);
    log.info("SourceStatusService initialized with {} sources.", localStatusCache.size());
  }

  /** 极速判断：Ingestion 拦截器调用此方法 */
  public boolean isOnline(String sourceId) {
    // 如果找不到，默认 true 或 false 取决于你的安全策略，这里建议默认禁用
    Boolean status = localStatusCache.get(sourceId);
    return status != null ? status : false;
  }

  /** 管理端调用：更新状态 会触发所有节点的监听器，从而自动更新所有节点的 localStatusCache */
  public void updateStatus(String sourceId, boolean online) {
    log.info("Updating source [{}] status to: {}", sourceId, online);
    clusterStatusMap.put(sourceId, online);

    // 记得同步更新数据库，保证下次集群冷启动时数据正确
    // 这里建议异步处理或由专门的 AdminService 处理
  }

  /** 监听器：监听集群状态变更，同步到本地缓存 */
  private static class SourceStatusListener
      implements EntryAddedListener<String, Boolean>, EntryUpdatedListener<String, Boolean> {

    private final ConcurrentHashMap<String, Boolean> cache;

    SourceStatusListener(ConcurrentHashMap<String, Boolean> cache) {
      this.cache = cache;
    }

    @Override
    public void entryAdded(EntryEvent<String, Boolean> event) {
      Boolean value = event.getValue();
      if (value != null) {
        cache.put(event.getKey(), value);
      }
    }

    @Override
    public void entryUpdated(EntryEvent<String, Boolean> event) {
      Boolean value = event.getValue();
      if (value != null) {
        cache.put(event.getKey(), value);
      }
    }
  }
}
