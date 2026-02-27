package pro.walkin.ams.graphql.filter.input;

import org.eclipse.microprofile.graphql.Input;

@Input("BooleanFilter")
public class BooleanFilterInput {
  public Boolean _eq;
  public Boolean _neq;
  public Boolean _isNull;
}
