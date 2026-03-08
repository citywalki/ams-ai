package pro.walkin.ams.common.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.module.kotlin.KotlinModule;

import java.io.IOException;

/** JSON 序列化器 - 处理对象的 JSON 序列化与反序列化 */
public class JsonSerializer {

  private static final ObjectMapper OBJECT_MAPPER = createObjectMapper();

  private JsonSerializer() {
    // 工具类，防止实例化
  }

  private static ObjectMapper createObjectMapper() {
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new JavaTimeModule());
    mapper.registerModule(new KotlinModule.Builder().build());
    mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    mapper.enable(DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_USING_DEFAULT_VALUE);
    return mapper;
  }

  /** 对象序列化为 JSON 字符串 */
  public static String toJson(Object value) {
    if (value == null) {
      return "null";
    }
    try {
      return OBJECT_MAPPER.writeValueAsString(value);
    } catch (IOException e) {
      throw new RuntimeException("Failed to convert object to JSON", e);
    }
  }

  /** JSON 字符串反序列化为对象 */
  public static <T> T fromJson(String json, Class<T> clazz) {
    if (json == null || json.trim().isEmpty()) {
      return null;
    }
    try {
      return OBJECT_MAPPER.readValue(json, clazz);
    } catch (IOException e) {
      throw new RuntimeException("Failed to parse JSON: " + json, e);
    }
  }

  /** JSON 字符串反序列化为对象（支持泛型） */
  public static <T> T fromJson(String json, TypeReference<T> typeReference) {
    if (json == null || json.trim().isEmpty()) {
      return null;
    }
    try {
      return OBJECT_MAPPER.readValue(json, typeReference);
    } catch (IOException e) {
      throw new RuntimeException("Failed to parse JSON: " + json, e);
    }
  }

  /** 对象序列化为格式化的 JSON 字符串 */
  public static String toPrettyJson(Object value) {
    if (value == null) {
      return "null";
    }
    try {
      return OBJECT_MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(value);
    } catch (IOException e) {
      throw new RuntimeException("Failed to convert object to pretty JSON", e);
    }
  }

  /** 检查字符串是否为有效的 JSON */
  public static boolean isValidJson(String json) {
    if (json == null || json.trim().isEmpty()) {
      return false;
    }
    try {
      OBJECT_MAPPER.readTree(json);
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  /** 对象类型转换 */
  public static <T> T convertValue(Object from, Class<T> toType) {
    return OBJECT_MAPPER.convertValue(from, toType);
  }
}
