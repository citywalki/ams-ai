package pro.walkin.ams.admin.system;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import java.util.List;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.persistence.entity.system.User;
import pro.walkin.ams.security.TenantContext;

@Path("/api/system/users")
public class UserController {

  @Inject User.Repo userRepo;

  @GET
  public Response findAll(
      @QueryParam("page") @DefaultValue("0") int page,
      @QueryParam("size") @DefaultValue("20") int size) {

    Long tenantId = TenantContext.getCurrentTenantId();
    if (tenantId == null) {
        return ResponseBuilder.page(List.of(), 0, 0, page, size);
    }

    // 获取分页数据
    List<User> users = userRepo.listByTenant(tenantId, page, size);
    // 获取总数
    long totalCount = userRepo.count("tenant", tenantId);
    long totalPages = (long) Math.ceil((double) totalCount / size);

    // 构建分页响应（含常用分页元数据）
    return ResponseBuilder.page(users, totalCount, totalPages, page, size);
  }

  @Path("/{id}")
  @GET
  public Response findOne(@PathParam("id") Long id) {

    return ResponseBuilder.of(userRepo.findByIdOptional(id));
  }
}
