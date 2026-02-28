package pro.walkin.ams.graphql.connection;

import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

@Input("OrderByInput")
public class OrderByInput {
  @Name("field")
  public String field;

  @Name("direction")
  public String direction = "ASC";
}
