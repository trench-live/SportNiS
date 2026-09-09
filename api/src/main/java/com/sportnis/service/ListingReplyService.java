package com.sportnis.service;

import com.sportnis.api.listing.dto.ListingReplyCreateRequest;
import com.sportnis.api.listing.dto.ListingReplyResponse;
import com.sportnis.entity.enums.ListingReplyStatus;
import com.sportnis.entity.enums.ListingStatus;
import com.sportnis.entity.listing.Listing;
import com.sportnis.entity.listing.ListingReply;
import com.sportnis.entity.profile.Profile;
import com.sportnis.entity.user.User;
import com.sportnis.repository.listing.ListingReplyRepository;
import com.sportnis.repository.listing.ListingRepository;
import com.sportnis.repository.profile.ProfileRepository;
import com.sportnis.repository.user.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ListingReplyService {

    private final ListingReplyRepository listingReplyRepository;
    private final ListingRepository listingRepository;
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ListingReplyService(
            ListingReplyRepository listingReplyRepository,
            ListingRepository listingRepository,
            ProfileRepository profileRepository,
            UserRepository userRepository
    ) {
        this.listingReplyRepository = listingReplyRepository;
        this.listingRepository = listingRepository;
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ListingReplyResponse createMyReply(UUID userId, UUID listingId, ListingReplyCreateRequest request) {
        Profile responderProfile = findActiveProfile(userId);
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));

        if (listing.getStatus() != ListingStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Replies are allowed only for PUBLISHED listings");
        }
        if (listing.getOwnerProfile().getId().equals(responderProfile.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot reply to your own listing");
        }
        if (listingReplyRepository.existsByListing_IdAndResponderProfile_Id(listingId, responderProfile.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Reply for this listing already exists");
        }

        ListingReply reply = new ListingReply();
        reply.setListing(listing);
        reply.setResponderProfile(responderProfile);
        reply.setMessage(blankToNull(request.message()));
        reply.setStatus(ListingReplyStatus.NEW);

        return map(listingReplyRepository.save(reply));
    }

    @Transactional(readOnly = true)
    public List<ListingReplyResponse> listMyListingReplies(UUID userId, UUID listingId) {
        Profile ownerProfile = findActiveProfile(userId);
        Listing listing = listingRepository.findByIdAndOwnerProfile_Id(listingId, ownerProfile.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));

        return listingReplyRepository.findAllByListing_IdOrderByCreatedAtDesc(listing.getId()).stream()
                .map(this::map)
                .toList();
    }

    @Transactional
    public void withdrawMyReply(UUID userId, UUID listingId) {
        Profile responderProfile = findActiveProfile(userId);
        ListingReply reply = listingReplyRepository
                .findByListing_IdAndResponderProfile_Id(listingId, responderProfile.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reply not found"));

        if (reply.getStatus() == ListingReplyStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot withdraw an accepted reply");
        }

        // Удаление освобождает уникальный слот (listing_id, responder_profile_id) — можно откликнуться заново.
        listingReplyRepository.delete(reply);
    }

    @Transactional
    public ListingReplyResponse acceptMyListingReply(UUID userId, UUID listingId, UUID replyId) {
        return updateReplyStatus(userId, listingId, replyId, ListingReplyStatus.ACCEPTED);
    }

    @Transactional
    public ListingReplyResponse rejectMyListingReply(UUID userId, UUID listingId, UUID replyId) {
        return updateReplyStatus(userId, listingId, replyId, ListingReplyStatus.REJECTED);
    }

    private ListingReplyResponse updateReplyStatus(
            UUID userId,
            UUID listingId,
            UUID replyId,
            ListingReplyStatus targetStatus
    ) {
        Profile ownerProfile = findActiveProfile(userId);
        listingRepository.findByIdAndOwnerProfile_Id(listingId, ownerProfile.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));

        ListingReply reply = listingReplyRepository.findByIdAndListing_Id(replyId, listingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reply not found"));

        reply.setStatus(targetStatus);
        return map(listingReplyRepository.save(reply));
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

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private ListingReplyResponse map(ListingReply reply) {
        return new ListingReplyResponse(
                reply.getId(),
                reply.getListing().getId(),
                reply.getResponderProfile().getId(),
                reply.getMessage(),
                reply.getStatus(),
                reply.getCreatedAt(),
                reply.getUpdatedAt()
        );
    }
}
