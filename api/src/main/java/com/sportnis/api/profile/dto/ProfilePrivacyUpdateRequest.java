package com.sportnis.api.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;

public record ProfilePrivacyUpdateRequest(
        @Schema(description = "Публичность профиля.", example = "true")
        Boolean isPublic,
        @Schema(description = "Публичность email.", example = "false")
        Boolean isEmailPublic,
        @Schema(description = "Публичность телефона.", example = "false")
        Boolean isPhonePublic
) {
    @AssertTrue(message = "At least one privacy field must be provided")
    public boolean hasAtLeastOneField() {
        return isPublic != null || isEmailPublic != null || isPhonePublic != null;
    }
}
