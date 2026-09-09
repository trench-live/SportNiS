package com.sportnis.api.listing.dto;

import com.sportnis.entity.enums.ListingReplyStatus;
import java.time.Instant;
import java.util.UUID;

public record ListingReplyResponse(
        UUID id,
        UUID listingId,
        UUID responderProfileId,
        String message,
        ListingReplyStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
