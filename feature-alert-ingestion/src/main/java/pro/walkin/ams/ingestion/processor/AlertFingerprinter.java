package pro.walkin.ams.ingestion.processor;

import org.apache.commons.codec.digest.DigestUtils;

import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Alert fingerprint calculator for deduplication. Converts normalized labels into MD5 hash by
 * excluding dynamic fields.
 */
public final class AlertFingerprinter {

  private AlertFingerprinter() {
    // Utility class - prevent instantiation
  }

  /**
   * Calculate fingerprint from labels by excluding dynamic fields.
   *
   * @param data Raw label map from alert source
   * @return MD5 hash of sorted, filtered labels
   */
  public static String calculate(Map<String, String> data) {
    // Exclude dynamic fields (timestamp, value)
    TreeMap<String, String> identityFields =
        data.entrySet().stream()
            .filter(entry -> !entry.getKey().equals("timestamp") && !entry.getKey().equals("value"))
            .collect(
                Collectors.toMap(
                    Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, TreeMap::new));

    // Sort and join with pipe delimiter for stable MD5
    String rawString =
        identityFields.entrySet().stream()
            .map(entry -> entry.getKey() + "=" + entry.getValue())
            .collect(Collectors.joining("|"));

    return DigestUtils.md5Hex(rawString.getBytes());
  }
}
