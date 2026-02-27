package pro.walkin.ams.admin.common;

import jakarta.ws.rs.core.Response;

import java.util.List;

public class ResponseBuilder {

  public static Response page(
      List<?> results, long totalCount, long totalPages, int page, int size) {

    return Response.ok(results)
        .header("X-Total-Count", totalCount)
        .header("X-Total-Pages", totalPages)
        .header("X-Current-Page", page)
        .header("X-Page-Size", size)
        .build();
  }

  public static Response of(Object value) {
    return Response.ok(value).build();
  }
}
