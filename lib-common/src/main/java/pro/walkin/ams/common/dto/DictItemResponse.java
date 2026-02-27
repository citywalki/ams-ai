package pro.walkin.ams.common.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public record DictItemResponse(
    Long id,
    Long categoryId,
    Long parentId,
    String code,
    String name,
    String value,
    Integer sort,
    Integer status,
    String remark,
    Long tenant,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<DictItemResponse> children) {
  public DictItemResponse {
    if (children == null) children = new ArrayList<>();
  }
}
