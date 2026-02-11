package pro.walkin.ams.common.dto.ingestion;

import pro.walkin.ams.common.dto.AlertEvent;

import java.io.Serializable;
import java.time.LocalDateTime;

public record DeduplicationState(
        AlertEvent originalEvent,
        int count,
        LocalDateTime firstSeenAt,
        LocalDateTime lastSeenAt
) implements Serializable {
}
