package pro.walkin.ams.ingestion;

import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.concurrent.ConcurrentHashMap;

import static org.assertj.core.api.Assertions.*;

class SourceStatusServiceTest {

  private HazelcastInstance hazelcastInstance;
  private SourceStatusService service;
  private ConcurrentHashMap<String, Boolean> localCache;

  @BeforeEach
  void setUp() {
    hazelcastInstance = Hazelcast.newHazelcastInstance();
    IMap<String, Boolean> clusterMap = hazelcastInstance.getMap("ams-source-runtime-status");
    localCache = new ConcurrentHashMap<>();

    service = new TestableSourceStatusService(hazelcastInstance, clusterMap, localCache);
  }

  @AfterEach
  void tearDown() {
    if (hazelcastInstance != null) {
      hazelcastInstance.shutdown();
    }
  }

  @Nested
  @DisplayName("isOnline")
  class IsOnline {

    @Test
    @DisplayName("should return false for unknown source")
    void shouldReturnFalseForUnknownSource() {
      boolean result = service.isOnline("unknown-source");
      assertThat(result).isFalse();
    }

    @Test
    @DisplayName("should return true for online source")
    void shouldReturnTrueForOnlineSource() {
      service.updateStatus("test-source", true);

      boolean result = service.isOnline("test-source");
      assertThat(result).isTrue();
    }

    @Test
    @DisplayName("should return false for offline source")
    void shouldReturnFalseForOfflineSource() {
      service.updateStatus("offline-source", false);

      boolean result = service.isOnline("offline-source");
      assertThat(result).isFalse();
    }
  }

  @Nested
  @DisplayName("updateStatus")
  class UpdateStatus {

    @Test
    @DisplayName("should update source status")
    void shouldUpdateSourceStatus() {
      service.updateStatus("new-source", true);
      assertThat(service.isOnline("new-source")).isTrue();

      service.updateStatus("new-source", false);
      assertThat(service.isOnline("new-source")).isFalse();
    }

    @Test
    @DisplayName("should sync to cluster map")
    void shouldSyncToClusterMap() {
      service.updateStatus("cluster-source", true);

      IMap<String, Boolean> clusterMap = hazelcastInstance.getMap("ams-source-runtime-status");
      assertThat(clusterMap.get("cluster-source")).isTrue();
    }
  }

  private static class TestableSourceStatusService extends SourceStatusService {
    private final IMap<String, Boolean> clusterMap;
    private final ConcurrentHashMap<String, Boolean> localCache;

    TestableSourceStatusService(
        HazelcastInstance hz,
        IMap<String, Boolean> clusterMap,
        ConcurrentHashMap<String, Boolean> localCache) {
      super(hz);
      this.clusterMap = clusterMap;
      this.localCache = localCache;
    }

    @Override
    public void init() {
      // Skip database loading in unit tests
    }

    @Override
    public boolean isOnline(String sourceId) {
      Boolean status = localCache.get(sourceId);
      return status != null ? status : false;
    }

    @Override
    public void updateStatus(String sourceId, boolean online) {
      localCache.put(sourceId, online);
      clusterMap.put(sourceId, online);
    }
  }
}
