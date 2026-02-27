package pro.walkin.ams.admin.system;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.admin.system.query.DictCategoryQuery;
import pro.walkin.ams.admin.system.query.DictItemQuery;
import pro.walkin.ams.common.dto.DictCategoryDto;
import pro.walkin.ams.common.dto.DictCategoryResponse;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.DictCategory;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@ApplicationScoped
@Transactional
public class DictCategoryService {
  private static final Logger LOG = LoggerFactory.getLogger(DictCategoryService.class);

  @Inject DictCategory.Repo categoryRepo;

  @Inject DictItemQuery itemQuery;

  @Inject DictCategoryQuery categoryQuery;

  public List<DictCategoryResponse> getAllCategories(Long tenantId) {
    List<DictCategory> categories = categoryQuery.listByTenant(tenantId);
    return categories.stream().map(this::mapToResponse).collect(Collectors.toList());
  }

  public DictCategoryResponse getById(Long id, Long tenantId) {
    DictCategory category = categoryQuery.findById(id);
    if (category == null) {
      throw new NotFoundException("DictCategory", id.toString());
    }
    validateTenantAccess(category, tenantId);
    return mapToResponse(category);
  }

  public DictCategoryResponse create(DictCategoryDto dto, Long tenantId) {
    Objects.requireNonNull(dto, "分类数据不能为空");

    if (categoryQuery.countByCodeAndTenant(dto.code(), tenantId) > 0) {
      throw new ValidationException("分类编码已存在", "code", dto.code());
    }

    DictCategory category = new DictCategory();
    category.code = dto.code();
    category.name = dto.name();
    category.description = dto.description();
    category.sort = dto.sort();
    category.status = dto.status();
    category.tenant = tenantId;
    category.persist();

    LOG.debug("创建字典分类成功: id={}, code={}", category.id, category.code);
    return mapToResponse(category);
  }

  public DictCategoryResponse update(Long id, DictCategoryDto dto, Long tenantId) {
    DictCategory category = categoryQuery.findById(id);
    if (category == null) {
      throw new NotFoundException("DictCategory", id.toString());
    }
    validateTenantAccess(category, tenantId);

    if (categoryQuery.countByCodeAndTenantExcludingId(dto.code(), tenantId, id) > 0) {
      throw new ValidationException("分类编码已存在", "code", dto.code());
    }

    category.code = dto.code();
    category.name = dto.name();
    category.description = dto.description();
    category.sort = dto.sort();
    category.status = dto.status();
    categoryRepo.persist(category);

    LOG.debug("更新字典分类成功: id={}", id);
    return mapToResponse(category);
  }

  public void delete(Long id, Long tenantId) {
    DictCategory category = categoryQuery.findById(id);
    if (category == null) {
      throw new NotFoundException("DictCategory", id.toString());
    }
    validateTenantAccess(category, tenantId);

    long itemCount = itemQuery.countByCategoryId(id);
    if (itemCount > 0) {
      throw new ValidationException("请先删除分类下的字典项", "id", id);
    }

    categoryRepo.delete(category);
    LOG.debug("删除字典分类成功: id={}", id);
  }

  private void validateTenantAccess(DictCategory category, Long tenantId) {
    if (category.tenant != null && !category.tenant.equals(tenantId)) {
      throw new ValidationException("无权访问此分类", "id", category.id);
    }
  }

  private DictCategoryResponse mapToResponse(DictCategory entity) {
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
