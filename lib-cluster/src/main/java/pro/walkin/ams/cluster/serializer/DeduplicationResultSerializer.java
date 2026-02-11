package pro.walkin.ams.cluster.serializer;

import com.hazelcast.nio.serialization.compact.CompactReader;
import com.hazelcast.nio.serialization.compact.CompactSerializer;
import com.hazelcast.nio.serialization.compact.CompactWriter;
import pro.walkin.ams.common.dto.ingestion.DeduplicationResult;
import pro.walkin.ams.common.dto.AlertEvent;

import java.time.LocalDateTime;

public class DeduplicationResultSerializer implements CompactSerializer<DeduplicationResult> {
  @Override
  public DeduplicationResult read(CompactReader reader) {
    boolean isNewAlert = reader.readBoolean("isNewAlert");
    AlertEvent originalEvent = reader.readCompact("originalEvent");
    int currentCount = reader.readInt32("currentCount");
    LocalDateTime firstSeenAt = reader.readTimestamp("firstSeenAt");

    return new DeduplicationResult(isNewAlert, originalEvent, currentCount, firstSeenAt);
  }

  @Override
  public void write(CompactWriter writer, DeduplicationResult object) {
    writer.writeBoolean("isNewAlert", object.isNewAlert());
    writer.writeCompact("originalEvent", object.originalEvent());
    writer.writeInt32("currentCount", object.currentCount());
    writer.writeTimestamp("firstSeenAt", object.firstSeenAt());
  }

  @Override
  public String getTypeName() {
    return "deduplicationResult";
  }

  @Override
  public Class<DeduplicationResult> getCompactClass() {
    return DeduplicationResult.class;
  }
}
