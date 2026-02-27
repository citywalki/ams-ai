package pro.walkin.ams.graphql.filter.input;

import org.eclipse.microprofile.graphql.Input;

import java.util.List;

@Input("StringFilter")
public class StringFilterInput {
  public String _eq;
  public String _neq;
  public String _like;
  public String _ilike;
  public String _startsWith;
  public String _endsWith;
  public List<String> _in;
  public List<String> _nin;
  public Boolean _isNull;
}
