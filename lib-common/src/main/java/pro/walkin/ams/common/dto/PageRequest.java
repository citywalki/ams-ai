package pro.walkin.ams.common.dto;

import pro.walkin.ams.common.Constants;

/**
 * 分页请求
 *
 * @param page 当前页码，从1开始
 * @param size 每页记录数
 * @param sort 排序条件，格式：字段,方向(ASC/DESC)
 */
public record PageRequest(int page, int size, String sort) {

  public PageRequest {
    validate(page, size);
  }

  public PageRequest(int page, int size) {
    this(page, size, null);
  }

  public PageRequest() {
    this(Constants.Pagination.DEFAULT_PAGE_NUMBER, Constants.Pagination.DEFAULT_PAGE_SIZE, null);
  }

  private void validate(int page, int size) {
    if (page <= 0) {
      throw new IllegalArgumentException("Page must be greater than 0");
    }
    if (size <= 0) {
      throw new IllegalArgumentException("Size must be greater than 0");
    }
    if (size > Constants.Pagination.MAX_PAGE_SIZE) {
      throw new IllegalArgumentException(
          "Size must be less than or equal to " + Constants.Pagination.MAX_PAGE_SIZE);
    }
  }

  public int getOffset() {
    return (page - 1) * size;
  }

  public static PageRequest of(int page, int size) {
    return new PageRequest(page, size);
  }

  public static PageRequest of(int page, int size, String sort) {
    return new PageRequest(page, size, sort);
  }
}
