package pro.walkin.ams.admin.system.command.user;

import io.iamcyw.tower.messaging.Command;

public record ResetPasswordCommand(Long id, String newPassword) implements Command {}
