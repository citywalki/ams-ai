package pro.walkin.ams.cluster.processor;

import com.hazelcast.map.EntryProcessor;
import pro.walkin.ams.common.dto.AlertEvent;
import pro.walkin.ams.common.dto.ingestion.DeduplicationResult;
import pro.walkin.ams.common.dto.ingestion.DeduplicationState;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

public class DeduplicationProcessor
    implements EntryProcessor<String, DeduplicationState, DeduplicationResult> {

  private final AlertEvent alert;
  private final long timeWindowMs;
  private final int maxCount;

  public DeduplicationProcessor(AlertEvent alert, long timeWindowMs, int maxCount) {
    this.alert = alert;
    this.timeWindowMs = timeWindowMs;
    this.maxCount = maxCount;
  }

  @Override
  public DeduplicationResult process(Map.Entry<String, DeduplicationState> entry) {
    DeduplicationState state = entry.getValue();
    LocalDateTime currentTime = LocalDateTime.now();

    if (state == null) {
      DeduplicationState newState = new DeduplicationState(alert, 1, currentTime, currentTime);
      entry.setValue(newState);
      return DeduplicationResult.newAlert(alert);
    }

    long timeDiff = Duration.between(state.firstSeenAt(), currentTime).toMillis();
    if (timeDiff > timeWindowMs) {
      DeduplicationState newState = new DeduplicationState(alert, 1, currentTime, currentTime);
      entry.setValue(newState);
      return DeduplicationResult.newAlert(alert);
    }

    if (state.count() >= maxCount) {
      return DeduplicationResult.duplicate(
          state.originalEvent(), state.count(), state.firstSeenAt());
    }

    int newCount = state.count() + 1;
    DeduplicationState updatedState =
        new DeduplicationState(state.originalEvent(), newCount, state.firstSeenAt(), currentTime);
    entry.setValue(updatedState);

    return DeduplicationResult.duplicate(state.originalEvent(), newCount, state.firstSeenAt());
  }
}
