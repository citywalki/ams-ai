package pro.walkin.ams.common.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 用户创建请求传输对象 */
public class UserDto {
  @NotBlank(message = "用户名不能为空")
  @Size(min = 2, max = 50, message = "用户名长度必须在2-50个字符之间")
  private String username;

  @Email(message = "邮箱格式不正确")
  private String email;

  @NotBlank(message = "密码不能为空")
  @Size(min = 8, max = 100, message = "密码长度必须在8-100个字符之间")
  private String password;

  @NotBlank(message = "状态不能为空")
  private String status;

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
}
