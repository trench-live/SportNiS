package com.sportnis.repository.listing;

import com.sportnis.entity.enums.ListingReplyStatus;
import com.sportnis.entity.listing.ListingReply;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingReplyRepository extends JpaRepository<ListingReply, UUID> {

    boolean existsByListing_IdAndResponderProfile_Id(UUID listingId, UUID responderProfileId);

    boolean existsByListing_IdAndResponderProfile_IdAndStatus(UUID listingId, UUID responderProfileId, ListingReplyStatus status);

    List<ListingReply> findAllByListing_IdOrderByCreatedAtDesc(UUID listingId);

    Optional<ListingReply> findByIdAndListing_Id(UUID replyId, UUID listingId);
}
