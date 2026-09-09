package com.sportnis.service;

import com.sportnis.api.feed.dto.FeedItemResponse;
import com.sportnis.api.feed.dto.FeedItemType;
import com.sportnis.api.feed.dto.FeedResponse;
import com.sportnis.entity.enums.ListingStatus;
import com.sportnis.entity.enums.ListingType;
import com.sportnis.entity.enums.ProfileType;
import com.sportnis.entity.listing.Listing;
import com.sportnis.entity.profile.Profile;
import com.sportnis.entity.profile.details.ConsumerDetails;
import com.sportnis.entity.user.User;
import com.sportnis.repository.listing.ListingRepository;
import com.sportnis.repository.profile.ProfileRepository;
import com.sportnis.repository.profile.details.ConsumerDetailsRepository;
import com.sportnis.repository.user.UserRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FeedService {

    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    private final ListingRepository listingRepository;
    private final ProfileRepository profileRepository;
    private final ConsumerDetailsRepository consumerDetailsRepository;
    private final UserRepository userRepository;

    public FeedService(
            ListingRepository listingRepository,
            ProfileRepository profileRepository,
            ConsumerDetailsRepository consumerDetailsRepository,
            UserRepository userRepository
    ) {
        this.listingRepository = listingRepository;
        this.profileRepository = profileRepository;
        this.consumerDetailsRepository = consumerDetailsRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public FeedResponse getFeed(UUID currentUserId, Integer page, Integer size, String city, String tag) {
        int resolvedPage = page == null ? 0 : page;
        int resolvedSize = size == null ? DEFAULT_SIZE : size;
        validatePaging(resolvedPage, resolvedSize);

        ProfileType viewerProfileType = resolveViewerProfileType(currentUserId);
        List<FeedItemResponse> items = loadFeedItems(viewerProfileType);

        List<FeedItemResponse> filtered = items.stream()
                .filter(item -> matchesCity(item, city))
                .filter(item -> matchesTag(item, tag))
                .sorted(Comparator.comparing(FeedItemResponse::createdAt).reversed())
                .toList();

        int fromIndex = Math.min(resolvedPage * resolvedSize, filtered.size());
        int toIndex = Math.min(fromIndex + resolvedSize, filtered.size());
        List<FeedItemResponse> pageItems = filtered.subList(fromIndex, toIndex);

        return new FeedResponse(
                pageItems,
                filtered.size(),
                resolvedPage,
                resolvedSize,
                toIndex < filtered.size()
        );
    }

    private void validatePaging(int page, int size) {
        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "page must be >= 0");
        }
        if (size <= 0 || size > MAX_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "size must be between 1 and " + MAX_SIZE);
        }
    }

    private ProfileType resolveViewerProfileType(UUID currentUserId) {
        if (currentUserId == null) {
            return null;
        }
        User user = userRepository.findById(currentUserId).orElse(null);
        if (user == null) {
            return null;
        }
        Profile activeProfile = resolveActiveProfile(user);
        return activeProfile.getProfileType();
    }

    private Profile resolveActiveProfile(User user) {
        if (user.getActiveProfileId() != null) {
            return profileRepository.findByIdAndUser_Id(user.getActiveProfileId(), user.getId())
                    .orElseGet(() -> assignFirstProfileAsActive(user));
        }
        return assignFirstProfileAsActive(user);
    }

    private Profile assignFirstProfileAsActive(User user) {
        return profileRepository.findFirstByUser_IdOrderByCreatedAtAsc(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
    }

    private List<FeedItemResponse> loadFeedItems(ProfileType viewerProfileType) {
        if (viewerProfileType == null) {
            return loadGuestItems();
        }
        return switch (viewerProfileType) {
            case CONSUMER -> mapListings(loadProviderListings());
            case PROVIDER -> mapProfiles(loadSearchingConsumerProfiles());
        };
    }

    private List<FeedItemResponse> loadGuestItems() {
        List<FeedItemResponse> items = new ArrayList<>();
        items.addAll(mapProfiles(loadSearchingConsumerProfiles()));
        items.addAll(mapListings(loadProviderListings()));
        return items;
    }

    private List<Profile> loadSearchingConsumerProfiles() {
        return consumerDetailsRepository.findAllByIsLookingForTrueOrderByProfile_CreatedAtDesc()
                .stream()
                .map(ConsumerDetails::getProfile)
                .toList();
    }

    private List<Listing> loadProviderListings() {
        return listingRepository.findAllByStatusAndTypeOrderByCreatedAtDesc(ListingStatus.PUBLISHED, ListingType.OFFER);
    }

    private List<FeedItemResponse> mapProfiles(List<Profile> profiles) {
        return profiles.stream()
                .map(profile -> new FeedItemResponse(
                        FeedItemType.CONSUMER_PROFILE,
                        profile.getId(),
                        profile.getId(),
                        profile.getProfileType(),
                        profile.getDisplayName(),
                        profile.getAbout(),
                        null,
                        profile.getAvatarUrl(),
                        profile.getCity(),
                        Set.copyOf(profile.getSportsTags()),
                        null,
                        null,
                        null,
                        null,
                        profile.getCreatedAt()
                ))
                .toList();
    }

    private List<FeedItemResponse> mapListings(List<Listing> listings) {
        return listings.stream()
                .map(listing -> new FeedItemResponse(
                        FeedItemType.PROVIDER_LISTING,
                        listing.getId(),
                        listing.getOwnerProfile().getId(),
                        listing.getOwnerProfile().getProfileType(),
                        listing.getTitle(),
                        listing.getDescription(),
                        listing.getOwnerProfile().getDisplayName(),
                        listing.getOwnerProfile().getAvatarUrl(),
                        listing.getCity() != null ? listing.getCity() : listing.getOwnerProfile().getCity(),
                        Set.copyOf(listing.getTags()),
                        listing.getFormat(),
                        listing.getPriceFrom(),
                        listing.getPriceTo(),
                        listing.getCurrency(),
                        listing.getCreatedAt()
                ))
                .toList();
    }

    private boolean matchesCity(FeedItemResponse item, String city) {
        if (city == null || city.isBlank()) {
            return true;
        }
        if (item.city() == null) {
            return false;
        }
        return item.city().trim().equalsIgnoreCase(city.trim());
    }

    private boolean matchesTag(FeedItemResponse item, String tag) {
        if (tag == null || tag.isBlank()) {
            return true;
        }
        String normalizedTag = tag.trim().toLowerCase(Locale.ROOT);
        return item.tags().stream()
                .map(value -> value.toLowerCase(Locale.ROOT))
                .anyMatch(normalizedTag::equals);
    }
}
