package pro.walkin.ams.common.dto;

import java.time.LocalDateTime;

public record DictCategoryResponse(
    Long id,
    String code,
    String name,
    String description,
    Integer sort,
    Integer status,
    Long tenant,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Long itemCount) {}
