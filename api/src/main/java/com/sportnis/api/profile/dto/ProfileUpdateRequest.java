package com.sportnis.api.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

public record ProfileUpdateRequest(
        @NotBlank(message = "Display name is required")
        String displayName,
        String avatarUrl,
        String city,
        String about,
        Set<String> sportsTags,
        @NotNull(message = "isPublic is required")
        Boolean isPublic,
        @NotNull(message = "isEmailPublic is required")
        Boolean isEmailPublic,
        @NotNull(message = "isPhonePublic is required")
        Boolean isPhonePublic
) {
}

