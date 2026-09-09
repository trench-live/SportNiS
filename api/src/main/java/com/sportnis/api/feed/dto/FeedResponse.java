package com.sportnis.api.feed.dto;

import java.util.List;

public record FeedResponse(
        List<FeedItemResponse> items,
        long total,
        int page,
        int size,
        boolean hasNext
) {
}
