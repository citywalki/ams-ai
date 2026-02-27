package pro.walkin.ams.admin.system.query;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import pro.walkin.ams.persistence.entity.system.DictCategory;
import pro.walkin.ams.persistence.entity.system.DictCategory_;

/**
 * 字典分类查询类
 * 所有字典分类相关的查询方法都放在这里
 */
@ApplicationScoped
public class DictCategoryQuery {

    public DictCategory findById(Long id) {
        return DictCategory_.managedBlocking().findById(id);
    }

    public List<DictCategory> listAll() {
        return DictCategory_.managedBlocking().listAll();
    }

    public List<DictCategory> listByTenant(Long tenantId) {
        if (tenantId == null) {
            return listAll();
        }
        return DictCategory_.managedBlocking().list("tenant = ?1 or tenant is null", tenantId);
    }

    public long countByCodeAndTenant(String code, Long tenantId) {
        if (tenantId == null) {
            return DictCategory_.managedBlocking().count("code = ?1 and tenant is null", code);
        }
        return DictCategory_.managedBlocking().count("code = ?1 and tenant = ?2", code, tenantId);
    }

    public long countByCodeAndTenantExcludingId(String code, Long tenantId, Long excludeId) {
        if (tenantId == null) {
            return DictCategory_.managedBlocking().count("code = ?1 and tenant is null and id != ?2", code, excludeId);
        }
        return DictCategory_.managedBlocking().count("code = ?1 and tenant = ?2 and id != ?3", code, tenantId, excludeId);
    }
}
