package pro.walkin.ams.graphql.connection;

import org.eclipse.microprofile.graphql.Type;
import pro.walkin.ams.persistence.entity.system.Role;

import java.util.List;

@Type("RoleConnection")
public class RoleConnection {
  private List<Role> content;
  private long totalElements;
  private int totalPages;
  private int page;
  private int size;

  public RoleConnection() {}

  public RoleConnection(List<Role> content, long totalElements, int page, int size) {
    this.content = content;
    this.totalElements = totalElements;
    this.page = page;
    this.size = size;
    this.totalPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 0;
  }

  public List<Role> getContent() {
    return content;
  }

  public void setContent(List<Role> content) {
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
