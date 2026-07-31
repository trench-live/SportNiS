package com.sportnis.api.profile.dto;

import com.sportnis.entity.enums.ProfileCompletionStatus;
import java.util.List;
import com.sportnis.entity.enums.ProfileType;
import java.util.Set;
import java.util.UUID;

public record ProfileResponse(
        UUID id,
        UUID userId,
        ProfileType profileType,
        String displayName,
        String avatarUrl,
        String city,
        String about,
        Set<String> sportsTags,
        Boolean isLookingFor,
        ProfileCompletionStatus completionStatus,
        List<String> missingFields
) {
}
