package pro.walkin.ams.graphql.entity.user;

import org.eclipse.microprofile.graphql.Input;
import pro.walkin.ams.graphql.entity.role.RoleFilterInput;
import pro.walkin.ams.graphql.filter.input.DateTimeFilterInput;
import pro.walkin.ams.graphql.filter.input.EnumFilterInput;
import pro.walkin.ams.graphql.filter.input.LongFilterInput;
import pro.walkin.ams.graphql.filter.input.StringFilterInput;

import java.util.List;

@Input("UserFilter")
public class UserFilterInput {
  public List<UserFilterInput> _and;
  public List<UserFilterInput> _or;

  public LongFilterInput id;
  public StringFilterInput username;
  public StringFilterInput email;
  public EnumFilterInput status;
  public DateTimeFilterInput createdAt;
  public DateTimeFilterInput updatedAt;

  public RoleFilterInput roles;
}
