package pro.walkin.ams.admin.system.command.permission;

import io.iamcyw.tower.messaging.Command;

public record DeletePermissionCommand(Long id) implements Command {}
