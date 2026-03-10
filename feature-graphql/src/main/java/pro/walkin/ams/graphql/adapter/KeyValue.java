package pro.walkin.ams.graphql.adapter;

import org.eclipse.microprofile.graphql.Description;

/** GraphQL 键值对类型，用于 Map&lt;String, Object&gt; 的 GraphQL 表示 */
@Description("键值对")
public class KeyValue {

  public String key;

  public String value;

  public KeyValue() {}

  public KeyValue(String key, String value) {
    this.key = key;
    this.value = value;
  }
}
