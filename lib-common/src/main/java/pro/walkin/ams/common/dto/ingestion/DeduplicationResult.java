package pro.walkin.ams.common.dto.ingestion;

import pro.walkin.ams.common.dto.AlertEvent;

import java.time.LocalDateTime;

public record DeduplicationResult(
        boolean isNewAlert,
        AlertEvent originalEvent,
        int currentCount,
        LocalDateTime firstSeenAt
) {
    public static DeduplicationResult newAlert(AlertEvent event) {
        return new DeduplicationResult(true, event, 1, event.firstSeenAt());
    }

    public static DeduplicationResult duplicate(AlertEvent original, int currentCount, LocalDateTime firstSeenAt) {
        return new DeduplicationResult(false, original, currentCount, firstSeenAt);
    }
}
