package com.sportnis.api.profile.dto;

import com.sportnis.entity.enums.ProfileType;
import java.util.UUID;

public record MyProfileItemResponse(
        UUID id,
        ProfileType profileType,
        String displayName,
        boolean isLookingFor,
        boolean active
) {
}

