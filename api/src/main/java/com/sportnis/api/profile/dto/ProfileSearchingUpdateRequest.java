package com.sportnis.api.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record ProfileSearchingUpdateRequest(
        @NotNull(message = "isLookingFor is required")
        @Schema(description = "Флаг участия consumer-профиля в публичном поиске.", example = "true")
        Boolean isLookingFor
) {
}
