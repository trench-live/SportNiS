package com.sportnis.api.profile.dto;

import com.sportnis.entity.enums.ProfileType;

public record ProfileDetailsResponse(
        ProfileType profileType,
        ConsumerDetailsResponse consumerDetails,
        ProviderDetailsResponse providerDetails
) {
}

