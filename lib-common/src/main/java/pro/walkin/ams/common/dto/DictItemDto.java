package pro.walkin.ams.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DictItemDto(
    @NotNull(message = "分类ID不能为空")
    Long categoryId,

    Long parentId,

    @NotBlank(message = "项编码不能为空")
    @Size(max = 64, message = "项编码长度不能超过64个字符")
    String code,

    @NotBlank(message = "项名称不能为空")
    @Size(max = 128, message = "项名称长度不能超过128个字符")
    String name,

    @Size(max = 512, message = "项值长度不能超过512个字符")
    String value,

    Integer sort,
    Integer status,

    @Size(max = 256, message = "备注长度不能超过256个字符")
    String remark
) {
    public DictItemDto {
        if (sort == null) sort = 0;
        if (status == null) status = 1;
    }
}
