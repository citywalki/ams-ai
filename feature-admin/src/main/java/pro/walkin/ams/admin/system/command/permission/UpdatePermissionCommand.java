package pro.walkin.ams.admin.system.command.permission;

import io.iamcyw.tower.messaging.Command;

public record UpdatePermissionCommand(
    Long id,
    String code,
    String name,
    String description,
    Long menuId,
    Integer sortOrder,
    String buttonType)
    implements Command {}
