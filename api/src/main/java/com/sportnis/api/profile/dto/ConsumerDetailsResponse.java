package com.sportnis.api.profile.dto;

import java.util.UUID;

public record ConsumerDetailsResponse(
        UUID profileId,
        Integer birthYear,
        String experienceLevel,
        String goals,
        String preferences
) {
}

