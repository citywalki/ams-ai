package pro.walkin.ams.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DictCategoryDto(
    @NotBlank(message = "分类编码不能为空")
    @Size(max = 64, message = "分类编码长度不能超过64个字符")
    String code,

    @NotBlank(message = "分类名称不能为空")
    @Size(max = 128, message = "分类名称长度不能超过128个字符")
    String name,

    @Size(max = 512, message = "描述长度不能超过512个字符")
    String description,

    Integer sort,
    Integer status
) {
    public DictCategoryDto {
        if (sort == null) sort = 0;
        if (status == null) status = 1;
    }
}
