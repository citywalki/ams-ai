package pro.walkin.ams.graphql.adapter;

import io.smallrye.graphql.api.Adapter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** 将 Map&lt;String, Object&gt; 适配为 List&lt;KeyValue&gt; 的 GraphQL 适配器 */
public class MapAdapter implements Adapter<Map<String, Object>, List<KeyValue>> {

  @Override
  public List<KeyValue> to(Map<String, Object> map) throws Exception {
    if (map == null) {
      return null;
    }
    return map.entrySet().stream()
        .map(e -> new KeyValue(e.getKey(), e.getValue() != null ? e.getValue().toString() : null))
        .toList();
  }

  @Override
  public Map<String, Object> from(List<KeyValue> list) throws Exception {
    if (list == null) {
      return null;
    }
    Map<String, Object> map = new HashMap<>();
    for (KeyValue kv : list) {
      map.put(kv.key, kv.value);
    }
    return map;
  }
}
