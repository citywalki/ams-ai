package pro.walkin.ams.common.dto;

import java.util.Collections;
import java.util.List;

/**
 * 分页响应
 *
 * @param <T> 数据类型
 */
public class PageResponse<T> {

  /*
   * 总记录数
   */
  private final long total;

  /*
   * 总页数
   */
  private final int pages;

  /*
   * 当前页码
   */
  private final int page;

  /*
   * 每页记录数
   */
  private final int size;

  /*
   * 当前页数据列表
   */
  private final List<T> content;

  public PageResponse(long total, int pages, int page, int size, List<T> content) {
    this.total = total;
    this.pages = pages;
    this.page = page;
    this.size = size;
    this.content = content != null ? content : Collections.emptyList();
  }

  public long getTotal() {
    return total;
  }

  public int getPages() {
    return pages;
  }

  public int getPage() {
    return page;
  }

  public int getSize() {
    return size;
  }

  public List<T> getContent() {
    return content;
  }

  public boolean hasNext() {
    return page < pages;
  }

  public boolean hasPrevious() {
    return page > 1;
  }

  public boolean isEmpty() {
    return content.isEmpty();
  }

  public boolean isNotEmpty() {
    return !content.isEmpty();
  }

  public static <T> PageResponse<T> of(long total, int page, int size, List<T> content) {
    int pages = total == 0 ? 0 : (int) ((total - 1) / size) + 1;
    return new PageResponse<>(total, pages, page, size, content);
  }

  public static <T> PageResponse<T> empty(PageRequest pageRequest) {
    return new PageResponse<>(
        0, 0, pageRequest.page(), pageRequest.size(), Collections.emptyList());
  }
}
