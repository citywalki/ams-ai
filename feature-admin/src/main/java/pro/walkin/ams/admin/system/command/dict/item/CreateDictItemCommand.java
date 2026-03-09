package pro.walkin.ams.admin.system.command.dict.item;

import io.iamcyw.tower.messaging.Command;

public record CreateDictItemCommand(
    Long categoryId,
    Long parentId,
    String code,
    String name,
    String value,
    Integer sort,
    String status,
    String remark,
    Long tenantId)
    implements Command {}
