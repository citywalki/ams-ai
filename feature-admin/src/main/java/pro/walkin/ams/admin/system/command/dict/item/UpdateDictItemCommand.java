package pro.walkin.ams.admin.system.command.dict.item;

import io.iamcyw.tower.messaging.Command;

public record UpdateDictItemCommand(
    Long id,
    Long parentId,
    String code,
    String name,
    String value,
    Integer sort,
    String status,
    String remark)
    implements Command {}
