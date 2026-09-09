package com.sportnis.api.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record ConsumerDetailsUpdateRequest(
        @Min(value = 1900, message = "birthYear must be >= 1900")
        @Max(value = 2100, message = "birthYear must be <= 2100")
        @Schema(description = "Год рождения.", example = "2007")
        Integer birthYear,
        @Size(max = 120, message = "experienceLevel max length is 120")
        @Schema(description = "Уровень опыта.", example = "beginner")
        String experienceLevel,
        @Size(max = 5000, message = "goals max length is 5000")
        @Schema(description = "Цели пользователя.", example = "Подготовка к первому полумарафону")
        String goals,
        @Size(max = 5000, message = "preferences max length is 5000")
        @Schema(description = "Предпочтения по тренировкам/условиям.", example = "Вечерние тренировки в будни")
        String preferences
) {
}
