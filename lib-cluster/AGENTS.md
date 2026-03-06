# lib-cluster 集群缓存与事件

**模块特定约束**

### 缓存失效模式（强制）

- **模式**: 本地缓存 + Hazelcast Topic 广播
- **Topic 名称**: `cache-invalidate`
- **事件负载**: `CacheInvalidationEvent(cacheName, cacheKey)`
- **行为**:
  - 当 `cacheKey` 为空时，执行 `invalidateAll()`
  - 当 `cacheKey` 不为空时，执行 `invalidate(cacheKey)`

### 使用规范

```java
// 发送缓存失效事件
@Inject
CacheInvalidationPublisher publisher;

// 失效特定缓存键
publisher.publish(new CacheInvalidationEvent("alarm-config", configId));

// 失效整个缓存
publisher.publish(new CacheInvalidationEvent("alarm-config", null));
```

### 集群失效监听器

```java
@ApplicationScoped
public class AlarmConfigCacheListener implements CacheInvalidationListener {
    
    @Inject
    @CacheName("alarm-config")
    Cache<String, AlarmConfig> cache;
    
    @Override
    public void onCacheInvalidation(CacheInvalidationEvent event) {
        if ("alarm-config".equals(event.getCacheName())) {
            if (event.getCacheKey() == null) {
                cache.invalidateAll();
            } else {
                cache.invalidate(event.getCacheKey());
            }
        }
    }
}
```

### 禁止

- ❌ 禁止引入本地内存缓存（避免集群一致性风险）
- ❌ 禁止不通过 Topic 广播直接操作其他节点的缓存
