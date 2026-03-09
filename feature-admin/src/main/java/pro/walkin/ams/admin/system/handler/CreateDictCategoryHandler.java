package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.dict.category.CreateDictCategoryCommand;
import pro.walkin.ams.admin.system.query.DictCategoryQuery;
import pro.walkin.ams.admin.system.query.DictItemQuery;
import pro.walkin.ams.common.dto.DictCategoryResponse;
import pro.walkin.ams.common.exception.ValidationException;
import pro.walkin.ams.persistence.entity.system.DictCategory;

@ApplicationScoped
public class CreateDictCategoryHandler
    implements CommandHandler<CreateDictCategoryCommand, DictCategoryResponse> {

  @Inject DictCategory.Repo categoryRepo;

  @Inject DictCategoryQuery categoryQuery;

  @Inject DictItemQuery itemQuery;

  @Override
  @Transactional
  public DictCategoryResponse handle(CreateDictCategoryCommand cmd) {
    if (categoryQuery.countByCodeAndTenant(cmd.code(), cmd.tenantId()) > 0) {
      throw new ValidationException("分类编码已存在", "code", cmd.code());
    }

    DictCategory category = new DictCategory();
    category.code = cmd.code();
    category.name = cmd.name();
    category.description = cmd.description();
    category.sort = cmd.sort();
    category.status = cmd.status() != null ? Integer.parseInt(cmd.status()) : 1;
    category.tenant = cmd.tenantId();
    category.persist();

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
