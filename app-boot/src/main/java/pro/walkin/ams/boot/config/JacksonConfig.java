package pro.walkin.ams.boot.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.quarkus.jackson.ObjectMapperCustomizer;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import java.io.IOException;

@ApplicationScoped
@Priority(Integer.MAX_VALUE)
public class JacksonConfig implements ObjectMapperCustomizer {

    @Override
    public void customize(ObjectMapper mapper) {
        SimpleModule module = new SimpleModule();
        module.addSerializer(Long.class, ToStringSerializer.instance);
        module.addSerializer(Long.TYPE, ToStringSerializer.instance);
        module.addDeserializer(Long.class, new LongDeserializer());
        module.addDeserializer(Long.TYPE, new LongDeserializer());
        mapper.registerModule(module);

        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    public static class LongDeserializer extends JsonDeserializer<Long> {
        @Override
        public Long deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            String value = p.getValueAsString();
            if (value == null || value.isEmpty()) {
                return null;
            }
            return Long.parseLong(value);
        }
    }
}
