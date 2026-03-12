package com.sportnis.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sportnis.api.listing.dto.ListingCreateRequest;
import com.sportnis.api.listing.dto.ListingResponse;
import com.sportnis.entity.enums.ListingFormat;
import com.sportnis.entity.enums.ListingStatus;
import com.sportnis.entity.enums.ListingType;
import com.sportnis.entity.listing.Listing;
import com.sportnis.entity.profile.Profile;
import com.sportnis.entity.user.User;
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

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(profile));
        when(listingRepository.save(any(Listing.class))).thenAnswer(invocation -> {
            Listing listing = invocation.getArgument(0);
            ReflectionTestUtils.setField(listing, "id", listingId);
            return listing;
        });

        ListingCreateRequest request = new ListingCreateRequest(
                ListingType.REQUEST,
                "Need running coach",
                "2 times a week",
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

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(profile));

        ListingCreateRequest request = new ListingCreateRequest(
                ListingType.OFFER,
                "Group training",
                "Evenings",
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

        listingService.listPublicListings(null);

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
                listingService.getPublicListing(listingId));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }
}

