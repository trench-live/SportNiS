package com.sportnis.api.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProviderDetailsUpdateRequest(
        @Min(value = 0, message = "experienceYears must be >= 0")
        @Max(value = 100, message = "experienceYears must be <= 100")
        @Schema(description = "Опыт работы в годах.", example = "8")
        Integer experienceYears,
        @Size(max = 5000, message = "qualifications max length is 5000")
        @Schema(description = "Квалификация, образование, сертификаты.", example = "Сертифицированный тренер FPA")
        String qualifications,
        @Size(max = 120, message = "trainingFormat max length is 120")
        @Schema(description = "Формат занятий.", example = "offline/online")
        String trainingFormat,
        @Schema(description = "Стоимость от.", example = "2500")
        BigDecimal priceFrom,
        @Size(min = 3, max = 3, message = "priceCurrency must be 3 letters")
        @Schema(description = "Валюта цены (ISO 4217).", example = "RUB")
        String priceCurrency,
        @Size(max = 5000, message = "serviceConditions max length is 5000")
        @Schema(description = "Условия оказания услуги.", example = "Первая консультация бесплатно")
        String serviceConditions
) {
}
