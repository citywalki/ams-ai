package pro.walkin.ams.ingestion.config;

import io.smallrye.config.ConfigMapping;

/**
 * 告警接入模块配置类
 *
 * <p>集中管理告警接入模块的所有可配置参数
 */
@ConfigMapping(prefix = "ams.alert.ingestion")
public interface AlertIngestionConfig {

  /** 去重时间窗口（毫秒） 默认值：300000ms（5分钟） */
  long deduplicationTimeWindowMs();

  /** 最大去重计数 默认值：10 */
  int deduplicationMaxCount();

  /** 队列发布超时时间（毫秒） 默认值：100ms */
  long queueOfferTimeoutMs();
}
