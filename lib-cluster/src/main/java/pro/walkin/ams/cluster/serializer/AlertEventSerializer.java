package pro.walkin.ams.cluster.serializer;

import com.hazelcast.nio.serialization.compact.CompactReader;
import com.hazelcast.nio.serialization.compact.CompactSerializer;
import com.hazelcast.nio.serialization.compact.CompactWriter;
import pro.walkin.ams.common.dto.AlertEvent;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class AlertEventSerializer implements CompactSerializer<AlertEvent> {
  @Override
  public AlertEvent read(CompactReader reader) {
    String id = reader.readString("id");
    String sourceId = reader.readString("sourceId");
    String summary = reader.readString("summary");

    // Read labels map from a single array with key-value pairs
    Map<String, String> labels = readLabelsMap(reader);

    int occurrenceCount = reader.readInt32("occurrenceCount");
    LocalDateTime firstSeenAt = reader.readTimestamp("firstSeenAt");
    LocalDateTime lastSeenAt = reader.readTimestamp("lastSeenAt");
    String status = reader.readString("status");
    String severity = reader.readString("severity");

    return new AlertEvent(
        id, sourceId, summary, labels, occurrenceCount, firstSeenAt, lastSeenAt, status, severity);
  }

  @Override
  public void write(CompactWriter writer, AlertEvent object) {
    writer.writeString("id", object.id());
    writer.writeString("sourceId", object.sourceId());
    writer.writeString("summary", object.summary());

    // Write labels map as a single array with key-value pairs
    writeLabelsMap(writer, object.labels());

    writer.writeInt32("occurrenceCount", object.occurrenceCount());
    writer.writeTimestamp("firstSeenAt", object.firstSeenAt());
    writer.writeTimestamp("lastSeenAt", object.lastSeenAt());
    writer.writeString("status", object.status());
    writer.writeString("severity", object.severity());
  }

  @Override
  public String getTypeName() {
    return "alertEvent";
  }

  @Override
  public Class<AlertEvent> getCompactClass() {
    return AlertEvent.class;
  }

  /**
   * Helper method to write Map<String, String> as a single array with key-value pairs Format:
   * [key1, value1, key2, value2, ...]
   */
  private void writeLabelsMap(CompactWriter writer, Map<String, String> labels) {
    if (labels == null || labels.isEmpty()) {
      // Write null for empty map (or empty array based on preference)
      writer.writeArrayOfString("labels", null);
    } else {
      // Convert map to a single array with alternating keys and values
      String[] labelsArray = new String[labels.size() * 2];
      int index = 0;
      for (Map.Entry<String, String> entry : labels.entrySet()) {
        labelsArray[index++] = entry.getKey();
        labelsArray[index++] = entry.getValue();
      }
      writer.writeArrayOfString("labels", labelsArray);
    }
  }

  /**
   * Helper method to read Map<String, String> from a single array with key-value pairs Format:
   * [key1, value1, key2, value2, ...]
   */
  private Map<String, String> readLabelsMap(CompactReader reader) {
    String[] labelsArray = reader.readArrayOfString("labels");

    if (labelsArray == null || labelsArray.length == 0) {
      return new HashMap<>();
    }

    // Validate array length is even (pairs of key-value)
    if (labelsArray.length % 2 != 0) {
      // Log warning or handle error - for now return empty map
      return new HashMap<>();
    }

    Map<String, String> labels = new HashMap<>(labelsArray.length / 2);
    for (int i = 0; i < labelsArray.length; i += 2) {
      String key = labelsArray[i];
      String value = labelsArray[i + 1];
      if (key != null) {
        labels.put(key, value);
      }
    }
    return labels;
  }
}
