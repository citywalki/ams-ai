package pro.walkin.ams.admin.system.handler.dict;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.dict.category.UpdateDictCategoryCommand;
import pro.walkin.ams.admin.system.query.DictCategoryQuery;
import pro.walkin.ams.admin.system.query.DictItemQuery;
import pro.walkin.ams.common.dto.DictCategoryResponse;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.DictCategory;

@ApplicationScoped
public class UpdateDictCategoryHandler
    implements CommandHandler<UpdateDictCategoryCommand, DictCategoryResponse> {

  @Inject DictCategory.Repo categoryRepo;

  @Inject DictCategoryQuery categoryQuery;

  @Inject DictItemQuery itemQuery;

  @Override
  @Transactional
  public DictCategoryResponse handle(UpdateDictCategoryCommand cmd) {
    DictCategory category = categoryQuery.findById(cmd.id());
    if (category == null) {
      throw new NotFoundException("DictCategory", cmd.id().toString());
    }

    if (categoryQuery.countByCodeAndTenantExcludingId(cmd.code(), category.tenant, cmd.id()) > 0) {
      throw new ValidationException("分类编码已存在", "code", cmd.code());
    }

    category.code = cmd.code();
    category.name = cmd.name();
    category.description = cmd.description();
    category.sort = cmd.sort();
    category.status = cmd.status() != null ? Integer.parseInt(cmd.status()) : 1;
    categoryRepo.persist(category);

    return toResponse(category);
  }

  private DictCategoryResponse toResponse(DictCategory entity) {
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
