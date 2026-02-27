package pro.walkin.ams.graphql.filter.input;

import org.eclipse.microprofile.graphql.Input;

import java.util.List;

@Input("IntFilter")
public class IntFilterInput {
  public Integer _eq;
  public Integer _neq;
  public Integer _gt;
  public Integer _gte;
  public Integer _lt;
  public Integer _lte;
  public List<Integer> _in;
  public List<Integer> _nin;
  public Boolean _isNull;
}
