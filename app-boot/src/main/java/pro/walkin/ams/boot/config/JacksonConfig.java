package pro.walkin.ams.boot.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.quarkus.jackson.ObjectMapperCustomizer;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
@Priority(Integer.MAX_VALUE)
public class JacksonConfig implements ObjectMapperCustomizer {

    @Override
    public void customize(ObjectMapper mapper) {
        SimpleModule module = new SimpleModule();
        module.addSerializer(Long.class, ToStringSerializer.instance);
        module.addSerializer(Long.TYPE, ToStringSerializer.instance);
        mapper.registerModule(module);

        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
