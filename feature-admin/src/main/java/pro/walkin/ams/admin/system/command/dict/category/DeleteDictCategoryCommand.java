package pro.walkin.ams.admin.system.command.dict.category;

import io.iamcyw.tower.messaging.Command;

public record DeleteDictCategoryCommand(Long id, Long tenantId) implements Command {}
