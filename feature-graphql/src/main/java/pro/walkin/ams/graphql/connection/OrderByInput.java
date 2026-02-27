package pro.walkin.ams.graphql.connection;

import org.eclipse.microprofile.graphql.Input;

@Input
public class OrderByInput {
  public String field;
  public String direction = "ASC";
}
