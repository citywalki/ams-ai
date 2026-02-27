package pro.walkin.ams.graphql.entity.role;

import org.eclipse.microprofile.graphql.Input;
import pro.walkin.ams.graphql.entity.permission.PermissionFilterInput;
import pro.walkin.ams.graphql.filter.input.DateTimeFilterInput;
import pro.walkin.ams.graphql.filter.input.LongFilterInput;
import pro.walkin.ams.graphql.filter.input.StringFilterInput;

import java.util.List;

@Input("RoleFilter")
public class RoleFilterInput {
  public List<RoleFilterInput> _and;
  public List<RoleFilterInput> _or;

  public LongFilterInput id;
  public StringFilterInput code;
  public StringFilterInput name;
  public StringFilterInput description;
  public DateTimeFilterInput createdAt;
  public DateTimeFilterInput updatedAt;

  public PermissionFilterInput permissions;
}
