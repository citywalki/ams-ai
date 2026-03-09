package pro.walkin.ams.admin.system.query;

import jakarta.enterprise.context.ApplicationScoped;
import pro.walkin.ams.common.dto.DictItemResponse;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.DictItem;
import pro.walkin.ams.persistence.entity.system.DictItem_;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** 字典项查询类 所有字典项相关的查询方法都放在这里 */
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
    return DictItem_.managedBlocking()
        .list("categoryId = ?1 and (tenant = ?2 or tenant is null)", categoryId, tenantId);
  }

  public List<DictItem> listActiveByCategoryId(Long categoryId) {
    return DictItem_.managedBlocking().list("categoryId = ?1 and status = 1", categoryId);
  }

  public List<DictItem> listActiveByCategoryIdAndTenant(Long categoryId, Long tenantId) {
    if (tenantId == null) {
      return listActiveByCategoryId(categoryId);
    }
    return DictItem_.managedBlocking()
        .list(
            "categoryId = ?1 and status = 1 and (tenant = ?2 or tenant is null)",
            categoryId,
            tenantId);
  }

  public long countByCategoryId(Long categoryId) {
    return DictItem_.managedBlocking().count("categoryId", categoryId);
  }

  public long countByCodeAndCategoryId(String code, Long categoryId) {
    return DictItem_.managedBlocking().count("code = ?1 and categoryId = ?2", code, categoryId);
  }

  public long countByCodeAndCategoryIdExcludingId(String code, Long categoryId, Long excludeId) {
    return DictItem_.managedBlocking()
        .count("code = ?1 and categoryId = ?2 and id != ?3", code, categoryId, excludeId);
  }

  public long countByParentId(Long parentId) {
    return DictItem_.managedBlocking().count("parentId", parentId);
  }

  // ========== DTO 查询方法 ==========

  public List<DictItemResponse> findByCategoryIdAsDto(Long categoryId, Long tenantId) {
    return listByCategoryIdAndTenant(categoryId, tenantId).stream()
        .sorted(Comparator.comparingInt(i -> i.sort != null ? i.sort : 0))
        .map(this::toResponseDto)
        .collect(Collectors.toList());
  }

  public List<DictItemResponse> findTreeByCategoryIdAsDto(Long categoryId, Long tenantId) {
    List<DictItem> items = listActiveByCategoryIdAndTenant(categoryId, tenantId);
    return buildTree(items);
  }

  public DictItemResponse findByIdAsDto(Long id, Long tenantId) {
    DictItem item = findById(id);
    if (item == null) {
      throw new NotFoundException("DictItem", id.toString());
    }
    if (item.tenant != null && !item.tenant.equals(tenantId)) {
      throw new ValidationException("无权访问此字典项", "id", id);
    }
    return toResponseDto(item);
  }

  private DictItemResponse toResponseDto(DictItem entity) {
    return new DictItemResponse(
        entity.id,
        entity.categoryId,
        entity.parentId,
        entity.code,
        entity.name,
        entity.value,
        entity.sort,
        entity.status,
        entity.remark,
        entity.tenant,
        entity.createdAt,
        entity.updatedAt,
        new ArrayList<>());
  }

  private List<DictItemResponse> buildTree(List<DictItem> items) {
    Map<Long, List<DictItem>> childrenByParentId =
        items.stream()
            .filter(i -> i.parentId != null)
            .collect(Collectors.groupingBy(i -> i.parentId));

    return items.stream()
        .filter(i -> i.parentId == null)
        .sorted(Comparator.comparingInt(i -> i.sort != null ? i.sort : 0))
        .map(i -> buildTreeNode(i, childrenByParentId))
        .collect(Collectors.toList());
  }

  private DictItemResponse buildTreeNode(
      DictItem item, Map<Long, List<DictItem>> childrenByParentId) {
    List<DictItem> children = childrenByParentId.getOrDefault(item.id, List.of());
    List<DictItemResponse> childResponses =
        children.stream()
            .sorted(Comparator.comparingInt(i -> i.sort != null ? i.sort : 0))
            .map(c -> buildTreeNode(c, childrenByParentId))
            .collect(Collectors.toList());

    return new DictItemResponse(
        item.id,
        item.categoryId,
        item.parentId,
        item.code,
        item.name,
        item.value,
        item.sort,
        item.status,
        item.remark,
        item.tenant,
        item.createdAt,
        item.updatedAt,
        childResponses);
  }
}
