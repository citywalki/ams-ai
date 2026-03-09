package pro.walkin.ams.admin.system.command.user;

import io.iamcyw.tower.messaging.Command;

public record CreateUserCommand(
    String username, String email, String password, String status, Long tenantId)
    implements Command {}
