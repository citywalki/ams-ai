package pro.walkin.ams.admin.system.command.dict.category;

import io.iamcyw.tower.messaging.Command;

public record CreateDictCategoryCommand(
    String code, String name, String description, Integer sort, String status, Long tenantId)
    implements Command {}
