package pro.walkin.ams.admin.system.query;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import pro.walkin.ams.persistence.entity.system.DictItem;
import pro.walkin.ams.persistence.entity.system.DictItem_;

/**
 * 字典项查询类
 * 所有字典项相关的查询方法都放在这里
 */
@ApplicationScoped
public class DictItemQuery {

    public DictItem findById(Long id) {
        return DictItem_.managedBlocking().findById(id);
    }

    public List<DictItem> listByCategoryId(Long categoryId) {
        return DictItem_.managedBlocking().list("categoryId", categoryId);
    }

    public List<DictItem> listByCategoryIdAndTenant(Long categoryId, Long tenantId) {
        if (tenantId == null) {
            return listByCategoryId(categoryId);
        }
        return DictItem_.managedBlocking().list("categoryId = ?1 and (tenant = ?2 or tenant is null)", categoryId, tenantId);
    }

    public List<DictItem> listActiveByCategoryId(Long categoryId) {
        return DictItem_.managedBlocking().list("categoryId = ?1 and status = 1", categoryId);
    }

    public List<DictItem> listActiveByCategoryIdAndTenant(Long categoryId, Long tenantId) {
        if (tenantId == null) {
            return listActiveByCategoryId(categoryId);
        }
        return DictItem_.managedBlocking().list("categoryId = ?1 and status = 1 and (tenant = ?2 or tenant is null)", categoryId, tenantId);
    }

    public long countByCategoryId(Long categoryId) {
        return DictItem_.managedBlocking().count("categoryId", categoryId);
    }

    public long countByCodeAndCategoryId(String code, Long categoryId) {
        return DictItem_.managedBlocking().count("code = ?1 and categoryId = ?2", code, categoryId);
    }

    public long countByCodeAndCategoryIdExcludingId(String code, Long categoryId, Long excludeId) {
        return DictItem_.managedBlocking().count("code = ?1 and categoryId = ?2 and id != ?3", code, categoryId, excludeId);
    }

    public long countByParentId(Long parentId) {
        return DictItem_.managedBlocking().count("parentId", parentId);
    }
}
