package pro.walkin.ams.admin.system.command.dict.category;

import io.iamcyw.tower.messaging.Command;

public record UpdateDictCategoryCommand(
    Long id, String code, String name, String description, Integer sort, String status)
    implements Command {}
