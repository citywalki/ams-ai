package pro.walkin.ams.graphql.entity.dict;

import org.eclipse.microprofile.graphql.Input;
import pro.walkin.ams.graphql.filter.input.IntFilterInput;
import pro.walkin.ams.graphql.filter.input.LongFilterInput;
import pro.walkin.ams.graphql.filter.input.StringFilterInput;

import java.util.List;

@Input("DictCategoryFilter")
public class DictCategoryFilterInput {
  public List<DictCategoryFilterInput> _and;
  public List<DictCategoryFilterInput> _or;

  public LongFilterInput id;
  public StringFilterInput code;
  public StringFilterInput name;
  public StringFilterInput description;
  public IntFilterInput sort;
  public IntFilterInput status;
}
