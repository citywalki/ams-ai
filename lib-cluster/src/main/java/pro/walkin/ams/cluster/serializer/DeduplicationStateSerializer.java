package pro.walkin.ams.cluster.serializer;

import com.hazelcast.nio.serialization.compact.CompactReader;
import com.hazelcast.nio.serialization.compact.CompactSerializer;
import com.hazelcast.nio.serialization.compact.CompactWriter;
import pro.walkin.ams.common.dto.AlertEvent;
import pro.walkin.ams.common.dto.ingestion.DeduplicationState;

import java.time.LocalDateTime;

public class DeduplicationStateSerializer implements CompactSerializer<DeduplicationState> {
  @Override
  public DeduplicationState read(CompactReader reader) {
    AlertEvent alertEvent = reader.readCompact("originalEvent");
    int count = reader.readInt32("count");
    LocalDateTime firstSeenAt = reader.readTimestamp("firstSeenAt");
    LocalDateTime lastSeenAt = reader.readTimestamp("lastSeenAt");

    return new DeduplicationState(alertEvent, count, firstSeenAt, lastSeenAt);
  }

  @Override
  public void write(CompactWriter writer, DeduplicationState object) {
    writer.writeCompact("originalEvent", object.originalEvent());
    writer.writeInt32("count", object.count());
    writer.writeTimestamp("firstSeenAt", object.firstSeenAt());
    writer.writeTimestamp("lastSeenAt", object.lastSeenAt());
  }

  @Override
  public String getTypeName() {
    return "deduplicationState";
  }

  @Override
  public Class<DeduplicationState> getCompactClass() {
    return DeduplicationState.class;
  }
}
