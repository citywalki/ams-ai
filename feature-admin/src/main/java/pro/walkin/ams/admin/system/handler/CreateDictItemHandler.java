package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.dict.item.CreateDictItemCommand;
import pro.walkin.ams.admin.system.query.DictCategoryQuery;
import pro.walkin.ams.admin.system.query.DictItemQuery;
import pro.walkin.ams.common.dto.DictItemResponse;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.DictCategory;
import pro.walkin.ams.persistence.entity.system.DictItem;

@ApplicationScoped
public class CreateDictItemHandler
    implements CommandHandler<CreateDictItemCommand, DictItemResponse> {

  @Inject DictItem.Repo itemRepo;

  @Inject DictItemQuery itemQuery;

  @Inject DictCategoryQuery categoryQuery;

  @Override
  @Transactional
  public DictItemResponse handle(CreateDictItemCommand cmd) {
    DictCategory category = categoryQuery.findById(cmd.categoryId());
    if (category == null) {
      throw new NotFoundException("DictCategory", cmd.categoryId().toString());
    }

    if (itemQuery.countByCodeAndCategoryId(cmd.code(), cmd.categoryId()) > 0) {
      throw new ValidationException("项编码在该分类下已存在", "code", cmd.code());
    }

    if (cmd.parentId() != null) {
      DictItem parent = itemQuery.findById(cmd.parentId());
      if (parent == null) {
        throw new NotFoundException("DictItem", cmd.parentId().toString());
      }
      if (!parent.categoryId.equals(cmd.categoryId())) {
        throw new ValidationException("父级字典项不属于该分类", "parentId", cmd.parentId());
      }
    }

    DictItem item = new DictItem();
    item.categoryId = cmd.categoryId();
    item.parentId = cmd.parentId();
    item.code = cmd.code();
    item.name = cmd.name();
    item.value = cmd.value();
    item.sort = cmd.sort();
    item.status = cmd.status() != null ? Integer.parseInt(cmd.status()) : 1;
    item.remark = cmd.remark();
    item.tenant = cmd.tenantId();
    item.persist();

    return toResponse(item);
  }

  private DictItemResponse toResponse(DictItem entity) {
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
        java.util.List.of());
  }
}
