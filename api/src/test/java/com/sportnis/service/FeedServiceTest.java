package com.sportnis.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.sportnis.api.feed.dto.FeedItemType;
import com.sportnis.api.feed.dto.FeedResponse;
import com.sportnis.entity.enums.ListingFormat;
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
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class FeedServiceTest {

    @Mock
    private ListingRepository listingRepository;
    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private ConsumerDetailsRepository consumerDetailsRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FeedService feedService;

    @Test
    void guestGetsMixedFeedSortedByCreatedAtDesc() {
        Profile consumerProfile = buildConsumerProfile("Consumer One", "Moscow", Set.of("running"), Instant.parse("2026-03-17T10:00:00Z"));
        Listing listing = buildProviderListing("Football Group", "Moscow", Set.of("football"), Instant.parse("2026-03-17T12:00:00Z"));

        when(consumerDetailsRepository.findAllByProfile_IsPublicTrueAndIsLookingForTrueOrderByProfile_CreatedAtDesc())
                .thenReturn(List.of(buildConsumerDetails(consumerProfile, true)));
        when(listingRepository.findAllByStatusAndTypeOrderByCreatedAtDesc(ListingStatus.PUBLISHED, ListingType.OFFER))
                .thenReturn(List.of(listing));

        FeedResponse response = feedService.getFeed(null, 0, 20, null, null);

        assertEquals(2, response.items().size());
        assertEquals(2, response.total());
        assertEquals(FeedItemType.PROVIDER_LISTING, response.items().get(0).itemType());
        assertEquals(FeedItemType.CONSUMER_PROFILE, response.items().get(1).itemType());
    }

    @Test
    void consumerGetsOnlyProviderListings() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile activeProfile = new Profile();
        ReflectionTestUtils.setField(activeProfile, "id", profileId);
        activeProfile.setUser(user);
        activeProfile.setProfileType(ProfileType.CONSUMER);

        Listing listing = buildProviderListing("Tennis Group", "Moscow", Set.of("tennis"), Instant.parse("2026-03-17T12:00:00Z"));

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(activeProfile));
        when(listingRepository.findAllByStatusAndTypeOrderByCreatedAtDesc(ListingStatus.PUBLISHED, ListingType.OFFER))
                .thenReturn(List.of(listing));

        FeedResponse response = feedService.getFeed(userId, 0, 20, null, null);

        assertEquals(1, response.items().size());
        assertEquals(FeedItemType.PROVIDER_LISTING, response.items().get(0).itemType());
    }

    @Test
    void providerGetsOnlySearchingConsumerProfiles() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        user.setActiveProfileId(profileId);

        Profile activeProfile = new Profile();
        ReflectionTestUtils.setField(activeProfile, "id", profileId);
        activeProfile.setUser(user);
        activeProfile.setProfileType(ProfileType.PROVIDER);

        Profile consumerProfile = buildConsumerProfile("Runner", "Moscow", Set.of("running"), Instant.parse("2026-03-17T10:00:00Z"));

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByIdAndUser_Id(profileId, userId)).thenReturn(Optional.of(activeProfile));
        when(consumerDetailsRepository.findAllByProfile_IsPublicTrueAndIsLookingForTrueOrderByProfile_CreatedAtDesc())
                .thenReturn(List.of(buildConsumerDetails(consumerProfile, true)));

        FeedResponse response = feedService.getFeed(userId, 0, 20, null, null);

        assertEquals(1, response.items().size());
        assertEquals(FeedItemType.CONSUMER_PROFILE, response.items().get(0).itemType());
    }

    @Test
    void feedAppliesTagAndCityFiltersAndPagination() {
        Profile first = buildConsumerProfile("Runner One", "Moscow", Set.of("running"), Instant.parse("2026-03-17T10:00:00Z"));
        Profile second = buildConsumerProfile("Runner Two", "Moscow", Set.of("running"), Instant.parse("2026-03-17T09:00:00Z"));
        Listing listing = buildProviderListing("Football Group", "Saint Petersburg", Set.of("football"), Instant.parse("2026-03-17T12:00:00Z"));

        when(consumerDetailsRepository.findAllByProfile_IsPublicTrueAndIsLookingForTrueOrderByProfile_CreatedAtDesc())
                .thenReturn(List.of(buildConsumerDetails(first, true), buildConsumerDetails(second, true)));
        when(listingRepository.findAllByStatusAndTypeOrderByCreatedAtDesc(ListingStatus.PUBLISHED, ListingType.OFFER))
                .thenReturn(List.of(listing));

        FeedResponse response = feedService.getFeed(null, 0, 1, "Moscow", "running");

        assertEquals(1, response.items().size());
        assertEquals(2, response.total());
        assertTrue(response.hasNext());
        assertEquals("Runner One", response.items().get(0).title());
    }

    @Test
    void feedReturnsHasNextFalseOnLastPage() {
        Profile consumerProfile = buildConsumerProfile("Consumer One", "Moscow", Set.of("running"), Instant.parse("2026-03-17T10:00:00Z"));

        when(consumerDetailsRepository.findAllByProfile_IsPublicTrueAndIsLookingForTrueOrderByProfile_CreatedAtDesc())
                .thenReturn(List.of(buildConsumerDetails(consumerProfile, true)));
        when(listingRepository.findAllByStatusAndTypeOrderByCreatedAtDesc(ListingStatus.PUBLISHED, ListingType.OFFER))
                .thenReturn(List.of());

        FeedResponse response = feedService.getFeed(null, 0, 20, null, null);

        assertFalse(response.hasNext());
        assertEquals(1, response.total());
    }

    private Profile buildConsumerProfile(String displayName, String city, Set<String> tags, Instant createdAt) {
        Profile profile = new Profile();
        ReflectionTestUtils.setField(profile, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(profile, "createdAt", createdAt);
        profile.setUser(new User());
        profile.setProfileType(ProfileType.CONSUMER);
        profile.setDisplayName(displayName);
        profile.setCity(city);
        profile.setSportsTags(tags);
        profile.setPublic(true);
        return profile;
    }

    private ConsumerDetails buildConsumerDetails(Profile profile, boolean isLookingFor) {
        ConsumerDetails details = new ConsumerDetails();
        ReflectionTestUtils.setField(details, "profileId", profile.getId());
        details.setProfile(profile);
        details.setLookingFor(isLookingFor);
        return details;
    }

    private Listing buildProviderListing(String title, String city, Set<String> tags, Instant createdAt) {
        Profile owner = new Profile();
        ReflectionTestUtils.setField(owner, "id", UUID.randomUUID());
        owner.setProfileType(ProfileType.PROVIDER);
        owner.setDisplayName("Provider Name");
        owner.setAvatarUrl("https://cdn.example.com/provider.png");
        owner.setCity(city);

        Listing listing = new Listing();
        ReflectionTestUtils.setField(listing, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(listing, "createdAt", createdAt);
        listing.setOwnerProfile(owner);
        listing.setType(ListingType.OFFER);
        listing.setStatus(ListingStatus.PUBLISHED);
        listing.setTitle(title);
        listing.setDescription("Description");
        listing.setCity(city);
        listing.setTags(tags);
        listing.setFormat(ListingFormat.OFFLINE);
        listing.setPriceFrom(BigDecimal.valueOf(2500));
        listing.setPriceTo(BigDecimal.valueOf(5000));
        listing.setCurrency("RUB");
        return listing;
    }
}
