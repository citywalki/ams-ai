package pro.walkin.ams.admin.system.query;

import jakarta.enterprise.context.ApplicationScoped;
import pro.walkin.ams.persistence.entity.system.Menu;
import pro.walkin.ams.persistence.entity.system.Menu_;

import java.util.List;
import java.util.Optional;

/** 菜单查询类 所有菜单相关的查询方法都放在这里 */
@ApplicationScoped
public class MenuQuery {

  public Menu findById(Long id) {
    return Menu_.managedBlocking().findById(id);
  }

  public Optional<Menu> findByIdOptional(Long id) {
    return Menu_.managedBlocking().findByIdOptional(id);
  }

  public Menu findByKey(String key) {
    return Menu_.managedBlocking().findByKey(key);
  }

  public Optional<Menu> findByKeyAndTenant(String key, Long tenantId) {
    return Menu_.managedBlocking()
        .find("key = ?1 and tenant = ?2", key, tenantId)
        .firstResultOptional();
  }

  public List<Menu> listByTenant(Long tenantId) {
    return Menu_.managedBlocking().list("tenant", tenantId);
  }

  public List<Menu> listByMenuTypeAndTenant(Menu.MenuType menuType, Long tenantId) {
    return Menu_.managedBlocking().list("menuType = ?1 and tenant = ?2", menuType, tenantId);
  }

  public List<Menu> listByParentIdAndTenant(Long parentId, Long tenantId) {
    return Menu_.managedBlocking().list("parentId = ?1 and tenant = ?2", parentId, tenantId);
  }

  public List<Menu> listByParentIdNotNullAndTenant(Long tenantId) {
    return Menu_.managedBlocking().list("parentId is not null and tenant = ?1", tenantId);
  }

  public long countByKey(String key) {
    return Menu_.managedBlocking().countByKey(key);
  }

  public long countByKeyAndTenantAndIdNot(String key, Long tenantId, Long excludeId) {
    return Menu_.managedBlocking()
        .count("key = ?1 and tenant = ?2 and id != ?3", key, tenantId, excludeId);
  }

  public long countByParentIdAndTenant(Long parentId, Long tenantId) {
    return Menu_.managedBlocking().count("parentId = ?1 and tenant = ?2", parentId, tenantId);
  }
}
