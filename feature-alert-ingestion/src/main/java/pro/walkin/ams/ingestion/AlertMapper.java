package pro.walkin.ams.ingestion;

import pro.walkin.ams.common.dto.AlertEvent;

import java.util.List;

public interface AlertMapper {
    String source();
    List<AlertEvent> map(String rawJson);
}