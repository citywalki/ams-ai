package pro.walkin.ams.common.event;

public record CacheInvalidationEvent(String cacheMessage, String cacheKey) {}
