package pro.walkin.ams.admin.system.command.role;

import io.iamcyw.tower.messaging.Command;

public record CreateRoleCommand(String code, String name, String description, Long tenantId)
    implements Command {}
