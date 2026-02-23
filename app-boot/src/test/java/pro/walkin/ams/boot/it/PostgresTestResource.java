package pro.walkin.ams.boot.it;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Map;

public class PostgresTestResource implements QuarkusTestResourceLifecycleManager {

    private static final PostgreSQLContainer<?> POSTGRES = 
        new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("ams_test")
            .withUsername("test")
            .withPassword("test");

    @Override
    public Map<String, String> start() {
        POSTGRES.start();
        return Map.of(
            "quarkus.datasource.jdbc.url", POSTGRES.getJdbcUrl(),
            "quarkus.datasource.username", POSTGRES.getUsername(),
            "quarkus.datasource.password", POSTGRES.getPassword(),
            "quarkus.datasource.db-kind", "postgresql"
        );
    }

    @Override
    public void stop() {
        POSTGRES.stop();
    }

    @Override
    public void init(Map<String, String> initArgs) {
        // No initialization needed
    }
}
