package pro.walkin.ams.ingestion.deduplication;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import jakarta.enterprise.context.ApplicationScoped;
import pro.walkin.ams.cluster.processor.DeduplicationProcessor;
import pro.walkin.ams.common.dto.AlertEvent;
import pro.walkin.ams.common.dto.ingestion.DeduplicationResult;
import pro.walkin.ams.common.dto.ingestion.DeduplicationState;

import java.util.concurrent.CompletionStage;

@ApplicationScoped
public class AlertDeduplicationStore {

  private static final String DEDUP_MAP_NAME = "alert-deduplication";

  private final HazelcastInstance hazelcastInstance;

  public AlertDeduplicationStore(HazelcastInstance hazelcastInstance) {
    this.hazelcastInstance = hazelcastInstance;
  }

  public CompletionStage<DeduplicationResult> checkAndRecord(
      AlertEvent alert, long timeWindowMs, int maxCount) {
    IMap<String, DeduplicationState> dedupMap = getDedupMap();
    return dedupMap.submitToKey(
        alert.id(), new DeduplicationProcessor(alert, timeWindowMs, maxCount));
  }

  public IMap<String, DeduplicationState> getDedupMap() {
    return hazelcastInstance.getMap(DEDUP_MAP_NAME);
  }
}
