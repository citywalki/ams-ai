package pro.walkin.ams.graphql.filter.input;

import org.eclipse.microprofile.graphql.Input;

@Input("DateTimeFilter")
public class DateTimeFilterInput {
  public String _eq;
  public String _neq;
  public String _gt;
  public String _gte;
  public String _lt;
  public String _lte;
  public Boolean _isNull;
}
