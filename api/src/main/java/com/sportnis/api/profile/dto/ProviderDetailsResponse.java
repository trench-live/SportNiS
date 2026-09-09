package com.sportnis.api.profile.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProviderDetailsResponse(
        UUID profileId,
        Integer experienceYears,
        String qualifications,
        String trainingFormat,
        BigDecimal priceFrom,
        String priceCurrency,
        String serviceConditions
) {
}

