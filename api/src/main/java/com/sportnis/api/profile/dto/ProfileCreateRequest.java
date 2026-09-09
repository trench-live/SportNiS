package com.sportnis.api.profile.dto;

import com.sportnis.entity.enums.ProfileType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProfileCreateRequest(
        @NotNull(message = "Profile type is required")
        @Schema(description = "Тип создаваемого профиля.", example = "PROVIDER")
        ProfileType profileType,
        @NotBlank(message = "Display name is required")
        @Schema(description = "Отображаемое имя нового профиля.", example = "Coach Alex")
        String displayName
) {
}
