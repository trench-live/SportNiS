package com.sportnis.entity.listing;

import com.sportnis.entity.common.BaseEntity;
import com.sportnis.entity.enums.ListingFormat;
import com.sportnis.entity.enums.ListingStatus;
import com.sportnis.entity.enums.ListingType;
import com.sportnis.entity.profile.Profile;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "listings")
public class Listing extends BaseEntity {

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_profile_id", nullable = false)
    private Profile ownerProfile;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 32)
    private ListingType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ListingStatus status = ListingStatus.PUBLISHED;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", nullable = false)
    private String description;

    @ElementCollection
    @CollectionTable(name = "listing_tags", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "tag", nullable = false, length = 80)
    private Set<String> tags = new HashSet<>();

    @Column(name = "city", length = 120)
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(name = "format", nullable = false, length = 32)
    private ListingFormat format;

    @Column(name = "price_from", precision = 12, scale = 2)
    private BigDecimal priceFrom;

    @Column(name = "price_to", precision = 12, scale = 2)
    private BigDecimal priceTo;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "RUB";

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "manual_close_only", nullable = false)
    private boolean manualCloseOnly = false;
}
