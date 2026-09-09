package com.sportnis.api.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record SwitchProfileRequest(
        @NotNull(message = "profileId is required")
        @Schema(
                description = "ID профиля, на который нужно переключиться. Профиль должен принадлежать текущему пользователю.",
                example = "f1458db3-4f7a-4f4d-b6b1-5d6d14d4b70e"
        )
        UUID profileId
) {
}

