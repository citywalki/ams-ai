package pro.walkin.ams.admin.system.query;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pro.walkin.ams.common.dto.DictCategoryResponse;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.DictCategory;
import pro.walkin.ams.persistence.entity.system.DictCategory_;

import java.util.List;
import java.util.stream.Collectors;

/** 字典分类查询类 所有字典分类相关的查询方法都放在这里 */
@ApplicationScoped
public class DictCategoryQuery {

  @Inject DictItemQuery itemQuery;

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
      return DictCategory_.managedBlocking()
          .count("code = ?1 and tenant is null and id != ?2", code, excludeId);
    }
    return DictCategory_.managedBlocking()
        .count("code = ?1 and tenant = ?2 and id != ?3", code, tenantId, excludeId);
  }

  // ========== DTO 查询方法 ==========

  public List<DictCategoryResponse> findAllAsDto(Long tenantId) {
    return listByTenant(tenantId).stream().map(this::toResponseDto).collect(Collectors.toList());
  }

  public DictCategoryResponse findByIdAsDto(Long id, Long tenantId) {
    DictCategory category = findById(id);
    if (category == null) {
      throw new NotFoundException("DictCategory", id.toString());
    }
    if (category.tenant != null && !category.tenant.equals(tenantId)) {
      throw new ValidationException("无权访问此分类", "id", id);
    }
    return toResponseDto(category);
  }

  private DictCategoryResponse toResponseDto(DictCategory entity) {
    long itemCount = itemQuery.countByCategoryId(entity.id);
    return new DictCategoryResponse(
        entity.id,
        entity.code,
        entity.name,
        entity.description,
        entity.sort,
        entity.status,
        entity.tenant,
        entity.createdAt,
        entity.updatedAt,
        itemCount);
  }
}
