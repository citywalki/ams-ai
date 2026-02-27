package pro.walkin.ams.cluster.cache;

import io.quarkus.cache.Cache;
import io.quarkus.cache.CacheName;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.persistence.entity.modeling.LabelMapping;

import java.util.Map;
import java.util.stream.Collectors;

@ApplicationScoped
public class LabelMappingCacher {
  private static final Logger log = LoggerFactory.getLogger(LabelMappingCacher.class);

  private static final String CACHE_NAME = "LabelMappingCache";

  @Inject
  @CacheName(CACHE_NAME)
  Cache cache;

  @Inject LabelMapping.Repo labelMappingRepo;

  public Map<String, String> get(String key) {
    return cache
        .get(
            key,
            sourceId ->
                labelMappingRepo.findBySourceId(sourceId).stream()
                    .collect(
                        Collectors.toMap(
                            mapping -> mapping.sourceKey,
                            mapping -> mapping.targetKey,
                            (a, b) -> a)))
        .await()
        .indefinitely();
  }
}
