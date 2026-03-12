package com.sportnis.service;

import com.sportnis.api.listing.dto.ListingCreateRequest;
import com.sportnis.api.listing.dto.ListingResponse;
import com.sportnis.api.listing.dto.ListingUpdateRequest;
import com.sportnis.entity.enums.ListingStatus;
import com.sportnis.entity.enums.ListingType;
import com.sportnis.entity.listing.Listing;
import com.sportnis.entity.profile.Profile;
import com.sportnis.entity.user.User;
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

    private final ListingRepository listingRepository;
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ListingService(
            ListingRepository listingRepository,
            ProfileRepository profileRepository,
            UserRepository userRepository
    ) {
        this.listingRepository = listingRepository;
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ListingResponse createMyListing(UUID userId, ListingCreateRequest request) {
        Profile ownerProfile = findActiveProfile(userId);
        validateExpiresAt(request.manualCloseOnly(), request.expiresAt());

        Listing listing = new Listing();
        listing.setOwnerProfile(ownerProfile);
        listing.setType(request.type());
        listing.setStatus(ListingStatus.PUBLISHED);
        listing.setTitle(request.title().trim());
        listing.setDescription(request.description().trim());
        listing.setTags(new HashSet<>(request.tags() == null ? Set.of() : request.tags()));
        listing.setCity(blankToNull(request.city()));
        listing.setFormat(request.format());
        listing.setPriceFrom(request.priceFrom());
        listing.setPriceTo(request.priceTo());
        listing.setCurrency(CURRENCY_RUB);
        listing.setExpiresAt(request.expiresAt());
        listing.setManualCloseOnly(request.manualCloseOnly());

        Listing saved = listingRepository.save(listing);
        return map(saved);
    }

    @Transactional
    public List<ListingResponse> listMyListings(UUID userId) {
        closeExpiredListings();
        Profile ownerProfile = findActiveProfile(userId);
        return listingRepository.findAllByOwnerProfile_IdOrderByCreatedAtDesc(ownerProfile.getId()).stream()
                .map(this::map)
                .toList();
    }

    @Transactional
    public ListingResponse getMyListing(UUID userId, UUID listingId) {
        closeExpiredListings();
        Profile ownerProfile = findActiveProfile(userId);
        Listing listing = listingRepository.findByIdAndOwnerProfile_Id(listingId, ownerProfile.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        return map(listing);
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

        validateExpiresAt(request.manualCloseOnly(), request.expiresAt());

        listing.setTitle(request.title().trim());
        listing.setDescription(request.description().trim());
        listing.setTags(new HashSet<>(request.tags() == null ? Set.of() : request.tags()));
        listing.setCity(blankToNull(request.city()));
        listing.setFormat(request.format());
        listing.setPriceFrom(request.priceFrom());
        listing.setPriceTo(request.priceTo());
        listing.setCurrency(CURRENCY_RUB);
        listing.setExpiresAt(request.expiresAt());
        listing.setManualCloseOnly(request.manualCloseOnly());

        Listing saved = listingRepository.save(listing);
        return map(saved);
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
        return map(listingRepository.save(listing));
    }

    @Transactional
    public ListingResponse closeMyListing(UUID userId, UUID listingId) {
        closeExpiredListings();
        Profile ownerProfile = findActiveProfile(userId);
        Listing listing = listingRepository.findByIdAndOwnerProfile_Id(listingId, ownerProfile.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        listing.setStatus(ListingStatus.CLOSED);
        return map(listingRepository.save(listing));
    }

    @Transactional
    public List<ListingResponse> listPublicListings(ListingType type) {
        closeExpiredListings();
        List<Listing> listings = type == null
                ? listingRepository.findAllByStatusOrderByCreatedAtDesc(ListingStatus.PUBLISHED)
                : listingRepository.findAllByStatusAndTypeOrderByCreatedAtDesc(ListingStatus.PUBLISHED, type);
        return listings.stream().map(this::map).toList();
    }

    @Transactional
    public ListingResponse getPublicListing(UUID listingId) {
        closeExpiredListings();
        Listing listing = listingRepository.findByIdAndStatus(listingId, ListingStatus.PUBLISHED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        return map(listing);
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

    private ListingResponse map(Listing listing) {
        return new ListingResponse(
                listing.getId(),
                listing.getOwnerProfile().getId(),
                listing.getType(),
                listing.getStatus(),
                listing.getTitle(),
                listing.getDescription(),
                Set.copyOf(listing.getTags()),
                listing.getCity(),
                listing.getFormat(),
                listing.getPriceFrom(),
                listing.getPriceTo(),
                listing.getCurrency(),
                listing.getExpiresAt(),
                listing.isManualCloseOnly(),
                listing.getCreatedAt(),
                listing.getUpdatedAt()
        );
    }
}
