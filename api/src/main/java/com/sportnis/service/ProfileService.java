package com.sportnis.service;

import com.sportnis.api.profile.dto.ConsumerDetailsResponse;
import com.sportnis.api.profile.dto.ConsumerDetailsUpdateRequest;
import com.sportnis.api.profile.dto.MyProfileItemResponse;
import com.sportnis.api.profile.dto.ProfileCreateRequest;
import com.sportnis.api.profile.dto.ProfileDetailsResponse;
import com.sportnis.api.profile.dto.ProfilePrivacyUpdateRequest;
import com.sportnis.api.profile.dto.ProfileResponse;
import com.sportnis.api.profile.dto.ProfileSearchingUpdateRequest;
import com.sportnis.api.profile.dto.ProfileUpdateRequest;
import com.sportnis.api.profile.dto.ProviderDetailsResponse;
import com.sportnis.api.profile.dto.ProviderDetailsUpdateRequest;
import com.sportnis.entity.enums.OnboardingStep;
import com.sportnis.entity.enums.ProfileType;
import com.sportnis.entity.profile.Profile;
import com.sportnis.entity.profile.details.ConsumerDetails;
import com.sportnis.entity.profile.details.ProviderDetails;
import com.sportnis.entity.user.User;
import com.sportnis.repository.profile.ProfileRepository;
import com.sportnis.repository.profile.details.ConsumerDetailsRepository;
import com.sportnis.repository.profile.details.ProviderDetailsRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import com.sportnis.repository.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileService {

    private static final int MAX_PROFILES_PER_USER = 50;

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ConsumerDetailsRepository consumerDetailsRepository;
    private final ProviderDetailsRepository providerDetailsRepository;

    public ProfileService(
            ProfileRepository profileRepository,
            UserRepository userRepository,
            ConsumerDetailsRepository consumerDetailsRepository,
            ProviderDetailsRepository providerDetailsRepository
    ) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.consumerDetailsRepository = consumerDetailsRepository;
        this.providerDetailsRepository = providerDetailsRepository;
    }

    @Transactional
    public ProfileResponse getMyProfile(UUID userId) {
        Profile profile = findActiveProfile(userId);
        return mapProfile(profile);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getPublicProfile(UUID profileId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        if (!profile.isPublic()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
        }
        return mapProfile(profile);
    }

    @Transactional(readOnly = true)
    public List<ProfileResponse> listPublicProfiles() {
        return profileRepository.findAllByIsPublicTrueOrderByCreatedAtDesc().stream()
                .map(this::mapProfile)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProfileResponse> listPublicSearchingProfiles() {
        return consumerDetailsRepository.findAllByProfile_IsPublicTrueAndIsLookingForTrueOrderByProfile_CreatedAtDesc()
                .stream()
                .map(ConsumerDetails::getProfile)
                .map(this::mapProfile)
                .toList();
    }

    @Transactional
    public ProfileResponse updateMyProfile(UUID userId, ProfileUpdateRequest request) {
        Profile profile = findActiveProfile(userId);

        profile.setDisplayName(request.displayName().trim());
        profile.setAvatarUrl(blankToNull(request.avatarUrl()));
        profile.setCity(blankToNull(request.city()));
        profile.setAbout(blankToNull(request.about()));
        profile.setPublic(request.isPublic());
        profile.setEmailPublic(request.isEmailPublic());
        profile.setPhonePublic(request.isPhonePublic());

        Set<String> tags = request.sportsTags() == null ? Set.of() : request.sportsTags();
        profile.setSportsTags(new HashSet<>(tags));
        advanceOnboardingStepAfterProfileUpdate(profile);

        Profile saved = profileRepository.save(profile);
        return mapProfile(saved);
    }

    @Transactional
    public ProfileResponse patchMyPrivacy(UUID userId, ProfilePrivacyUpdateRequest request) {
        Profile profile = findActiveProfile(userId);
        if (request.isPublic() != null) {
            profile.setPublic(request.isPublic());
        }
        if (request.isEmailPublic() != null) {
            profile.setEmailPublic(request.isEmailPublic());
        }
        if (request.isPhonePublic() != null) {
            profile.setPhonePublic(request.isPhonePublic());
        }
        Profile saved = profileRepository.save(profile);
        return mapProfile(saved);
    }

    @Transactional
    public ProfileResponse updateMySearching(UUID userId, ProfileSearchingUpdateRequest request) {
        Profile profile = findActiveProfile(userId);
        if (profile.getProfileType() != ProfileType.CONSUMER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only CONSUMER profile can use searching mode");
        }

        ConsumerDetails details = consumerDetailsRepository.findById(profile.getId())
                .orElseGet(() -> {
                    ConsumerDetails created = new ConsumerDetails();
                    created.setProfile(profile);
                    return created;
                });
        details.setLookingFor(request.isLookingFor());
        consumerDetailsRepository.save(details);
        return mapProfile(profile);
    }

    @Transactional
    public ProfileDetailsResponse getMyDetails(UUID userId) {
        Profile profile = findActiveProfile(userId);
        return mapDetails(profile);
    }

    @Transactional
    public ConsumerDetailsResponse updateConsumerDetails(UUID userId, ConsumerDetailsUpdateRequest request) {
        Profile profile = findActiveProfile(userId);
        if (profile.getProfileType() != ProfileType.CONSUMER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile type is not CONSUMER");
        }

        ConsumerDetails details = consumerDetailsRepository.findById(profile.getId())
                .orElseGet(() -> {
                    ConsumerDetails created = new ConsumerDetails();
                    created.setProfile(profile);
                    return created;
                });

        details.setBirthYear(request.birthYear());
        details.setExperienceLevel(blankToNull(request.experienceLevel()));
        details.setGoals(blankToNull(request.goals()));
        details.setPreferences(blankToNull(request.preferences()));

        ConsumerDetails saved = consumerDetailsRepository.save(details);
        return mapConsumerDetails(saved);
    }

    @Transactional
    public ProviderDetailsResponse updateProviderDetails(UUID userId, ProviderDetailsUpdateRequest request) {
        Profile profile = findActiveProfile(userId);
        if (profile.getProfileType() != ProfileType.PROVIDER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile type is not PROVIDER");
        }

        ProviderDetails details = providerDetailsRepository.findById(profile.getId())
                .orElseGet(() -> {
                    ProviderDetails created = new ProviderDetails();
                    created.setProfile(profile);
                    return created;
                });

        details.setExperienceYears(request.experienceYears());
        details.setQualifications(blankToNull(request.qualifications()));
        details.setTrainingFormat(blankToNull(request.trainingFormat()));
        details.setPriceFrom(request.priceFrom());
        details.setPriceCurrency(normalizeCurrency(request.priceCurrency()));
        details.setServiceConditions(blankToNull(request.serviceConditions()));

        ProviderDetails saved = providerDetailsRepository.save(details);
        return mapProviderDetails(saved);
    }

    @Transactional
    public ProfileResponse createMyProfile(UUID userId, ProfileCreateRequest request) {
        User user = findUser(userId);
        long profilesCount = profileRepository.countByUser_Id(userId);
        if (profilesCount >= MAX_PROFILES_PER_USER) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Maximum number of profiles reached");
        }

        Profile profile = new Profile();
        profile.setUser(user);
        profile.setProfileType(request.profileType());
        profile.setDisplayName(request.displayName().trim());
        profile.setOnboardingStep(OnboardingStep.REGISTERED);
        Profile saved = profileRepository.save(profile);

        if (user.getActiveProfileId() == null) {
            user.setActiveProfileId(saved.getId());
            userRepository.save(user);
        }

        return mapProfile(saved);
    }

    @Transactional
    public List<MyProfileItemResponse> listMyProfiles(UUID userId) {
        User user = findUser(userId);
        UUID activeProfileId = resolveActiveProfile(user).getId();

        return profileRepository.findAllByUser_IdOrderByCreatedAtAsc(userId).stream()
                .map(profile -> new MyProfileItemResponse(
                        profile.getId(),
                        profile.getProfileType(),
                        profile.getDisplayName(),
                        getSearchingFlag(profile),
                        profile.getId().equals(activeProfileId)
                ))
                .toList();
    }

    @Transactional
    public ProfileResponse switchMyProfile(UUID userId, UUID profileId) {
        User user = findUser(userId);
        Profile profile = profileRepository.findByIdAndUser_Id(profileId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        user.setActiveProfileId(profile.getId());
        userRepository.save(user);
        return mapProfile(profile);
    }

    @Transactional
    public ProfileResponse clearMyProfile(UUID userId, UUID profileId) {
        Profile profile = profileRepository.findByIdAndUser_Id(profileId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        profile.setDisplayName(defaultDisplayName(profile.getProfileType()));
        profile.setAvatarUrl(null);
        profile.setCity(null);
        profile.setAbout(null);
        profile.setSportsTags(new HashSet<>());
        profile.setPublic(true);
        profile.setEmailPublic(false);
        profile.setPhonePublic(false);
        profile.setOnboardingStep(OnboardingStep.REGISTERED);

        if (profile.getProfileType() == ProfileType.CONSUMER) {
            consumerDetailsRepository.findById(profile.getId()).ifPresent(details -> {
                details.setBirthYear(null);
                details.setExperienceLevel(null);
                details.setGoals(null);
                details.setPreferences(null);
                details.setLookingFor(false);
                consumerDetailsRepository.save(details);
            });
        } else if (profile.getProfileType() == ProfileType.PROVIDER) {
            providerDetailsRepository.findById(profile.getId()).ifPresent(details -> {
                details.setExperienceYears(null);
                details.setQualifications(null);
                details.setTrainingFormat(null);
                details.setPriceFrom(null);
                details.setPriceCurrency(null);
                details.setServiceConditions(null);
                providerDetailsRepository.save(details);
            });
        }

        Profile saved = profileRepository.save(profile);
        return mapProfile(saved);
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Profile findActiveProfile(UUID userId) {
        User user = findUser(userId);
        return resolveActiveProfile(user);
    }

    private Profile resolveActiveProfile(User user) {
        if (user.getActiveProfileId() != null) {
            return profileRepository.findByIdAndUser_Id(user.getActiveProfileId(), user.getId())
                    .orElseGet(() -> assignFirstProfileAsActive(user));
        }
        return assignFirstProfileAsActive(user);
    }

    private Profile assignFirstProfileAsActive(User user) {
        Profile firstProfile = profileRepository.findFirstByUser_IdOrderByCreatedAtAsc(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        user.setActiveProfileId(firstProfile.getId());
        userRepository.save(user);
        return firstProfile;
    }

    private String defaultDisplayName(ProfileType profileType) {
        return profileType == ProfileType.PROVIDER ? "New provider" : "New consumer";
    }

    private void advanceOnboardingStepAfterProfileUpdate(Profile profile) {
        if (!hasMeaningfulProfileData(profile)) {
            return;
        }
        if (profile.getOnboardingStep() == OnboardingStep.REGISTERED) {
            profile.setOnboardingStep(OnboardingStep.PROFILE_BASICS_FILLED);
        }
    }

    private boolean hasMeaningfulProfileData(Profile profile) {
        if (!defaultDisplayName(profile.getProfileType()).equals(profile.getDisplayName())) {
            return true;
        }
        if (profile.getAvatarUrl() != null) {
            return true;
        }
        if (profile.getCity() != null) {
            return true;
        }
        if (profile.getAbout() != null) {
            return true;
        }
        return !profile.getSportsTags().isEmpty();
    }

    private ProfileResponse mapProfile(Profile profile) {
        return new ProfileResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getProfileType(),
                profile.getDisplayName(),
                profile.getAvatarUrl(),
                profile.getCity(),
                profile.getAbout(),
                Set.copyOf(profile.getSportsTags()),
                profile.isPublic(),
                profile.isEmailPublic(),
                profile.isPhonePublic(),
                getSearchingFlag(profile)
        );
    }

    private ProfileDetailsResponse mapDetails(Profile profile) {
        ConsumerDetailsResponse consumer = null;
        ProviderDetailsResponse provider = null;

        if (profile.getProfileType() == ProfileType.CONSUMER) {
            consumer = consumerDetailsRepository.findById(profile.getId())
                    .map(this::mapConsumerDetails)
                    .orElse(null);
        } else if (profile.getProfileType() == ProfileType.PROVIDER) {
            provider = providerDetailsRepository.findById(profile.getId())
                    .map(this::mapProviderDetails)
                    .orElse(null);
        }

        return new ProfileDetailsResponse(profile.getProfileType(), consumer, provider);
    }

    private ConsumerDetailsResponse mapConsumerDetails(ConsumerDetails details) {
        return new ConsumerDetailsResponse(
                details.getProfileId(),
                details.getBirthYear(),
                details.getExperienceLevel(),
                details.getGoals(),
                details.getPreferences(),
                details.isLookingFor()
        );
    }

    private Boolean getSearchingFlag(Profile profile) {
        if (profile.getProfileType() != ProfileType.CONSUMER) {
            return null;
        }
        return consumerDetailsRepository.findById(profile.getId())
                .map(ConsumerDetails::isLookingFor)
                .orElse(false);
    }

    private ProviderDetailsResponse mapProviderDetails(ProviderDetails details) {
        return new ProviderDetailsResponse(
                details.getProfileId(),
                details.getExperienceYears(),
                details.getQualifications(),
                details.getTrainingFormat(),
                details.getPriceFrom(),
                details.getPriceCurrency(),
                details.getServiceConditions()
        );
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String normalizeCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return null;
        }
        return currency.trim().toUpperCase(Locale.ROOT);
    }
}
