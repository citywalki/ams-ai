package pro.walkin.ams.admin.system;

import io.quarkus.hibernate.panache.blocking.PanacheBlockingQuery;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import pro.walkin.ams.persistence.entity.system.*;

@ApplicationScoped
public class PermissionService {

    @Transactional
    public Permission createPermission(Permission permission) {
        permission.persist();
        return permission;
    }

    public Optional<Permission> findById(Long id) {
        return Permission_.managedBlocking().findByIdOptional(id);
    }

    public List<Permission> findAll(int page, int size) {
        PanacheBlockingQuery<Permission> query = Permission_.managedBlocking().findAll();
        return query.page(page, size).list();
    }

    public long count() {
        return Permission_.managedBlocking().count();
    }

    @Transactional
    public Permission updatePermission(Long id, Permission updatedPermission) {
        Permission existingPermission = Permission_.managedBlocking().findById(id);
        if (existingPermission != null) {
            existingPermission.code = updatedPermission.code;
            existingPermission.name = updatedPermission.name;
            existingPermission.description = updatedPermission.description;
        }
        return existingPermission;
    }

    @Transactional
    public void deletePermission(Long id) {
        Permission_.managedBlocking().deleteById(id);
    }

    public Optional<Permission> findByCode(String code) {
        return Permission_.managedBlocking().find("code", code).firstResultOptional();
    }
}