package pro.walkin.ams.boot.config;

import jakarta.inject.Singleton;
import jakarta.ws.rs.Produces;
import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.jdbctemplate.JdbcTemplateLockProvider;

import javax.sql.DataSource;

public class ShedLockConfiguration {

  @Produces
  @Singleton
  public LockProvider lockProvider(DataSource dataSource) {
    return new JdbcTemplateLockProvider(dataSource);
  }
}
