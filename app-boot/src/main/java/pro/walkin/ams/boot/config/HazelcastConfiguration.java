package pro.walkin.ams.boot.config;

import com.hazelcast.config.Config;
import com.hazelcast.config.YamlConfigBuilder;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;
import io.quarkus.arc.properties.IfBuildProperty;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.cluster.serializer.AlertEventSerializer;
import pro.walkin.ams.cluster.serializer.DeduplicationResultSerializer;
import pro.walkin.ams.cluster.serializer.DeduplicationStateSerializer;

import java.io.InputStream;

/**
 * Hazelcast 配置工厂
 *
 * <p>创建 Hazelcast 实例，支持集群配置。 优先使用 classpath 中的 hazelcast-config.yaml，如果不存在则使用默认配置。
 */
@ApplicationScoped
@IfBuildProperty(name = "hazelcast.enabled", stringValue = "true", enableIfMissing = true)
public class HazelcastConfiguration {

  private static final Logger LOG = LoggerFactory.getLogger(HazelcastConfiguration.class);
  private static final String CONFIG_PATH = "hazelcast-config.yaml";

  /** 生产 Hazelcast 实例 */
  @Produces
  @Singleton
  public HazelcastInstance produceHazelcastInstance() {
    Config config = loadConfig();
    config
        .getSerializationConfig()
        .getCompactSerializationConfig()
        .addSerializer(new DeduplicationStateSerializer())
        .addSerializer(new AlertEventSerializer())
        .addSerializer(new DeduplicationResultSerializer());

    HazelcastInstance instance = Hazelcast.newHazelcastInstance(config);
    LOG.info("Hazelcast instance started: {}", instance.getName());
    return instance;
  }

  /** 加载 Hazelcast 配置 */
  private Config loadConfig() {
    InputStream configStream = getClass().getClassLoader().getResourceAsStream(CONFIG_PATH);

    if (configStream != null) {
      LOG.debug("Loading Hazelcast configuration from: {}", CONFIG_PATH);
      try (InputStream is = configStream) {
        return new YamlConfigBuilder(configStream).build();
      } catch (Exception e) {
        LOG.warn("Failed to load Hazelcast configuration from {}, using default", CONFIG_PATH, e);
        return Config.load();
      }
    } else {
      LOG.debug("Hazelcast configuration not found at {}, using default", CONFIG_PATH);
      return Config.load();
    }
  }
}
