package com.sportnis.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sportnis.api.profile.dto.ProfileResponse;
import com.sportnis.api.profile.dto.ProfileSearchingUpdateRequest;
import com.sportnis.api.profile.dto.ProfileUpdateRequest;
import com.sportnis.entity.enums.OnboardingStep;
import com.sportnis.entity.enums.ProfileType;
import com.sportnis.entity.profile.Profile;
import com.sportnis.entity.profile.details.ConsumerDetails;
import com.sportnis.entity.user.User;
import com.sportnis.repository.profile.ProfileRepository;
import com.sportnis.repository.profile.details.ConsumerDetailsRepository;
import com.sportnis.repository.profile.details.ProviderDetailsRepository;
import com.sportnis.repository.user.UserRepository;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ConsumerDetailsRepository consumerDetailsRepository;
    @Mock
    private ProviderDetailsRepository providerDetailsRepository;

    @InjectMocks
    private ProfileService profileService;

    @Test
    void updateMyProfileAdvancesOnboardingStep() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);
        user.setOnboardingStep(OnboardingStep.REGISTERED);

        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", profileId);
        profile.setUser(user);
        profile.setProfileType(ProfileType.CONSUMER);
        profile.setDisplayName("New consumer");
        profile.setSportsTags(Set.of());

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(profile));
        when(profileRepository.save(any(Profile.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(consumerDetailsRepository.findById(profileId)).thenReturn(Optional.empty());

        ProfileUpdateRequest request = new ProfileUpdateRequest(
                "Alex Runner",
                null,
                null,
                null,
                Set.of("running"),
                true,
                false,
                false
        );

        ProfileResponse response = profileService.updateMyProfile(userId, request);

        assertEquals("Alex Runner", response.displayName());
        assertEquals(OnboardingStep.PROFILE_BASICS_FILLED, profile.getOnboardingStep());
        verify(userRepository, never()).save(user);
    }

    @Test
    void clearMyProfileResetsProfileAndConsumerDetails() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);

        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", profileId);
        profile.setUser(user);
        profile.setProfileType(ProfileType.CONSUMER);
        profile.setDisplayName("Custom Name");
        profile.setAvatarUrl("https://cdn/avatar.png");
        profile.setCity("Moscow");
        profile.setAbout("About");
        profile.setSportsTags(Set.of("running", "fitness"));
        profile.setPublic(false);
        profile.setEmailPublic(true);
        profile.setPhonePublic(true);
        profile.setOnboardingStep(OnboardingStep.PROFILE_BASICS_FILLED);

        ConsumerDetails details = new ConsumerDetails();
        details.setBirthYear(2000);
        details.setExperienceLevel("beginner");
        details.setGoals("goal");
        details.setPreferences("preferences");
        details.setLookingFor(true);

        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(profile));
        when(profileRepository.save(any(Profile.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(consumerDetailsRepository.findById(profileId)).thenReturn(Optional.of(details));
        when(consumerDetailsRepository.save(any(ConsumerDetails.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProfileResponse response = profileService.clearMyProfile(userId, profileId);

        assertEquals("New consumer", response.displayName());
        assertNull(response.avatarUrl());
        assertNull(response.city());
        assertNull(response.about());
        assertTrue(response.sportsTags().isEmpty());
        assertTrue(response.isPublic());
        assertEquals(false, response.isEmailPublic());
        assertEquals(false, response.isPhonePublic());
        assertEquals(false, response.isLookingFor());
        assertEquals(OnboardingStep.REGISTERED, profile.getOnboardingStep());

        assertNull(details.getBirthYear());
        assertNull(details.getExperienceLevel());
        assertNull(details.getGoals());
        assertNull(details.getPreferences());
        verify(consumerDetailsRepository).save(details);
        verify(providerDetailsRepository, never()).save(any());
    }

    @Test
    void createMyProfileFailsWhenUserHasFiftyProfiles() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.countByUser_Id(userId)).thenReturn(50L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                profileService.createMyProfile(userId, new com.sportnis.api.profile.dto.ProfileCreateRequest(
                        ProfileType.PROVIDER,
                        "Coach Name"
                )));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void getPublicProfileThrowsNotFoundForPrivateProfile() {
        UUID profileId = UUID.randomUUID();
        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", profileId);
        profile.setPublic(false);

        when(profileRepository.findById(profileId)).thenReturn(Optional.of(profile));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                profileService.getPublicProfile(profileId));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void listPublicProfilesReturnsOnlyPublicFromRepository() {
        Profile p1 = new Profile();
        ReflectionTestUtils.setField(p1, "id", UUID.randomUUID());
        p1.setUser(new User());
        p1.setProfileType(ProfileType.CONSUMER);
        p1.setDisplayName("Public 1");
        p1.setPublic(true);

        Profile p2 = new Profile();
        ReflectionTestUtils.setField(p2, "id", UUID.randomUUID());
        p2.setUser(new User());
        p2.setProfileType(ProfileType.PROVIDER);
        p2.setDisplayName("Public 2");
        p2.setPublic(true);

        when(profileRepository.findAllByIsPublicTrueOrderByCreatedAtDesc()).thenReturn(java.util.List.of(p1, p2));

        java.util.List<ProfileResponse> result = profileService.listPublicProfiles();

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(ProfileResponse::isPublic));
    }

    @Test
    void updateMySearchingEnablesFlagForConsumerProfile() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", profileId);
        profile.setUser(user);
        profile.setProfileType(ProfileType.CONSUMER);
        profile.setDisplayName("Consumer");

        ConsumerDetails savedDetails = new ConsumerDetails();
        ReflectionTestUtils.setField(savedDetails, "profileId", profileId);
        savedDetails.setProfile(profile);
        savedDetails.setLookingFor(true);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(profile));
        when(consumerDetailsRepository.findById(profileId)).thenReturn(Optional.empty(), Optional.of(savedDetails));
        when(consumerDetailsRepository.save(any(ConsumerDetails.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProfileResponse response = profileService.updateMySearching(userId, new ProfileSearchingUpdateRequest(true));

        assertTrue(response.isLookingFor());
    }

    @Test
    void updateMySearchingRejectsProviderProfile() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", profileId);
        profile.setUser(user);
        profile.setProfileType(ProfileType.PROVIDER);
        profile.setDisplayName("Provider");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(profile));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                profileService.updateMySearching(userId, new ProfileSearchingUpdateRequest(true)));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void listPublicSearchingProfilesReturnsOnlyConsumerProfilesInSearch() {
        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", UUID.randomUUID());
        profile.setUser(new User());
        profile.setProfileType(ProfileType.CONSUMER);
        profile.setDisplayName("Searching Consumer");
        profile.setPublic(true);
        ConsumerDetails details = new ConsumerDetails();
        ReflectionTestUtils.setField(details, "profileId", profile.getId());
        details.setProfile(profile);
        details.setLookingFor(true);

        when(consumerDetailsRepository.findAllByProfile_IsPublicTrueAndIsLookingForTrueOrderByProfile_CreatedAtDesc())
                .thenReturn(java.util.List.of(details));
        when(consumerDetailsRepository.findById(profile.getId())).thenReturn(Optional.of(details));

        java.util.List<ProfileResponse> result = profileService.listPublicSearchingProfiles();

        assertEquals(1, result.size());
        assertTrue(result.get(0).isLookingFor());
        assertEquals(ProfileType.CONSUMER, result.get(0).profileType());
    }

    @Test
    void getMyProfileReturnsNullSearchingFlagForProvider() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", profileId);
        profile.setUser(user);
        profile.setProfileType(ProfileType.PROVIDER);
        profile.setDisplayName("Provider");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(profile));

        ProfileResponse response = profileService.getMyProfile(userId);

        assertEquals(null, response.isLookingFor());
    }
}
