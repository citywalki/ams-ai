package pro.walkin.ams.persistence.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.hibernate.orm.JsonFormat;
import io.quarkus.hibernate.orm.PersistenceUnitExtension;
import org.hibernate.type.descriptor.WrapperOptions;
import org.hibernate.type.descriptor.java.JavaType;
import org.hibernate.type.format.FormatMapper;

@JsonFormat
@PersistenceUnitExtension
public class CustomDatabaseJsonFormat implements FormatMapper {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  @Override
  public <T> T fromString(
      CharSequence charSequence, JavaType<T> javaType, WrapperOptions wrapperOptions) {
    try {
      return MAPPER.readValue(charSequence.toString(), javaType.getJavaTypeClass());
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public <T> String toString(T value, JavaType<T> javaType, WrapperOptions wrapperOptions) {
    try {
      return MAPPER.writeValueAsString(value);
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }
}
