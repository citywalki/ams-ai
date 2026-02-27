package pro.walkin.ams.graphql.entity.permission;

import org.eclipse.microprofile.graphql.Input;
import pro.walkin.ams.graphql.filter.input.LongFilterInput;
import pro.walkin.ams.graphql.filter.input.StringFilterInput;

import java.util.List;

@Input("PermissionFilter")
public class PermissionFilterInput {
  public List<PermissionFilterInput> _and;
  public List<PermissionFilterInput> _or;

  public LongFilterInput id;
  public StringFilterInput code;
  public StringFilterInput name;
  public StringFilterInput description;
}
