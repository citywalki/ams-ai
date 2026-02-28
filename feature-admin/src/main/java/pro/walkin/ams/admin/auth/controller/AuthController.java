package pro.walkin.ams.admin.auth.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.admin.auth.service.AuthenticationService;
import pro.walkin.ams.common.Constants.ErrorCode;
import pro.walkin.ams.common.dto.ErrorResponse;
import pro.walkin.ams.common.security.util.SecurityUtils;

import java.util.Set;
import java.util.stream.Collectors;

/** 认证控制器 */
@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthController {

  private static final Logger LOG = LoggerFactory.getLogger(AuthController.class);

  @Inject AuthenticationService authenticationService;

  /** 用户登录 */
  @POST
  @Path("/login")
  @PermitAll
  public Response login(@Valid LoginRequest request) {
    var result = authenticationService.login(request.username, request.password);

    if (result.isPresent()) {
      var authResult = result.get();
      return Response.ok(
              new LoginResponse(
                  authResult.user.id,
                  authResult.user.username,
                  authResult.accessToken,
                  authResult.refreshToken,
                  authResult.user.tenant))
          .build();
    } else {
      return Response.status(Response.Status.UNAUTHORIZED)
          .entity(
              new ErrorResponse(ErrorCode.AUTHENTICATION_FAILED, "Invalid username or password"))
          .build();
    }
  }

  /** 用户登出 */
  @POST
  @Path("/logout")
  public Response logout() {
    return Response.ok(new SuccessResponse("Logged out successfully")).build();
  }

  /** 刷新访问令牌 */
  @POST
  @Path("/refresh")
  @PermitAll
  public Response refreshToken(@Valid RefreshTokenRequest request) {
    var newAccessToken = authenticationService.refreshAccessToken(request.refreshToken);

    if (newAccessToken.isPresent()) {
      return Response.ok(new AccessTokenResponse(newAccessToken.get())).build();
    } else {
      return Response.status(Response.Status.UNAUTHORIZED)
          .entity(new ErrorResponse(ErrorCode.INVALID_TOKEN, "Invalid or expired refresh token"))
          .build();
    }
  }

  /** 用户注册 */
  @POST
  @Path("/register")
  @PermitAll
  public Response register(@Valid RegisterRequest request) {
    var user =
        authenticationService.registerUser(
            request.username, request.email, request.password, request.roleCode);

    return Response.status(Response.Status.CREATED)
        .entity(new RegisterResponse(user.id, user.username, user.email))
        .build();
  }

  /** 更改密码 */
  @PUT
  @Path("/change-password")
  public Response changePassword(@Valid ChangePasswordRequest request) {
    boolean success =
        authenticationService.changePassword(
            request.userId, request.oldPassword, request.newPassword);

    if (success) {
      return Response.ok(new SuccessResponse("Password changed successfully")).build();
    } else {
      return Response.status(Response.Status.BAD_REQUEST)
          .entity(new ErrorResponse(ErrorCode.BUSINESS_ERROR, "Failed to change password"))
          .build();
    }
  }

  /** 获取当前用户信息 */
  @GET
  @Path("/me")
  public Response me(@Context SecurityContext securityContext) {
    Long userId = SecurityUtils.getUserIdFromSecurityContext(securityContext);
    var user = authenticationService.getUserWithRolesAndPermissions(userId);
    if (user == null) {
      return Response.status(Response.Status.NOT_FOUND)
          .entity(new ErrorResponse(ErrorCode.NOT_FOUND, "User not found"))
          .build();
    }

    Set<String> roles =
        user.roles == null
            ? Set.of()
            : user.roles.stream().map(role -> role.code).collect(Collectors.toSet());
    Set<String> permissions =
        user.roles == null
            ? Set.of()
            : user.roles.stream()
                .flatMap(
                    role ->
                        role.permissions == null
                            ? java.util.stream.Stream.empty()
                            : role.permissions.stream())
                .map(permission -> permission.code)
                .collect(Collectors.toSet());

    return Response.ok(
            new CurrentUserResponse(
                user.id, user.username, user.email, roles, permissions, user.tenant))
        .build();
  }

  // 请求/响应 DTO 类
  public static class LoginRequest {
    @NotBlank(message = "Username is required")
    public String username;

    @NotBlank(message = "Password is required")
    public String password;
  }

  public static class LoginResponse {
    public final Long userId;
    public final String username;
    public final String accessToken;
    public final String refreshToken;
    public final Long tenantId;

    public LoginResponse(
        Long userId, String username, String accessToken, String refreshToken, Long tenantId) {
      this.userId = userId;
      this.username = username;
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.tenantId = tenantId;
    }
  }

  public static class RefreshTokenRequest {
    @NotBlank(message = "Refresh token is required")
    public String refreshToken;
  }

  public static class AccessTokenResponse {
    public final String accessToken;

    public AccessTokenResponse(String accessToken) {
      this.accessToken = accessToken;
    }
  }

  public static class CurrentUserResponse {
    public final Long id;
    public final String username;
    public final String email;
    public final Set<String> roles;
    public final Set<String> permissions;
    public final Long tenantId;

    public CurrentUserResponse(
        Long id,
        String username,
        String email,
        Set<String> roles,
        Set<String> permissions,
        Long tenantId) {
      this.id = id;
      this.username = username;
      this.email = email;
      this.roles = roles;
      this.permissions = permissions;
      this.tenantId = tenantId;
    }
  }

  public static class RegisterRequest {
    @NotBlank(message = "Username is required")
    public String username;

    @NotBlank(message = "Email is required")
    public String email;

    @NotBlank(message = "Password is required")
    public String password;

    public String roleCode = "USER"; // 默认角色
  }

  public static class RegisterResponse {
    public final Long id;
    public final String username;
    public final String email;

    public RegisterResponse(Long id, String username, String email) {
      this.id = id;
      this.username = username;
      this.email = email;
    }
  }

  public static class ChangePasswordRequest {
    public Long userId;

    @NotBlank(message = "Old password is required")
    public String oldPassword;

    @NotBlank(message = "New password is required")
    public String newPassword;
  }

  public record SuccessResponse(String message) {}
}
