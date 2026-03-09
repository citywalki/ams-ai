package pro.walkin.ams.common.command;

import com.fasterxml.jackson.annotation.JsonInclude;

/** 通用 Command 响应包装类 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CommandResponse(boolean success, Object data, String errorCode, String errorMessage) {
  public static CommandResponse ok(Object data) {
    return new CommandResponse(true, data, null, null);
  }

  public static CommandResponse error(String errorMessage) {
    return new CommandResponse(false, null, "COMMAND_ERROR", errorMessage);
  }

  public static CommandResponse error(String errorCode, String errorMessage) {
    return new CommandResponse(false, null, errorCode, errorMessage);
  }
}
