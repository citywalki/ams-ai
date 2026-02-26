package pro.walkin.ams.security.initializer;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import pro.walkin.ams.persistence.entity.system.Tenant;
import pro.walkin.ams.persistence.entity.system.Tenant_;

@ApplicationScoped
public class TenantInitializer extends DataInitializer {

    @ConfigProperty(name = "ams.auth.init-default-data", defaultValue = "true")
    boolean initDefaultData;

    private Tenant defaultTenant;

    @Override
    public void initialize() {
        if (!initDefaultData) {
            return;
        }
        
        defaultTenant = Tenant_.repo().findByCode("default");
        if (defaultTenant == null) {
            defaultTenant = new Tenant();
            defaultTenant.code = "default";
            defaultTenant.name = "Default Tenant";
            defaultTenant.status = "ACTIVE";
            defaultTenant.persistAndFlush();
            log.info("Created default tenant");
        }
    }

    public Tenant getDefaultTenant() {
        return defaultTenant;
    }
}
