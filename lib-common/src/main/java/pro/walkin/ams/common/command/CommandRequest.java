package pro.walkin.ams.common.command;

import com.fasterxml.jackson.databind.JsonNode;

/** 通用 Command 请求包装类 */
public record CommandRequest(
    /**
     * Command 类型，必须是完整的类名或简名 例如："CreateUserCommand" 或
     * "pro.walkin.ams.admin.system.command.user.CreateUserCommand"
     */
    String type,

    /** Command 的 payload 数据 */
    JsonNode payload) {}
