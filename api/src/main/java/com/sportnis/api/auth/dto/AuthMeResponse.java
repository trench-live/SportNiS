package com.sportnis.api.auth.dto;

import com.sportnis.entity.enums.AccountStatus;
import com.sportnis.entity.enums.MarketSide;
import com.sportnis.entity.enums.ProfileType;
import com.sportnis.entity.enums.SystemRole;
import java.util.UUID;

public record AuthMeResponse(
        UUID userId,
        String email,
        String phone,
        AccountStatus status,
        SystemRole systemRole,
        UUID profileId,
        ProfileType profileType,
        MarketSide marketSide
) {
}

