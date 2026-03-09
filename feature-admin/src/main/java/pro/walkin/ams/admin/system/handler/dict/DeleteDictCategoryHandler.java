package pro.walkin.ams.admin.system.handler.dict;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.dict.category.DeleteDictCategoryCommand;
import pro.walkin.ams.admin.system.query.DictCategoryQuery;
import pro.walkin.ams.admin.system.query.DictItemQuery;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.DictCategory;

@ApplicationScoped
public class DeleteDictCategoryHandler implements CommandHandler<DeleteDictCategoryCommand, Void> {

  @Inject DictCategory.Repo categoryRepo;

  @Inject DictCategoryQuery categoryQuery;

  @Inject DictItemQuery itemQuery;

  @Override
  @Transactional
  public Void handle(DeleteDictCategoryCommand cmd) {
    DictCategory category = categoryQuery.findById(cmd.id());
    if (category == null) {
      throw new NotFoundException("DictCategory", cmd.id().toString());
    }

    if (category.tenant != null && !category.tenant.equals(cmd.tenantId())) {
      throw new ValidationException("无权访问此分类", "id", cmd.id());
    }

    long itemCount = itemQuery.countByCategoryId(cmd.id());
    if (itemCount > 0) {
      throw new ValidationException("请先删除分类下的字典项", "id", cmd.id());
    }

    categoryRepo.delete(category);
    return null;
  }
}
