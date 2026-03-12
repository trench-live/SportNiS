package com.sportnis.api.listing.dto;

import com.sportnis.entity.enums.ListingFormat;
import com.sportnis.entity.enums.ListingStatus;
import com.sportnis.entity.enums.ListingType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record ListingResponse(
        UUID id,
        UUID ownerProfileId,
        ListingType type,
        ListingStatus status,
        String title,
        String description,
        Set<String> tags,
        String city,
        ListingFormat format,
        BigDecimal priceFrom,
        BigDecimal priceTo,
        String currency,
        Instant expiresAt,
        boolean manualCloseOnly,
        Instant createdAt,
        Instant updatedAt
) {
}

