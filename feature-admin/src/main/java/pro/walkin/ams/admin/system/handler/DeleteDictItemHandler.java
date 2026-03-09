package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.dict.item.DeleteDictItemCommand;
import pro.walkin.ams.admin.system.query.DictItemQuery;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.DictItem;

@ApplicationScoped
public class DeleteDictItemHandler implements CommandHandler<DeleteDictItemCommand, Void> {

  @Inject DictItem.Repo itemRepo;

  @Inject DictItemQuery itemQuery;

  @Override
  @Transactional
  public Void handle(DeleteDictItemCommand cmd) {
    DictItem item = itemQuery.findById(cmd.id());
    if (item == null) {
      throw new NotFoundException("DictItem", cmd.id().toString());
    }

    if (item.tenant != null && !item.tenant.equals(cmd.tenantId())) {
      throw new ValidationException("无权访问此字典项", "id", cmd.id());
    }

    if (itemQuery.countByParentId(cmd.id()) > 0) {
      throw new ValidationException("请先删除子级字典项", "id", cmd.id());
    }

    itemRepo.delete(item);
    return null;
  }
}
