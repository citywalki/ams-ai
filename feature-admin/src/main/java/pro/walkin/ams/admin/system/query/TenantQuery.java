package pro.walkin.ams.admin.system.query;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pro.walkin.ams.persistence.entity.system.Tenant;

/**
 * 租户查询类 所有租户相关的查询方法都放在这里
 */
@ApplicationScoped
public class TenantQuery {

  @Inject Tenant.Repo tenantRepo;

  public Tenant findByCode(String code) {
    return tenantRepo.findByCode(code);
  }
}
