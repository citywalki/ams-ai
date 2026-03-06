# feature-core 核心告警功能

**模块特定约束**

### ⚠️ 缓存策略（强制）

**仅告警配置（alarm-configuration）相关查询可以使用缓存**

- ✅ 可以使用缓存：告警配置查询
- ❌ 禁止使用缓存：实时告警数据、告警规则执行、告警处理等其他查询
- 使用缓存时必须遵循 Hazelcast 集群失效模式（详见 lib-cluster/AGENTS.md）

### 缓存使用规范

```java
@ApplicationScoped
public class AlarmConfigService {
    
    @Inject
    @CacheName("alarm-config")
    Cache<String, AlarmConfig> cache;
    
    @Inject
    CacheInvalidationPublisher publisher;
    
    // 带缓存的查询（仅限告警配置）
    public AlarmConfig getConfig(String configId) {
        return cache.get(configId, () -> loadFromDb(configId));
    }
    
    // 更新时发送失效事件
    @Transactional
    public void updateConfig(String configId, AlarmConfig config) {
        // 更新数据库...
        
        // 广播缓存失效
        publisher.publish(new CacheInvalidationEvent("alarm-config", configId));
    }
}
```

### 禁止

- ❌ 禁止对非告警配置查询使用缓存
- ❌ 禁止使用缓存时不发送失效广播
