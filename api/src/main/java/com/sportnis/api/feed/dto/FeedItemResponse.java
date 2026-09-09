package com.sportnis.api.feed.dto;

import com.sportnis.entity.enums.ListingFormat;
import com.sportnis.entity.enums.ProfileType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record FeedItemResponse(
        FeedItemType itemType,
        UUID itemId,
        UUID profileId,
        ProfileType profileType,
        String title,
        String subtitle,
        String ownerDisplayName,
        String avatarUrl,
        String city,
        Set<String> tags,
        ListingFormat format,
        BigDecimal priceFrom,
        BigDecimal priceTo,
        String currency,
        Instant createdAt
) {
}
