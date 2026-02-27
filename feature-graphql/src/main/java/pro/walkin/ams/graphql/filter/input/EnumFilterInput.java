package pro.walkin.ams.graphql.filter.input;

import org.eclipse.microprofile.graphql.Input;

import java.util.List;

@Input("EnumFilter")
public class EnumFilterInput {
  public String _eq;
  public String _neq;
  public List<String> _in;
  public List<String> _nin;
  public Boolean _isNull;
}
