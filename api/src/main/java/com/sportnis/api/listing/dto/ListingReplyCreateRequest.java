package com.sportnis.api.listing.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

public record ListingReplyCreateRequest(
        @Size(max = 2000, message = "message max length is 2000")
        @Schema(description = "Сообщение к отклику. Необязательно в MVP.", example = "Здравствуйте, готов обсудить детали и расписание.")
        String message
) {
}
