package pro.walkin.ams.graphql.connection;

import org.eclipse.microprofile.graphql.Type;
import pro.walkin.ams.persistence.entity.system.Permission;

import java.util.List;

@Type("PermissionConnection")
public class PermissionConnection {
  private List<Permission> content;
  private long totalElements;
  private int totalPages;
  private int page;
  private int size;

  public PermissionConnection() {}

  public PermissionConnection(List<Permission> content, long totalElements, int page, int size) {
    this.content = content;
    this.totalElements = totalElements;
    this.page = page;
    this.size = size;
    this.totalPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 0;
  }

  public List<Permission> getContent() {
    return content;
  }

  public void setContent(List<Permission> content) {
    this.content = content;
  }

  public long getTotalElements() {
    return totalElements;
  }

  public void setTotalElements(long totalElements) {
    this.totalElements = totalElements;
  }

  public int getTotalPages() {
    return totalPages;
  }

  public void setTotalPages(int totalPages) {
    this.totalPages = totalPages;
  }

  public int getPage() {
    return page;
  }

  public void setPage(int page) {
    this.page = page;
  }

  public int getSize() {
    return size;
  }

  public void setSize(int size) {
    this.size = size;
  }
}
