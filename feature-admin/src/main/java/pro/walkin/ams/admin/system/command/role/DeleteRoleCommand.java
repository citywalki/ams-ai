package pro.walkin.ams.admin.system.command.role;

import io.iamcyw.tower.messaging.Command;

public record DeleteRoleCommand(Long id) implements Command {}
