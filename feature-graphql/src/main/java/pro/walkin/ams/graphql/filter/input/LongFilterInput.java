package pro.walkin.ams.graphql.filter.input;

import org.eclipse.microprofile.graphql.Input;

import java.util.List;

@Input("LongFilter")
public class LongFilterInput {
  public String _eq;
  public String _neq;
  public String _gt;
  public String _gte;
  public String _lt;
  public String _lte;
  public List<String> _in;
  public List<String> _nin;
  public Boolean _isNull;
}
