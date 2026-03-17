package com.sportnis.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sportnis.api.listing.dto.ListingCreateRequest;
import com.sportnis.api.listing.dto.ListingResponse;
import com.sportnis.api.listing.dto.ListingUpdateRequest;
import com.sportnis.entity.enums.ListingFormat;
import com.sportnis.entity.enums.ListingReplyStatus;
import com.sportnis.entity.enums.ListingStatus;
import com.sportnis.entity.enums.ListingType;
import com.sportnis.entity.enums.ProfileType;
import com.sportnis.entity.listing.Listing;
import com.sportnis.entity.profile.Profile;
import com.sportnis.entity.user.User;
import com.sportnis.repository.listing.ListingReplyRepository;
import com.sportnis.repository.listing.ListingRepository;
import com.sportnis.repository.profile.ProfileRepository;
import com.sportnis.repository.user.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ListingServiceTest {

    @Mock
    private ListingReplyRepository listingReplyRepository;
    @Mock
    private ListingRepository listingRepository;
    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ListingService listingService;

    @Test
    void createMyListingSetsRubAndPublished() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", profileId);
        profile.setUser(user);
        profile.setProfileType(ProfileType.PROVIDER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(profile));
        when(listingRepository.existsByOwnerProfile_IdAndStatusAndTypeAndTitleIgnoreCaseAndDescriptionIgnoreCase(
                profileId,
                ListingStatus.PUBLISHED,
                ListingType.OFFER,
                "Need running coach",
                "2 times a week"
        )).thenReturn(false);
        when(listingRepository.save(any(Listing.class))).thenAnswer(invocation -> {
            Listing listing = invocation.getArgument(0);
            ReflectionTestUtils.setField(listing, "id", listingId);
            return listing;
        });

        ListingCreateRequest request = new ListingCreateRequest(
                ListingType.OFFER,
                "Need running coach",
                "2 times a week",
                "Telegram: @coach",
                Set.of("running"),
                "Moscow",
                ListingFormat.OFFLINE,
                null,
                null,
                null,
                false
        );

        ListingResponse response = listingService.createMyListing(userId, request);

        assertEquals(listingId, response.id());
        assertEquals(ListingStatus.PUBLISHED, response.status());
        assertEquals("RUB", response.currency());
        assertEquals("Telegram: @coach", response.contactInfo());
        assertEquals(true, response.contactVisibleForMe());

        ArgumentCaptor<Listing> captor = ArgumentCaptor.forClass(Listing.class);
        verify(listingRepository).save(captor.capture());
        assertEquals(ListingStatus.PUBLISHED, captor.getValue().getStatus());
        assertEquals("RUB", captor.getValue().getCurrency());
    }

    @Test
    void createMyListingRejectsManualCloseWithExpiresAt() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", profileId);
        profile.setUser(user);
        profile.setProfileType(ProfileType.PROVIDER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(profile));

        ListingCreateRequest request = new ListingCreateRequest(
                ListingType.OFFER,
                "Group training",
                "Evenings",
                "WhatsApp +79000000000",
                Set.of("fitness"),
                "Moscow",
                ListingFormat.OFFLINE,
                null,
                null,
                Instant.now().plusSeconds(3600),
                true
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                listingService.createMyListing(userId, request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void createMyListingRejectsOfferForConsumerProfile() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", profileId);
        profile.setUser(user);
        profile.setProfileType(ProfileType.CONSUMER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(profile));

        ListingCreateRequest request = new ListingCreateRequest(
                ListingType.REQUEST,
                "Need running coach",
                "2 times a week",
                "Telegram: @athlete",
                Set.of("running"),
                "Moscow",
                ListingFormat.OFFLINE,
                null,
                null,
                null,
                false
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                listingService.createMyListing(userId, request));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void createMyListingRejectsRequestForProviderProfile() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", profileId);
        profile.setUser(user);
        profile.setProfileType(ProfileType.PROVIDER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(profile));

        ListingCreateRequest request = new ListingCreateRequest(
                ListingType.REQUEST,
                "Need running coach",
                "2 times a week",
                "Telegram: @athlete",
                Set.of("running"),
                "Moscow",
                ListingFormat.OFFLINE,
                null,
                null,
                null,
                false
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                listingService.createMyListing(userId, request));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void createMyListingRejectsDuplicateProviderOffer() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", profileId);
        profile.setUser(user);
        profile.setProfileType(ProfileType.PROVIDER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(profile));
        when(listingRepository.existsByOwnerProfile_IdAndStatusAndTypeAndTitleIgnoreCaseAndDescriptionIgnoreCase(
                profileId,
                ListingStatus.PUBLISHED,
                ListingType.OFFER,
                "Need tennis coach",
                "3 times a week"
        )).thenReturn(true);

        ListingCreateRequest request = new ListingCreateRequest(
                ListingType.OFFER,
                "Need tennis coach",
                "3 times a week",
                "Telegram: @coach2",
                Set.of("tennis"),
                "Moscow",
                ListingFormat.OFFLINE,
                null,
                null,
                null,
                false
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                listingService.createMyListing(userId, request));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void updateMyListingRejectsDuplicateProviderOffer() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", profileId);
        profile.setUser(user);
        profile.setProfileType(ProfileType.PROVIDER);

        Listing listing = new Listing();
        ReflectionTestUtils.setField(listing, "id", listingId);
        listing.setOwnerProfile(profile);
        listing.setType(ListingType.OFFER);
        listing.setStatus(ListingStatus.PUBLISHED);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(profile));
        when(listingRepository.findByIdAndOwnerProfile_Id(listingId, profileId)).thenReturn(Optional.of(listing));
        when(listingRepository.existsByOwnerProfile_IdAndStatusAndTypeAndIdNotAndTitleIgnoreCaseAndDescriptionIgnoreCase(
                profileId,
                ListingStatus.PUBLISHED,
                ListingType.OFFER,
                listingId,
                "Football group",
                "Evening trainings"
        )).thenReturn(true);

        ListingUpdateRequest request = new ListingUpdateRequest(
                "Football group",
                "Evening trainings",
                "Telegram: @coach",
                Set.of("football"),
                "Moscow",
                ListingFormat.OFFLINE,
                null,
                null,
                null,
                false
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                listingService.updateMyListing(userId, listingId, request));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void listPublicListingsAutoClosesExpired() {
        UUID listingId = UUID.randomUUID();
        Listing expired = new Listing();
        ReflectionTestUtils.setField(expired, "id", listingId);
        expired.setStatus(ListingStatus.PUBLISHED);
        expired.setManualCloseOnly(false);
        expired.setExpiresAt(Instant.now().minusSeconds(60));

        when(listingRepository.findAllByStatusAndManualCloseOnlyFalseAndExpiresAtLessThanEqual(
                eq(ListingStatus.PUBLISHED), any(Instant.class)
        )).thenReturn(List.of(expired));
        when(listingRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(listingRepository.findAllByStatusOrderByCreatedAtDesc(ListingStatus.PUBLISHED)).thenReturn(List.of());

        listingService.listPublicListings(null, null);

        assertEquals(ListingStatus.CLOSED, expired.getStatus());
        verify(listingRepository).saveAll(any());
    }

    @Test
    void getPublicListingReturnsNotFoundForNonPublished() {
        UUID listingId = UUID.randomUUID();
        when(listingRepository.findAllByStatusAndManualCloseOnlyFalseAndExpiresAtLessThanEqual(
                eq(ListingStatus.PUBLISHED), any(Instant.class)
        )).thenReturn(List.of());
        when(listingRepository.findByIdAndStatus(listingId, ListingStatus.PUBLISHED)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                listingService.getPublicListing(null, listingId));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void getPublicListingHidesContactInfo() {
        UUID listingId = UUID.randomUUID();
        UUID ownerProfileId = UUID.randomUUID();

        Profile ownerProfile = new Profile();
        ReflectionTestUtils.setField(ownerProfile, "id", ownerProfileId);

        Listing listing = new Listing();
        ReflectionTestUtils.setField(listing, "id", listingId);
        listing.setOwnerProfile(ownerProfile);
        listing.setType(ListingType.OFFER);
        listing.setStatus(ListingStatus.PUBLISHED);
        listing.setTitle("Title");
        listing.setDescription("Description");
        listing.setContactInfo("Telegram: @hidden");
        listing.setFormat(ListingFormat.ONLINE);
        listing.setCurrency("RUB");

        when(listingRepository.findAllByStatusAndManualCloseOnlyFalseAndExpiresAtLessThanEqual(
                eq(ListingStatus.PUBLISHED), any(Instant.class)
        )).thenReturn(List.of());
        when(listingRepository.findByIdAndStatus(listingId, ListingStatus.PUBLISHED)).thenReturn(Optional.of(listing));

        ListingResponse response = listingService.getPublicListing(null, listingId);
        assertNull(response.contactInfo());
        assertEquals(false, response.contactVisibleForMe());
    }

    @Test
    void getPublicListingShowsContactInfoForAcceptedResponder() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();
        UUID ownerProfileId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile activeProfile = new Profile();
        ReflectionTestUtils.setField(activeProfile, "id", profileId);
        activeProfile.setUser(user);

        Profile ownerProfile = new Profile();
        ReflectionTestUtils.setField(ownerProfile, "id", ownerProfileId);

        Listing listing = new Listing();
        ReflectionTestUtils.setField(listing, "id", listingId);
        listing.setOwnerProfile(ownerProfile);
        listing.setType(ListingType.OFFER);
        listing.setStatus(ListingStatus.PUBLISHED);
        listing.setTitle("Title");
        listing.setDescription("Description");
        listing.setContactInfo("Telegram: @visible");
        listing.setFormat(ListingFormat.ONLINE);
        listing.setCurrency("RUB");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(activeProfile));
        when(listingRepository.findAllByStatusAndManualCloseOnlyFalseAndExpiresAtLessThanEqual(
                eq(ListingStatus.PUBLISHED), any(Instant.class)
        )).thenReturn(List.of());
        when(listingRepository.findByIdAndStatus(listingId, ListingStatus.PUBLISHED)).thenReturn(Optional.of(listing));
        when(listingReplyRepository.existsByListing_IdAndResponderProfile_IdAndStatus(
                listingId,
                profileId,
                ListingReplyStatus.ACCEPTED
        )).thenReturn(true);

        ListingResponse response = listingService.getPublicListing(userId, listingId);

        assertEquals("Telegram: @visible", response.contactInfo());
        assertEquals(true, response.contactVisibleForMe());
    }
}
