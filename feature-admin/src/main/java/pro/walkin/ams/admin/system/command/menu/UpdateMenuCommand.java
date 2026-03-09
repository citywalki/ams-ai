package pro.walkin.ams.admin.system.command.menu;

import io.iamcyw.tower.messaging.Command;

public record UpdateMenuCommand(
    Long id,
    String key,
    String label,
    String path,
    String icon,
    Long parentId,
    Integer sortOrder,
    String status)
    implements Command {}
