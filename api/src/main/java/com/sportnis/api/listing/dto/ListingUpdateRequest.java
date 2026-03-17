package com.sportnis.api.listing.dto;

import com.sportnis.entity.enums.ListingFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;

public record ListingUpdateRequest(
        @NotBlank(message = "title is required")
        @Size(max = 255, message = "title max length is 255")
        @Schema(description = "Заголовок листинга.", example = "Набор в детскую футбольную группу")
        String title,
        @NotBlank(message = "description is required")
        @Size(max = 5000, message = "description max length is 5000")
        @Schema(description = "Описание листинга.", example = "Ищем футболистов 2013-2015 года рождения на регулярные тренировки.")
        String description,
        @Size(max = 500, message = "contactInfo max length is 500")
        @Schema(description = "Контактная информация владельца листинга.", example = "Telegram: @coach_ivan, +7 900 000-00-00")
        String contactInfo,
        @Schema(description = "Теги листинга.", example = "[\"running\",\"beginner\"]")
        Set<@Size(max = 80, message = "tag max length is 80") String> tags,
        @Size(max = 120, message = "city max length is 120")
        @Schema(description = "Город.", example = "Moscow")
        String city,
        @NotNull(message = "format is required")
        @Schema(description = "Формат занятий.", example = "OFFLINE")
        ListingFormat format,
        @DecimalMin(value = "0.0", inclusive = true, message = "priceFrom must be >= 0")
        @Schema(description = "Цена от.", example = "2500")
        BigDecimal priceFrom,
        @DecimalMin(value = "0.0", inclusive = true, message = "priceTo must be >= 0")
        @Schema(description = "Цена до (необязательно).", example = "5000")
        BigDecimal priceTo,
        @Schema(description = "Дата автозакрытия (необязательно).", example = "2026-12-31T23:59:59Z")
        Instant expiresAt,
        @NotNull(message = "manualCloseOnly is required")
        @Schema(description = "Закрывается только вручную владельцем.", example = "false")
        Boolean manualCloseOnly
) {
    @AssertTrue(message = "priceTo must be >= priceFrom")
    public boolean isPriceRangeValid() {
        return priceFrom == null || priceTo == null || priceTo.compareTo(priceFrom) >= 0;
    }

    @AssertTrue(message = "expiresAt must be null when manualCloseOnly=true")
    public boolean isManualCloseAndExpiresAtValid() {
        return manualCloseOnly == null || !manualCloseOnly || expiresAt == null;
    }
}
