package pro.walkin.ams.graphql.entity.menu;

import org.eclipse.microprofile.graphql.Input;
import pro.walkin.ams.graphql.filter.input.BooleanFilterInput;
import pro.walkin.ams.graphql.filter.input.EnumFilterInput;
import pro.walkin.ams.graphql.filter.input.LongFilterInput;
import pro.walkin.ams.graphql.filter.input.StringFilterInput;

import java.util.List;

@Input("MenuFilter")
public class MenuFilterInput {
  public List<MenuFilterInput> _and;
  public List<MenuFilterInput> _or;

  public LongFilterInput id;
  public StringFilterInput key;
  public StringFilterInput label;
  public StringFilterInput route;
  public LongFilterInput parentId;
  public EnumFilterInput menuType;
  public BooleanFilterInput isVisible;
}
