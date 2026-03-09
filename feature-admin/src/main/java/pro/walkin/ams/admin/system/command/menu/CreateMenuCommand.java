package pro.walkin.ams.admin.system.command.menu;

import io.iamcyw.tower.messaging.Command;

public record CreateMenuCommand(
    String key,
    String label,
    String path,
    String icon,
    Long parentId,
    Integer sortOrder,
    String status,
    Long tenantId)
    implements Command {}
