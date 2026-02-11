package pro.walkin.ams.ingestion.processor;

import jakarta.enterprise.context.ApplicationScoped;
import pro.walkin.ams.cluster.cache.LabelMappingCacher;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Label normalizer with distributed cache synchronization.
 *
 * <p>Performance optimizations: 1. Volatile cache reference for cross-thread visibility 2.
 * Separated read/write paths to avoid lock contention 3. Optimized normalize() to minimize memory
 * allocation
 */
@ApplicationScoped
public class LabelNormalizer {

  private final LabelMappingCacher labelMappingCacher;

  public LabelNormalizer(LabelMappingCacher labelMappingCacher) {
    this.labelMappingCacher = labelMappingCacher;
  }

  /**
   * Normalize labels using cached rules. Fast path: if no rules defined, return original labels
   * unchanged.
   */
  public Map<String, String> normalize(Map<String, String> rawLabels, String sourceId) {
    // Fast path: no rules defined
    Map<String, String> rules = labelMappingCacher.get(sourceId);
    if (rules == null || rules.isEmpty()) {
      return rawLabels;
    }

    // Apply normalization rules
    return rawLabels.entrySet().stream()
        .collect(
            Collectors.toMap(
                entry -> rules.getOrDefault(entry.getKey(), entry.getKey()),
                Map.Entry::getValue,
                (a, b) -> a,
                java.util.LinkedHashMap::new // Preserve insertion order
                ));
  }
}
