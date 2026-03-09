package pro.walkin.ams.admin.system.command.user;

import io.iamcyw.tower.messaging.Command;

public record UpdateUserCommand(Long id, String username, String email, String status)
    implements Command {}
