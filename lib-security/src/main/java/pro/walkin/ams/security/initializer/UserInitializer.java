package pro.walkin.ams.security.initializer;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.persistence.entity.system.Role_;
import pro.walkin.ams.persistence.entity.system.Tenant;
import pro.walkin.ams.persistence.entity.system.User;
import pro.walkin.ams.persistence.entity.system.User_;
import pro.walkin.ams.security.PasswordService;

@ApplicationScoped
public class UserInitializer extends DataInitializer {

    @Inject
    TenantInitializer tenantInitializer;

    @Inject
    RoleInitializer roleInitializer;

    @Inject
    PasswordService passwordService;

  @Override
  @Transactional
  public void initialize() {
        Tenant tenant = tenantInitializer.getDefaultTenant();
        if (tenant == null) {
            log.warn("Default tenant not found, skipping user initialization");
            return;
        }

        long adminCount = User_.repo().count("username", "admin");
        if (adminCount == 0) {
            createUser("admin", "admin@example.com", "Admin123!", Constants.Auth.ROLE_ADMIN, tenant);
            log.info("Created default admin user with username 'admin' and password 'Admin123!'");
        } else {
            User existingAdmin = User_.repo().find("username", "admin").firstResult();
            log.info("Admin user already exists with id: {}", existingAdmin != null ? existingAdmin.id : "unknown");
        }
    }

    private void createUser(String username, String email, String password, String roleCode, Tenant tenant) {
        User user = new User();
        user.username = username;
        user.email = email;
        user.passwordHash = passwordService.hashPassword(password);
        user.status = Constants.User.STATUS_ACTIVE;
        user.tenant = tenant.id;
        user.persistAndFlush();

        Role_.repo().findByCode(roleCode).ifPresent(role -> {
            user.roles.add(role);
            user.persist();
        });
    }
}
