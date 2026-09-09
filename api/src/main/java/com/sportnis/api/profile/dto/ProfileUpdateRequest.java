package com.sportnis.api.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;

public record ProfileUpdateRequest(
        @NotBlank(message = "Display name is required")
        @Schema(description = "Отображаемое имя профиля.", example = "Alex Runner")
        String displayName,
        @Schema(description = "URL аватара.", example = "https://cdn.example.com/avatar.png")
        String avatarUrl,
        @Schema(description = "Город.", example = "Moscow")
        String city,
        @Schema(description = "Описание профиля.", example = "Люблю бег и функциональные тренировки")
        String about,
        @Schema(description = "Теги видов спорта.", example = "[\"running\",\"fitness\"]")
        Set<String> sportsTags
) {
}
