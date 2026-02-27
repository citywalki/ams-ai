package pro.walkin.ams.graphql.entity.alarm;

import org.eclipse.microprofile.graphql.Input;
import pro.walkin.ams.graphql.filter.input.DateTimeFilterInput;
import pro.walkin.ams.graphql.filter.input.EnumFilterInput;
import pro.walkin.ams.graphql.filter.input.LongFilterInput;
import pro.walkin.ams.graphql.filter.input.StringFilterInput;

import java.util.List;

@Input("AlarmFilter")
public class AlarmFilterInput {
  public List<AlarmFilterInput> _and;
  public List<AlarmFilterInput> _or;

  public LongFilterInput id;
  public StringFilterInput title;
  public StringFilterInput description;
  public StringFilterInput source;
  public StringFilterInput sourceId;
  public StringFilterInput fingerprint;
  public EnumFilterInput severity;
  public EnumFilterInput status;
  public DateTimeFilterInput createdAt;
  public DateTimeFilterInput updatedAt;
  public DateTimeFilterInput occurredAt;
}
