package pro.walkin.ams.ingestion.mapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.runtime.util.StringUtil;
import jakarta.enterprise.context.ApplicationScoped;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.cluster.cache.LabelMappingCacher;
import pro.walkin.ams.common.dto.AlertEvent;
import pro.walkin.ams.ingestion.AlertMapper;

import java.util.*;

/**
 * 默认告警映射器实现
 *
 * <p>负责将原始告警数据（JSON格式）转换为标准的AlertEvent对象。 支持根据数据源配置的标签映射规则，从原始JSON中提取标签值。
 */
@ApplicationScoped
public class DefaultAlertMapper {

  private static final Logger log = LoggerFactory.getLogger(DefaultAlertMapper.class);

  /** JSON解析器 */
  private final ObjectMapper objectMapper;

  /** 标签映射配置缓存 */
  private final LabelMappingCacher labelMappingCacher;

  /**
   * 构造函数
   *
   * @param objectMapper JSON解析器
   * @param labelMappingCacher 标签映射配置缓存
   */
  public DefaultAlertMapper(ObjectMapper objectMapper, LabelMappingCacher labelMappingCacher) {
    this.objectMapper = Objects.requireNonNull(objectMapper, "objectMapper must not be null");
    this.labelMappingCacher =
        Objects.requireNonNull(labelMappingCacher, "labelMappingCacher must not be null");
  }

  /**
   * 将原始告警数据映射为AlertEvent对象列表
   *
   * @param rawJson 原始告警数据（JSON格式）
   * @return 转换后的AlertEvent对象列表
   */
  public List<AlertEvent> map(String source, String rawJson) {
    if (StringUtil.isNullOrEmpty(rawJson)) {
      log.warn("Received empty rawJson for source={}", source);
      return Collections.emptyList();
    }

    List<AlertEvent> events = new ArrayList<>();

    JsonNode rawJsonNode;
    try {
      rawJsonNode = this.objectMapper.readTree(rawJson);
    } catch (Exception e) {
      log.error("Failed to parse rawJson for source={}", source, e);
      return events;
    }

    if (rawJsonNode.isArray()) {
      for (JsonNode jsonNode : rawJsonNode) {
        events.add(mapSingle(source, jsonNode));
      }
    } else {
      events.add(mapSingle(source, rawJsonNode));
    }

    return events;
  }

  private AlertEvent mapSingle(String source, JsonNode jsonNode) {

    Map<String, String> labels = extractLabelMapping(source, jsonNode);

    return AlertEvent.builder().sourceId(source).labels(labels).build();
  }

  /**
   * 从原始JSON中提取标签值
   *
   * <p>根据数据源的标签映射配置，从原始JSON中提取对应的标签值。 标签映射配置定义了标签名称到JSON路径的映射关系。
   *
   * @param jsonNode 原始告警数据（JsonNode格式）
   * @return 标签键值对Map，如果未找到映射配置则返回空Map
   */
  private Map<String, String> extractLabelMapping(String source, JsonNode jsonNode) {
    // 获取数据源的标签映射配置
    Map<String, String> labelMapping = labelMappingCacher.get(source);
    if (labelMapping == null) {
      log.debug("No label mapping found for source={}", source);
      return Map.of();
    }

    // 遍历标签映射配置，提取对应的标签值
    Map<String, String> labelValues = new HashMap<>();

    labelMapping.forEach(
        (label, valuePath) -> {
          // 使用JSON Path提取值
          JsonNode labelValueNode = jsonNode.at(valuePath);

          // 将提取的值存入结果Map（跳过缺失节点）
          if (!labelValueNode.isMissingNode()) {
            labelValues.put(label, labelValueNode.textValue());
          }
        });

    return labelValues;
  }
}
