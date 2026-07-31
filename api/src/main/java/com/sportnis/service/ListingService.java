package com.sportnis.service;

import com.sportnis.api.listing.dto.ListingCreateRequest;
import com.sportnis.entity.enums.ProfileType;
import com.sportnis.api.listing.dto.ListingResponse;
import com.sportnis.api.listing.dto.ListingUpdateRequest;
import com.sportnis.entity.enums.ListingStatus;
import com.sportnis.entity.enums.ListingType;
import com.sportnis.entity.enums.ListingReplyStatus;
import com.sportnis.entity.listing.Listing;
import com.sportnis.entity.profile.Profile;
import com.sportnis.entity.user.User;
import com.sportnis.repository.listing.ListingReplyRepository;
import com.sportnis.repository.listing.ListingRepository;
import com.sportnis.repository.profile.ProfileRepository;
import com.sportnis.repository.user.UserRepository;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ListingService {

    private static final String CURRENCY_RUB = "RUB";

    private final ListingReplyRepository listingReplyRepository;
    private final ListingRepository listingRepository;
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ListingService(
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
    public ListingResponse createMyListing(UUID userId, ListingCreateRequest request) {
        Profile ownerProfile = findActiveProfile(userId);
        String normalizedTitle = request.title().trim();
        String normalizedDescription = request.description().trim();

        validateCreateTypeByProfile(ownerProfile, request.type());
        validateNoDuplicateActiveOffer(ownerProfile, request.type(), normalizedTitle, normalizedDescription);
        validateExpiresAt(request.manualCloseOnly(), request.expiresAt());

        Listing listing = new Listing();
        listing.setOwnerProfile(ownerProfile);
        listing.setType(request.type());
        listing.setStatus(ListingStatus.PUBLISHED);
        listing.setTitle(normalizedTitle);
        listing.setDescription(normalizedDescription);
        listing.setContactInfo(blankToNull(request.contactInfo()));
        listing.setTags(new HashSet<>(request.tags() == null ? Set.of() : request.tags()));
        listing.setCity(blankToNull(request.city()));
        listing.setFormat(request.format());
        listing.setPriceFrom(request.priceFrom());
        listing.setPriceTo(request.priceTo());
        listing.setCurrency(CURRENCY_RUB);
        listing.setExpiresAt(request.expiresAt());
        listing.setManualCloseOnly(request.manualCloseOnly());

        Listing saved = listingRepository.save(listing);
        return map(saved, true, true, null);
    }

    @Transactional
    public List<ListingResponse> listMyListings(UUID userId) {
        closeExpiredListings();
        Profile ownerProfile = findActiveProfile(userId);
        return listingRepository.findAllByOwnerProfile_IdOrderByCreatedAtDesc(ownerProfile.getId()).stream()
                .map(listing -> map(listing, true, true, null))
                .toList();
    }

    @Transactional
    public ListingResponse getMyListing(UUID userId, UUID listingId) {
        closeExpiredListings();
        Profile ownerProfile = findActiveProfile(userId);
        Listing listing = listingRepository.findByIdAndOwnerProfile_Id(listingId, ownerProfile.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        return map(listing, true, true, null);
    }

    @Transactional
    public ListingResponse updateMyListing(UUID userId, UUID listingId, ListingUpdateRequest request) {
        closeExpiredListings();
        Profile ownerProfile = findActiveProfile(userId);
        Listing listing = listingRepository.findByIdAndOwnerProfile_Id(listingId, ownerProfile.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        if (listing.getStatus() != ListingStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only PUBLISHED listing can be updated");
        }

        String normalizedTitle = request.title().trim();
        String normalizedDescription = request.description().trim();

        validateNoDuplicateActiveOfferForUpdate(ownerProfile, listing, normalizedTitle, normalizedDescription);
        validateExpiresAt(request.manualCloseOnly(), request.expiresAt());

        listing.setTitle(normalizedTitle);
        listing.setDescription(normalizedDescription);
        listing.setContactInfo(blankToNull(request.contactInfo()));
        listing.setTags(new HashSet<>(request.tags() == null ? Set.of() : request.tags()));
        listing.setCity(blankToNull(request.city()));
        listing.setFormat(request.format());
        listing.setPriceFrom(request.priceFrom());
        listing.setPriceTo(request.priceTo());
        listing.setCurrency(CURRENCY_RUB);
        listing.setExpiresAt(request.expiresAt());
        listing.setManualCloseOnly(request.manualCloseOnly());

        Listing saved = listingRepository.save(listing);
        return map(saved, true, true, null);
    }

    @Transactional
    public ListingResponse archiveMyListing(UUID userId, UUID listingId) {
        closeExpiredListings();
        Profile ownerProfile = findActiveProfile(userId);
        Listing listing = listingRepository.findByIdAndOwnerProfile_Id(listingId, ownerProfile.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        if (listing.getStatus() == ListingStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Closed listing cannot be archived");
        }
        listing.setStatus(ListingStatus.ARCHIVED);
        return map(listingRepository.save(listing), true, true, null);
    }

    @Transactional
    public ListingResponse closeMyListing(UUID userId, UUID listingId) {
        closeExpiredListings();
        Profile ownerProfile = findActiveProfile(userId);
        Listing listing = listingRepository.findByIdAndOwnerProfile_Id(listingId, ownerProfile.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        listing.setStatus(ListingStatus.CLOSED);
        return map(listingRepository.save(listing), true, true, null);
    }

    @Transactional
    public List<ListingResponse> listPublicListings(UUID currentUserId, ListingType type) {
        closeExpiredListings();
        List<Listing> listings = type == null
                ? listingRepository.findAllByStatusOrderByCreatedAtDesc(ListingStatus.PUBLISHED)
                : listingRepository.findAllByStatusAndTypeOrderByCreatedAtDesc(ListingStatus.PUBLISHED, type);
        Profile viewerProfile = resolveActiveProfileOrNull(currentUserId);
        return listings.stream()
                .map(listing -> {
                    boolean canViewContactInfo = canViewContactInfo(listing, viewerProfile);
                    // В списке статус своего отклика не показываем — не гоняем лишние запросы.
                    return map(listing, canViewContactInfo, canViewContactInfo, null);
                })
                .toList();
    }

    @Transactional
    public List<ListingResponse> listMyReplies(UUID userId) {
        closeExpiredListings();
        Profile viewerProfile = findActiveProfile(userId);
        // Листинги, на которые откликнулся текущий профиль — с его статусом отклика и видимостью контактов.
        return listingReplyRepository.findAllByResponderProfile_IdOrderByCreatedAtDesc(viewerProfile.getId())
                .stream()
                .map(reply -> {
                    Listing listing = reply.getListing();
                    boolean canViewContactInfo = canViewContactInfo(listing, viewerProfile);
                    return map(listing, canViewContactInfo, canViewContactInfo, reply.getStatus());
                })
                .toList();
    }

    @Transactional
    public ListingResponse getPublicListing(UUID currentUserId, UUID listingId) {
        closeExpiredListings();
        Listing listing = listingRepository.findByIdAndStatus(listingId, ListingStatus.PUBLISHED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        Profile viewerProfile = resolveActiveProfileOrNull(currentUserId);
        boolean canViewContactInfo = canViewContactInfo(listing, viewerProfile);
        return map(listing, canViewContactInfo, canViewContactInfo, viewerReplyStatus(listing, viewerProfile));
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Profile findActiveProfile(UUID userId) {
        User user = findUser(userId);
        return resolveActiveProfile(user);
    }

    private Profile resolveActiveProfileOrNull(UUID userId) {
        if (userId == null) {
            return null;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        try {
            return resolveActiveProfile(user);
        } catch (ResponseStatusException ex) {
            return null;
        }
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

    private void validateExpiresAt(Boolean manualCloseOnly, Instant expiresAt) {
        if (Boolean.TRUE.equals(manualCloseOnly)) {
            if (expiresAt != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "expiresAt must be null when manualCloseOnly=true");
            }
            return;
        }
        if (expiresAt != null && !expiresAt.isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "expiresAt must be in the future");
        }
    }

    private void validateCreateTypeByProfile(Profile ownerProfile, ListingType type) {
        if (ownerProfile.getProfileType() == ProfileType.CONSUMER) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CONSUMER profile cannot create listings");
        }
        if (ownerProfile.getProfileType() == ProfileType.PROVIDER && type != ListingType.OFFER) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "PROVIDER profile can create only OFFER listings");
        }
    }

    private void validateNoDuplicateActiveOffer(
            Profile ownerProfile,
            ListingType type,
            String title,
            String description
    ) {
        if (ownerProfile.getProfileType() != ProfileType.PROVIDER || type != ListingType.OFFER) {
            return;
        }
        boolean duplicateExists = listingRepository.existsByOwnerProfile_IdAndStatusAndTypeAndTitleIgnoreCaseAndDescriptionIgnoreCase(
                ownerProfile.getId(),
                ListingStatus.PUBLISHED,
                ListingType.OFFER,
                title,
                description
        );
        if (duplicateExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Duplicate active OFFER listing already exists for this profile"
            );
        }
    }

    private void validateNoDuplicateActiveOfferForUpdate(
            Profile ownerProfile,
            Listing listing,
            String title,
            String description
    ) {
        if (ownerProfile.getProfileType() != ProfileType.PROVIDER || listing.getType() != ListingType.OFFER) {
            return;
        }
        boolean duplicateExists = listingRepository.existsByOwnerProfile_IdAndStatusAndTypeAndIdNotAndTitleIgnoreCaseAndDescriptionIgnoreCase(
                ownerProfile.getId(),
                ListingStatus.PUBLISHED,
                ListingType.OFFER,
                listing.getId(),
                title,
                description
        );
        if (duplicateExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Duplicate active OFFER listing already exists for this profile"
            );
        }
    }

    private void closeExpiredListings() {
        List<Listing> expired = listingRepository.findAllByStatusAndManualCloseOnlyFalseAndExpiresAtLessThanEqual(
                ListingStatus.PUBLISHED,
                Instant.now()
        );
        if (expired.isEmpty()) {
            return;
        }
        expired.forEach(listing -> listing.setStatus(ListingStatus.CLOSED));
        listingRepository.saveAll(expired);
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private boolean canViewContactInfo(Listing listing, Profile viewerProfile) {
        if (viewerProfile == null) {
            return false;
        }
        if (listing.getOwnerProfile().getId().equals(viewerProfile.getId())) {
            return true;
        }
        return listingReplyRepository.existsByListing_IdAndResponderProfile_IdAndStatus(
                listing.getId(),
                viewerProfile.getId(),
                ListingReplyStatus.ACCEPTED
        );
    }

    /** Статус отклика текущего зрителя на этот листинг (null — не откликался или это владелец). */
    private ListingReplyStatus viewerReplyStatus(Listing listing, Profile viewerProfile) {
        if (viewerProfile == null || listing.getOwnerProfile().getId().equals(viewerProfile.getId())) {
            return null;
        }
        return listingReplyRepository.findByListing_IdAndResponderProfile_Id(listing.getId(), viewerProfile.getId())
                .map(reply -> reply.getStatus())
                .orElse(null);
    }

    private ListingResponse map(
            Listing listing,
            boolean includeContactInfo,
            boolean contactVisibleForMe,
            ListingReplyStatus myReplyStatus
    ) {
        return new ListingResponse(
                listing.getId(),
                listing.getOwnerProfile().getId(),
                listing.getType(),
                listing.getStatus(),
                listing.getTitle(),
                listing.getDescription(),
                includeContactInfo ? listing.getContactInfo() : null,
                contactVisibleForMe,
                Set.copyOf(listing.getTags()),
                listing.getCity(),
                listing.getFormat(),
                listing.getPriceFrom(),
                listing.getPriceTo(),
                listing.getCurrency(),
                listing.getExpiresAt(),
                listing.isManualCloseOnly(),
                listing.getCreatedAt(),
                listing.getUpdatedAt(),
                myReplyStatus
        );
    }
}
