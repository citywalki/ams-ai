package pro.walkin.ams.admin.system.command.role;

import io.iamcyw.tower.messaging.Command;

public record UpdateRoleCommand(Long id, String code, String name, String description)
    implements Command {}
