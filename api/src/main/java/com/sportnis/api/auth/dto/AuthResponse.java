package com.sportnis.api.auth.dto;

import com.sportnis.entity.enums.MarketSide;
import com.sportnis.entity.enums.ProfileType;
import java.util.UUID;

public record AuthResponse(
        String token,
        UUID userId,
        UUID profileId,
        ProfileType profileType,
        MarketSide marketSide
) {
}

