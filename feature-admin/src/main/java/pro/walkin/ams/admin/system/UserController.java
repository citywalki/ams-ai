package pro.walkin.ams.admin.system;

import io.quarkus.hibernate.panache.blocking.PanacheBlockingQuery;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import java.util.List;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.persistence.entity.system.User;
import pro.walkin.ams.persistence.entity.system.User_;
import pro.walkin.ams.security.TenantContext;

@Path("/api/system/users")
public class UserController {

  @GET
  public Response findAll(
      @QueryParam("page") @DefaultValue("0") int page,
      @QueryParam("size") @DefaultValue("20") int size) {

    Long tenantId = TenantContext.getCurrentTenantId();
    if (tenantId == null) {
        return ResponseBuilder.page(List.of(), 0, 0, page, size);
    }

    PanacheBlockingQuery<User> query = User_.managedBlocking().find("tenant", tenantId);
    // 获取数据和总数
    long totalCount = query.count();
    long totalPages = query.pageCount();

    List<User> users = query.list();

    // 构建分页响应（含常用分页元数据）
    return ResponseBuilder.page(users, totalCount, totalPages, page, size);
  }

  @Path("/{id}")
  @GET
  public Response findOne(@PathParam("id") Long id) {

    return ResponseBuilder.of(User_.managedBlocking().findByIdOptional(id));
  }
}
