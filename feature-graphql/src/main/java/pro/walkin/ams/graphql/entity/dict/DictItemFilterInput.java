package pro.walkin.ams.graphql.entity.dict;

import org.eclipse.microprofile.graphql.Input;
import pro.walkin.ams.graphql.filter.input.IntFilterInput;
import pro.walkin.ams.graphql.filter.input.LongFilterInput;
import pro.walkin.ams.graphql.filter.input.StringFilterInput;

import java.util.List;

@Input("DictItemFilter")
public class DictItemFilterInput {
  public List<DictItemFilterInput> _and;
  public List<DictItemFilterInput> _or;

  public LongFilterInput id;
  public LongFilterInput categoryId;
  public LongFilterInput parentId;
  public StringFilterInput code;
  public StringFilterInput name;
  public StringFilterInput value;
  public IntFilterInput sort;
  public IntFilterInput status;
}
