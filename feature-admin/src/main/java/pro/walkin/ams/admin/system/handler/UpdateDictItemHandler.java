package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.dict.item.UpdateDictItemCommand;
import pro.walkin.ams.admin.system.query.DictItemQuery;
import pro.walkin.ams.common.dto.DictItemResponse;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.DictItem;

@ApplicationScoped
public class UpdateDictItemHandler
    implements CommandHandler<UpdateDictItemCommand, DictItemResponse> {

  @Inject DictItem.Repo itemRepo;

  @Inject DictItemQuery itemQuery;

  @Override
  @Transactional
  public DictItemResponse handle(UpdateDictItemCommand cmd) {
    DictItem item = itemQuery.findById(cmd.id());
    if (item == null) {
      throw new NotFoundException("DictItem", cmd.id().toString());
    }

    if (itemQuery.countByCodeAndCategoryIdExcludingId(cmd.code(), item.categoryId, cmd.id()) > 0) {
      throw new ValidationException("项编码在该分类下已存在", "code", cmd.code());
    }

    if (cmd.parentId() != null) {
      if (cmd.parentId().equals(cmd.id())) {
        throw new ValidationException("不能将自己设为父级", "parentId", cmd.parentId());
      }
      DictItem parent = itemQuery.findById(cmd.parentId());
      if (parent == null) {
        throw new NotFoundException("DictItem", cmd.parentId().toString());
      }
    }

    item.parentId = cmd.parentId();
    item.code = cmd.code();
    item.name = cmd.name();
    item.value = cmd.value();
    item.sort = cmd.sort();
    item.status = cmd.status() != null ? Integer.parseInt(cmd.status()) : 1;
    item.remark = cmd.remark();
    itemRepo.persist(item);

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
