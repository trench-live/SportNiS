package com.sportnis.repository.listing;

import com.sportnis.entity.listing.Listing;
import com.sportnis.entity.enums.ListingStatus;
import com.sportnis.entity.enums.ListingType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingRepository extends JpaRepository<Listing, UUID> {

    Optional<Listing> findByIdAndOwnerProfile_Id(UUID listingId, UUID ownerProfileId);

    List<Listing> findAllByOwnerProfile_IdOrderByCreatedAtDesc(UUID ownerProfileId);

    long countByOwnerProfile_Id(UUID ownerProfileId);

    List<Listing> findAllByStatusOrderByCreatedAtDesc(ListingStatus status);

    List<Listing> findAllByStatusAndTypeOrderByCreatedAtDesc(ListingStatus status, ListingType type);

    Optional<Listing> findByIdAndStatus(UUID listingId, ListingStatus status);

    boolean existsByOwnerProfile_IdAndStatusAndTypeAndTitleIgnoreCaseAndDescriptionIgnoreCase(
            UUID ownerProfileId,
            ListingStatus status,
            ListingType type,
            String title,
            String description
    );

    boolean existsByOwnerProfile_IdAndStatusAndTypeAndIdNotAndTitleIgnoreCaseAndDescriptionIgnoreCase(
            UUID ownerProfileId,
            ListingStatus status,
            ListingType type,
            UUID listingId,
            String title,
            String description
    );

    List<Listing> findAllByStatusAndManualCloseOnlyFalseAndExpiresAtLessThanEqual(
            ListingStatus status,
            Instant now
    );
}
