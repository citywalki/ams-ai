package pro.walkin.ams.admin.system;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.dto.DictItemDto;
import pro.walkin.ams.common.dto.DictItemResponse;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.DictCategory;
import pro.walkin.ams.persistence.entity.system.DictItem;

@ApplicationScoped
@Transactional
public class DictItemService {
    private static final Logger LOG = LoggerFactory.getLogger(DictItemService.class);

    @Inject
    DictItem.Repo itemRepo;

    @Inject
    DictCategory.Repo categoryRepo;

    public List<DictItemResponse> getByCategoryId(Long categoryId, Long tenantId) {
        List<DictItem> items;
        if (tenantId == null) {
            items = itemRepo.list("categoryId", categoryId);
        } else {
            items = itemRepo.list("categoryId = ?1 and (tenant = ?2 or tenant is null)", categoryId, tenantId);
        }
        return items.stream()
            .sorted(Comparator.comparingInt(i -> i.sort != null ? i.sort : 0))
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public List<DictItemResponse> getTreeByCategoryId(Long categoryId, Long tenantId) {
        List<DictItem> items;
        if (tenantId == null) {
            items = itemRepo.list("categoryId = ?1 and status = 1", categoryId);
        } else {
            items = itemRepo.list("categoryId = ?1 and status = 1 and (tenant = ?2 or tenant is null)", categoryId, tenantId);
        }
        return buildTree(items);
    }

    public DictItemResponse getById(Long id, Long tenantId) {
        DictItem item = itemRepo.findById(id);
        if (item == null) {
            throw new NotFoundException("DictItem", id.toString());
        }
        validateTenantAccess(item, tenantId);
        return mapToResponse(item);
    }

    public DictItemResponse create(DictItemDto dto, Long tenantId) {
        Objects.requireNonNull(dto, "字典项数据不能为空");

        DictCategory category = categoryRepo.findById(dto.categoryId());
        if (category == null) {
            throw new NotFoundException("DictCategory", dto.categoryId().toString());
        }

        if (itemRepo.countByCodeAndCategoryId(dto.code(), dto.categoryId()) > 0) {
            throw new ValidationException("项编码在该分类下已存在", "code", dto.code());
        }

        if (dto.parentId() != null) {
            DictItem parent = itemRepo.findById(dto.parentId());
            if (parent == null) {
                throw new NotFoundException("DictItem", dto.parentId().toString());
            }
            if (!parent.categoryId.equals(dto.categoryId())) {
                throw new ValidationException("父级字典项不属于该分类", "parentId", dto.parentId());
            }
        }

        DictItem item = new DictItem();
        item.categoryId = dto.categoryId();
        item.parentId = dto.parentId();
        item.code = dto.code();
        item.name = dto.name();
        item.value = dto.value();
        item.sort = dto.sort();
        item.status = dto.status();
        item.remark = dto.remark();
        item.tenant = tenantId;
        item.persist();

        LOG.debug("创建字典项成功: id={}, code={}", item.id, item.code);
        return mapToResponse(item);
    }

    public DictItemResponse update(Long id, DictItemDto dto, Long tenantId) {
        DictItem item = itemRepo.findById(id);
        if (item == null) {
            throw new NotFoundException("DictItem", id.toString());
        }
        validateTenantAccess(item, tenantId);

        if (!dto.categoryId().equals(item.categoryId)) {
            throw new ValidationException("不允许修改所属分类", "categoryId", dto.categoryId());
        }

        if (itemRepo.countByCodeAndCategoryIdExcludingId(dto.code(), dto.categoryId(), id) > 0) {
            throw new ValidationException("项编码在该分类下已存在", "code", dto.code());
        }

        if (dto.parentId() != null) {
            if (dto.parentId().equals(id)) {
                throw new ValidationException("不能将自己设为父级", "parentId", dto.parentId());
            }
            DictItem parent = itemRepo.findById(dto.parentId());
            if (parent == null) {
                throw new NotFoundException("DictItem", dto.parentId().toString());
            }
        }

        item.parentId = dto.parentId();
        item.code = dto.code();
        item.name = dto.name();
        item.value = dto.value();
        item.sort = dto.sort();
        item.status = dto.status();
        item.remark = dto.remark();
        itemRepo.persist(item);

        LOG.debug("更新字典项成功: id={}", id);
        return mapToResponse(item);
    }

    public void delete(Long id, Long tenantId) {
        DictItem item = itemRepo.findById(id);
        if (item == null) {
            throw new NotFoundException("DictItem", id.toString());
        }
        validateTenantAccess(item, tenantId);

        if (itemRepo.countByParentId(id) > 0) {
            throw new ValidationException("请先删除子级字典项", "id", id);
        }

        itemRepo.delete(item);
        LOG.debug("删除字典项成功: id={}", id);
    }

    private void validateTenantAccess(DictItem item, Long tenantId) {
        if (item.tenant != null && !item.tenant.equals(tenantId)) {
            throw new ValidationException("无权访问此字典项", "id", item.id);
        }
    }

    private DictItemResponse mapToResponse(DictItem entity) {
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
            new ArrayList<>()
        );
    }

    private List<DictItemResponse> buildTree(List<DictItem> items) {
        Map<Long, List<DictItem>> childrenByParentId = items.stream()
            .filter(i -> i.parentId != null)
            .collect(Collectors.groupingBy(i -> i.parentId));

        return items.stream()
            .filter(i -> i.parentId == null)
            .sorted(Comparator.comparingInt(i -> i.sort != null ? i.sort : 0))
            .map(i -> buildTreeNode(i, childrenByParentId))
            .collect(Collectors.toList());
    }

    private DictItemResponse buildTreeNode(DictItem item, Map<Long, List<DictItem>> childrenByParentId) {
        List<DictItem> children = childrenByParentId.getOrDefault(item.id, List.of());
        List<DictItemResponse> childResponses = children.stream()
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
            childResponses
        );
    }
}
