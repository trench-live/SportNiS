package com.sportnis.service;

import com.sportnis.api.profile.dto.ProfileResponse;
import com.sportnis.api.profile.dto.ProfileUpdateRequest;
import com.sportnis.entity.profile.Profile;
import com.sportnis.repository.profile.ProfileRepository;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile(UUID userId) {
        Profile profile = findByUserId(userId);
        return mapProfile(profile);
    }

    @Transactional
    public ProfileResponse updateMyProfile(UUID userId, ProfileUpdateRequest request) {
        Profile profile = findByUserId(userId);

        profile.setDisplayName(request.displayName().trim());
        profile.setAvatarUrl(blankToNull(request.avatarUrl()));
        profile.setCity(blankToNull(request.city()));
        profile.setAbout(blankToNull(request.about()));
        profile.setPublic(request.isPublic());
        profile.setEmailPublic(request.isEmailPublic());
        profile.setPhonePublic(request.isPhonePublic());

        Set<String> tags = request.sportsTags() == null ? Set.of() : request.sportsTags();
        profile.setSportsTags(new HashSet<>(tags));

        Profile saved = profileRepository.save(profile);
        return mapProfile(saved);
    }

    private Profile findByUserId(UUID userId) {
        return profileRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
    }

    private ProfileResponse mapProfile(Profile profile) {
        return new ProfileResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getMarketSide(),
                profile.getProfileType(),
                profile.getDisplayName(),
                profile.getAvatarUrl(),
                profile.getCity(),
                profile.getAbout(),
                Set.copyOf(profile.getSportsTags()),
                profile.isPublic(),
                profile.isEmailPublic(),
                profile.isPhonePublic()
        );
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}

