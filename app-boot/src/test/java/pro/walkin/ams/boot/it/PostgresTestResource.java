package pro.walkin.ams.boot.it;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Map;

public class PostgresTestResource implements QuarkusTestResourceLifecycleManager {

  private PostgreSQLContainer<?> postgres;

  @Override
  public Map<String, String> start() {
    postgres =
        new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("ams_test")
            .withUsername("test")
            .withPassword("test");
    postgres.start();
    return Map.of(
        "quarkus.datasource.jdbc.url", postgres.getJdbcUrl(),
        "quarkus.datasource.username", postgres.getUsername(),
        "quarkus.datasource.password", postgres.getPassword(),
        "quarkus.datasource.db-kind", "postgresql");
  }

  @Override
  public void stop() {
    if (postgres != null) {
      postgres.stop();
    }
  }
}
