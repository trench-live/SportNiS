package com.sportnis.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.sportnis.api.listing.dto.ListingReplyCreateRequest;
import com.sportnis.api.listing.dto.ListingReplyResponse;
import com.sportnis.entity.enums.ListingReplyStatus;
import com.sportnis.entity.enums.ListingStatus;
import com.sportnis.entity.enums.ListingType;
import com.sportnis.entity.profile.Profile;
import com.sportnis.entity.listing.Listing;
import com.sportnis.entity.listing.ListingReply;
import com.sportnis.entity.user.User;
import com.sportnis.repository.listing.ListingReplyRepository;
import com.sportnis.repository.listing.ListingRepository;
import com.sportnis.repository.profile.ProfileRepository;
import com.sportnis.repository.user.UserRepository;
import java.util.List;
import java.util.Optional;
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
class ListingReplyServiceTest {

    @Mock
    private ListingReplyRepository listingReplyRepository;
    @Mock
    private ListingRepository listingRepository;
    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ListingReplyService listingReplyService;

    @Test
    void createMyReplyCreatesNewReply() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();
        UUID replyId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile responderProfile = new Profile();
        ReflectionTestUtils.setField(responderProfile, "id", profileId);
        responderProfile.setUser(user);

        Profile ownerProfile = new Profile();
        ReflectionTestUtils.setField(ownerProfile, "id", UUID.randomUUID());

        Listing listing = new Listing();
        ReflectionTestUtils.setField(listing, "id", listingId);
        listing.setOwnerProfile(ownerProfile);
        listing.setType(ListingType.OFFER);
        listing.setStatus(ListingStatus.PUBLISHED);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(responderProfile));
        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));
        when(listingReplyRepository.existsByListing_IdAndResponderProfile_Id(listingId, profileId)).thenReturn(false);
        when(listingReplyRepository.save(any(ListingReply.class))).thenAnswer(invocation -> {
            ListingReply reply = invocation.getArgument(0);
            ReflectionTestUtils.setField(reply, "id", replyId);
            return reply;
        });

        ListingReplyResponse response = listingReplyService.createMyReply(
                userId,
                listingId,
                new ListingReplyCreateRequest("Interested")
        );

        assertEquals(replyId, response.id());
        assertEquals(ListingReplyStatus.NEW, response.status());
        assertEquals("Interested", response.message());
    }

    @Test
    void createMyReplyRejectsOwnListing() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", profileId);
        profile.setUser(user);

        Listing listing = new Listing();
        ReflectionTestUtils.setField(listing, "id", listingId);
        listing.setOwnerProfile(profile);
        listing.setType(ListingType.OFFER);
        listing.setStatus(ListingStatus.PUBLISHED);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(profile));
        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                listingReplyService.createMyReply(userId, listingId, new ListingReplyCreateRequest("")));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void createMyReplyRejectsDuplicateReply() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile responderProfile = new Profile();
        ReflectionTestUtils.setField(responderProfile, "id", profileId);
        responderProfile.setUser(user);

        Profile ownerProfile = new Profile();
        ReflectionTestUtils.setField(ownerProfile, "id", UUID.randomUUID());

        Listing listing = new Listing();
        ReflectionTestUtils.setField(listing, "id", listingId);
        listing.setOwnerProfile(ownerProfile);
        listing.setType(ListingType.OFFER);
        listing.setStatus(ListingStatus.PUBLISHED);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(responderProfile));
        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));
        when(listingReplyRepository.existsByListing_IdAndResponderProfile_Id(listingId, profileId)).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                listingReplyService.createMyReply(userId, listingId, new ListingReplyCreateRequest("Interested")));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void acceptMyListingReplyChangesStatus() {
        UUID userId = UUID.randomUUID();
        UUID ownerProfileId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();
        UUID replyId = UUID.randomUUID();
        UUID responderProfileId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(ownerProfileId);

        Profile ownerProfile = new Profile();
        ReflectionTestUtils.setField(ownerProfile, "id", ownerProfileId);
        ownerProfile.setUser(user);

        Listing listing = new Listing();
        ReflectionTestUtils.setField(listing, "id", listingId);
        listing.setOwnerProfile(ownerProfile);
        listing.setType(ListingType.OFFER);
        listing.setStatus(ListingStatus.PUBLISHED);

        Profile responderProfile = new Profile();
        ReflectionTestUtils.setField(responderProfile, "id", responderProfileId);

        ListingReply reply = new ListingReply();
        ReflectionTestUtils.setField(reply, "id", replyId);
        reply.setListing(listing);
        reply.setResponderProfile(responderProfile);
        reply.setStatus(ListingReplyStatus.NEW);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(ownerProfileId, userId)).thenReturn(Optional.of(ownerProfile));
        when(listingRepository.findByIdAndOwnerProfile_Id(listingId, ownerProfileId)).thenReturn(Optional.of(listing));
        when(listingReplyRepository.findByIdAndListing_Id(replyId, listingId)).thenReturn(Optional.of(reply));
        when(listingReplyRepository.save(any(ListingReply.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ListingReplyResponse response = listingReplyService.acceptMyListingReply(userId, listingId, replyId);

        assertEquals(ListingReplyStatus.ACCEPTED, response.status());
    }

    @Test
    void createMyReplyNormalizesBlankMessageToNull() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();
        UUID replyId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile responderProfile = new Profile();
        ReflectionTestUtils.setField(responderProfile, "id", profileId);
        responderProfile.setUser(user);

        Profile ownerProfile = new Profile();
        ReflectionTestUtils.setField(ownerProfile, "id", UUID.randomUUID());

        Listing listing = new Listing();
        ReflectionTestUtils.setField(listing, "id", listingId);
        listing.setOwnerProfile(ownerProfile);
        listing.setType(ListingType.OFFER);
        listing.setStatus(ListingStatus.PUBLISHED);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(responderProfile));
        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));
        when(listingReplyRepository.existsByListing_IdAndResponderProfile_Id(listingId, profileId)).thenReturn(false);
        when(listingReplyRepository.save(any(ListingReply.class))).thenAnswer(invocation -> {
            ListingReply reply = invocation.getArgument(0);
            ReflectionTestUtils.setField(reply, "id", replyId);
            return reply;
        });

        ListingReplyResponse response = listingReplyService.createMyReply(
                userId,
                listingId,
                new ListingReplyCreateRequest("   ")
        );

        assertNull(response.message());
    }

    @Test
    void listMyListingRepliesReturnsOwnerReplies() {
        UUID userId = UUID.randomUUID();
        UUID ownerProfileId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(ownerProfileId);

        Profile ownerProfile = new Profile();
        ReflectionTestUtils.setField(ownerProfile, "id", ownerProfileId);
        ownerProfile.setUser(user);

        Listing listing = new Listing();
        ReflectionTestUtils.setField(listing, "id", listingId);
        listing.setOwnerProfile(ownerProfile);

        ListingReply reply = new ListingReply();
        ReflectionTestUtils.setField(reply, "id", UUID.randomUUID());
        reply.setListing(listing);
        reply.setResponderProfile(ownerProfile);
        reply.setStatus(ListingReplyStatus.NEW);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(ownerProfileId, userId)).thenReturn(Optional.of(ownerProfile));
        when(listingRepository.findByIdAndOwnerProfile_Id(listingId, ownerProfileId)).thenReturn(Optional.of(listing));
        when(listingReplyRepository.findAllByListing_IdOrderByCreatedAtDesc(listingId)).thenReturn(List.of(reply));

        List<ListingReplyResponse> responses = listingReplyService.listMyListingReplies(userId, listingId);

        assertEquals(1, responses.size());
        assertEquals(ListingReplyStatus.NEW, responses.get(0).status());
    }
}
