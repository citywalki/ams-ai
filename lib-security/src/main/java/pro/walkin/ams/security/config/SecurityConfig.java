package pro.walkin.ams.security.config;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.security.initializer.*;

@ApplicationScoped
public class SecurityConfig {

    private static final Logger LOG = LoggerFactory.getLogger(SecurityConfig.class);

    @ConfigProperty(name = "ams.auth.init-default-data", defaultValue = "true")
    boolean initDefaultData;

    @Inject
    TenantInitializer tenantInitializer;

    @Inject
    PermissionInitializer permissionInitializer;

    @Inject
    RoleInitializer roleInitializer;

    @Inject
    MenuInitializer menuInitializer;

    @Inject
    UserInitializer userInitializer;

    void onStart(@Observes StartupEvent ev) {
        LOG.info("Initializing security configuration...");
        if (initDefaultData) {
            tenantInitializer.initialize();
            permissionInitializer.initialize();
            roleInitializer.initialize();
            menuInitializer.initialize();
            userInitializer.initialize();
        }
        LOG.info("Security configuration initialization completed.");
    }
}
