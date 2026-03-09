package pro.walkin.ams.admin.system.command.permission;

import io.iamcyw.tower.messaging.Command;

public record RevokePermissionFromRoleCommand(Long roleId, Long permissionId) implements Command {}
